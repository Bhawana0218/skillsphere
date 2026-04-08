import Dispute from "../models/Dispute.js";
import Job from "../models/Job.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

const buildEvidenceLinks = (files = []) => {
  return files.map((file) => `/uploads/disputes/${file.filename}`);
};

const parsePriority = (amountInDispute) => {
  if (amountInDispute >= 100000) return "high";
  if (amountInDispute >= 25000) return "medium";
  return "low";
};

export const getDisputePaymentOptions = async (req, res) => {
  try {
    const paymentFilter =
      req.user.role === "client"
        ? { client: req.user._id }
        : req.user.role === "freelancer"
        ? { freelancer: req.user._id }
        : null;

    if (!paymentFilter) {
      return res.status(403).json({ message: "Only client or freelancer can file disputes." });
    }

    const payments = await Payment.find(paymentFilter)
      .populate("client", "name email")
      .populate("freelancer", "name email")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .limit(60);

    res.json(
      payments.map((payment) => ({
        _id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        transactionType: payment.transactionType,
        createdAt: payment.createdAt,
        job: payment.job,
        client: payment.client,
        freelancer: payment.freelancer,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fileDispute = async (req, res) => {
  try {
    const {
      paymentId,
      jobId,
      againstId,
      issueTitle,
      category = "other",
      amountInDispute = 0,
      description,
    } = req.body;

    if (!issueTitle || !description) {
      return res.status(400).json({ message: "issueTitle and description are required" });
    }

    let job = null;
    let payment = null;
    let targetAgainstId = againstId || null;

    if (paymentId) {
      payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const isClient = String(payment.client) === String(req.user._id);
      const isFreelancer = String(payment.freelancer) === String(req.user._id);

      if (!isClient && !isFreelancer) {
        return res.status(403).json({ message: "You are not a participant in this payment" });
      }

      targetAgainstId = isClient ? payment.freelancer : payment.client;
      if (payment.job) {
        job = await Job.findById(payment.job);
      }
    }

    if (!job && jobId) {
      job = await Job.findById(jobId);
    }

    if (!job) {
      return res.status(400).json({ message: "A valid job reference is required for dispute filing" });
    }

    if (!targetAgainstId) {
      return res.status(400).json({ message: "Unable to identify dispute target user" });
    }

    if (String(targetAgainstId) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot file a dispute against yourself" });
    }

    const amountValue = Number(amountInDispute) || Number(payment?.amount) || 0;
    const openDisputeFilter = {
      filedBy: req.user._id,
      status: { $in: ["Pending", "In Review"] },
      ...(payment?._id ? { payment: payment._id } : { job: job._id, against: targetAgainstId }),
    };
    const openDispute = await Dispute.findOne(openDisputeFilter);

    if (openDispute) {
      return res.status(400).json({ message: "You already have an active dispute for this payment" });
    }

    const evidenceFiles = buildEvidenceLinks(req.files || []);
    const dispute = await Dispute.create({
      job: job._id,
      payment: payment?._id || null,
      filedBy: req.user._id,
      against: targetAgainstId,
      issueTitle: String(issueTitle).trim(),
      category,
      description: String(description).trim(),
      evidence: evidenceFiles,
      amountInDispute: amountValue,
      priority: parsePriority(amountValue),
    });

    const admins = await User.find({ role: "admin", isSuspended: false }).select("_id");
    await Promise.all(
      admins.map((admin) =>
        createNotification(
          admin._id,
          "dispute",
          `New dispute filed: ${dispute.issueTitle}`,
          "/admin/disputes"
        )
      )
    );

    const populated = await Dispute.findById(dispute._id)
      .populate("filedBy", "name email role")
      .populate("against", "name email role")
      .populate("job", "title status")
      .populate("payment", "amount status currency transactionType createdAt");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markDisputeInReview = async (req, res) => {
  try {
    const { adminNotes = "" } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    if (dispute.status === "Resolved" || dispute.status === "Rejected") {
      return res.status(400).json({ message: "Resolved disputes cannot be moved to review" });
    }

    dispute.status = "In Review";
    dispute.adminMediator = req.user._id;
    if (adminNotes) dispute.adminNotes = String(adminNotes).trim();
    await dispute.save();

    await Promise.all([
      createNotification(dispute.filedBy, "dispute", "Your dispute is now in admin review", "/disputes"),
      createNotification(dispute.against, "dispute", "A dispute involving you is in review", "/disputes"),
    ]);

    const populated = await Dispute.findById(dispute._id)
      .populate("filedBy", "name email role")
      .populate("against", "name email role")
      .populate("adminMediator", "name email")
      .populate("job", "title status")
      .populate("payment", "amount status currency transactionType createdAt");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { resolution, resolutionType = "other", adminNotes = "", status = "Resolved" } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    if (!resolution || !String(resolution).trim()) {
      return res.status(400).json({ message: "Resolution summary is required" });
    }

    if (!["Resolved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be Resolved or Rejected" });
    }

    dispute.status = status;
    dispute.resolution = String(resolution).trim();
    dispute.resolutionType = resolutionType;
    dispute.adminMediator = req.user._id;
    dispute.adminNotes = String(adminNotes || dispute.adminNotes || "").trim();
    dispute.resolvedAt = new Date();
    await dispute.save();

    const finalMessage =
      status === "Resolved"
        ? `Your dispute was resolved: ${dispute.resolutionType || "decision updated"}`
        : "Your dispute was reviewed and closed";

    await Promise.all([
      createNotification(dispute.filedBy, "dispute", finalMessage, "/disputes"),
      createNotification(
        dispute.against,
        "dispute",
        "A dispute involving your account has been closed by admin",
        "/disputes"
      ),
    ]);

    const populated = await Dispute.findById(dispute._id)
      .populate("filedBy", "name email role")
      .populate("against", "name email role")
      .populate("adminMediator", "name email")
      .populate("job", "title status")
      .populate("payment", "amount status currency transactionType createdAt");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDisputes = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && typeof status === "string") {
      filter.status = status;
    }

    const disputes = await Dispute.find(filter)
      .populate("filedBy", "name email role")
      .populate("against", "name email role")
      .populate("adminMediator", "name email")
      .populate("job", "title status")
      .populate("payment", "amount status currency transactionType createdAt")
      .sort({ createdAt: -1 });

    const summary = {
      total: disputes.length,
      pending: disputes.filter((item) => item.status === "Pending").length,
      inReview: disputes.filter((item) => item.status === "In Review").length,
      resolved: disputes.filter((item) => item.status === "Resolved").length,
      rejected: disputes.filter((item) => item.status === "Rejected").length,
    };

    res.json({ summary, disputes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ filedBy: req.user._id }, { against: req.user._id }],
    })
      .populate("filedBy", "name email role")
      .populate("against", "name email role")
      .populate("adminMediator", "name email")
      .populate("job", "title status")
      .populate("payment", "amount status currency transactionType createdAt")
      .sort({ createdAt: -1 });

    const summary = {
      total: disputes.length,
      pending: disputes.filter((item) => item.status === "Pending").length,
      inReview: disputes.filter((item) => item.status === "In Review").length,
      resolved: disputes.filter((item) => item.status === "Resolved").length,
      rejected: disputes.filter((item) => item.status === "Rejected").length,
    };

    res.json({ summary, disputes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
