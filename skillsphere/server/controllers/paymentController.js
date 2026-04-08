import { razorpay } from "../utils/razorpay.js";
import crypto from "crypto";
import Payment from "../models/Payment.js";

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", jobId, freelancerId, milestoneTitle } = req.body;

    if (!amount || !jobId || !freelancerId) {
      return res.status(400).json({ message: "Missing required fields for order creation." });
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${jobId}_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      client: req.user._id,
      freelancer: freelancerId,
      job: jobId,
      amount,
      currency,
      status: "pending",
      channel: "razorpay",
      transactionType: "escrow",
      description: milestoneTitle || "Escrow payment",
      razorpayOrderId: order.id,
    });

    res.status(201).json({ order, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_SECRET_KEY ||
        process.env.RAZORPAY_KEY_SECRET ||
        process.env.RAZORPAY_SECRET
    )
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (payment) {
      payment.status = "completed";
      payment.transactionId = razorpay_payment_id;
      payment.razorpayPaymentId = razorpay_payment_id;
      await payment.save();
    }
    return res.json({ status: "success", payment });
  } else {
    return res.status(400).json({ status: "failed" });
  }
};

export const createEscrow = async (req, res) => {
  try {
    const { jobId, freelancerId, amount, milestoneTitle, currency = "INR" } = req.body;

    if (!jobId || !freelancerId || !amount) {
      return res.status(400).json({ message: "Missing required escrow information." });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `escrow_${jobId}_${Date.now()}`,
      payment_capture: 1,
    });

    const payment = await Payment.create({
      client: req.user._id,
      freelancer: freelancerId,
      job: jobId,
      amount,
      currency,
      status: "pending",
      channel: "razorpay",
      transactionType: "escrow",
      milestoneTitle,
      description: `Escrow for ${milestoneTitle || "project"}`,
      razorpayOrderId: order.id,
    });

    res.status(201).json({ order, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const releaseMilestone = async (req, res) => {
  try {
    const { jobId, freelancerId, amount, milestoneTitle } = req.body;

    if (!jobId || !freelancerId || !amount || !milestoneTitle) {
      return res.status(400).json({ message: "Missing milestone release details." });
    }

    const payment = await Payment.create({
      client: req.user._id,
      freelancer: freelancerId,
      job: jobId,
      amount,
      currency: "INR",
      status: "completed",
      channel: "manual",
      transactionType: "milestone",
      milestoneTitle,
      description: `Milestone released: ${milestoneTitle}`,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const payoutFreelancer = async (req, res) => {
  try {
    const { jobId, freelancerId, amount, currency = "INR" } = req.body;

    if (!jobId || !freelancerId || !amount) {
      return res.status(400).json({ message: "Missing payout details." });
    }

    const payment = await Payment.create({
      client: req.user._id,
      freelancer: freelancerId,
      job: jobId,
      amount,
      currency,
      status: "completed",
      channel: "manual",
      transactionType: "payout",
      description: "Automatic freelancer payout",
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    if (!paymentId || !amount || !reason) {
      return res.status(400).json({ message: "Refund requires payment ID, amount, and reason." });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Original payment not found." });
    }

    payment.status = "refunded";
    payment.refundAmount = amount;
    payment.refundReason = reason;
    await payment.save();

    const refundRecord = await Payment.create({
      client: req.user._id,
      freelancer: payment.freelancer,
      job: payment.job,
      amount: -Math.abs(amount),
      currency: payment.currency,
      status: "completed",
      channel: "manual",
      transactionType: "refund",
      description: `Refund: ${reason}`,
      refundReason: reason,
      refundAmount: amount,
    });

    res.status(201).json({ payment, refundRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ client: req.user._id })
      .populate("freelancer", "name")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
