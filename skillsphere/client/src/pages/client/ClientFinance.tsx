import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Clock,
  Star,
  RefreshCcw,
  FileText,
  UserCheck,
} from "lucide-react";

interface Transaction {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  transactionType: string;
  description?: string;
  transactionId?: string;
  createdAt: string;
  freelancer?: { name?: string } | string;
  job?: { title?: string } | string;
}

interface ReviewAnalytics {
  weightedReputation: number;
  averageRating: number;
  totalReviews: number;
  verifiedReviews: number;
  fraudRisk: number;
  fraudReviews: number;
  ratingDistribution: { rating: number; count: number }[];
}

interface ReviewItem {
  _id: string;
  reviewer?: { name: string };
  rating: number;
  comment: string;
  isVerifiedReview: boolean;
  fraudScore: number;
}

const ClientFinance = () => {
  const [jobId, setJobId] = useState("");
  const [freelancerId, setFreelancerId] = useState("");
  const [escrowAmount, setEscrowAmount] = useState(0);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState(0);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [refundPaymentId, setRefundPaymentId] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");
  const [reviewFreelancerId, setReviewFreelancerId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [reviewAnalytics, setReviewAnalytics] = useState<ReviewAnalytics | null>(null);
  const [reviewList, setReviewList] = useState<ReviewItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const pendingCount = useMemo(
    () => transactionHistory.filter((item) => item.status === "pending").length,
    [transactionHistory]
  );
  const completedCount = useMemo(
    () => transactionHistory.filter((item) => item.status === "completed").length,
    [transactionHistory]
  );

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  useEffect(() => {
    if (reviewFreelancerId) {
      loadReviewAnalytics(reviewFreelancerId);
      loadReviewList(reviewFreelancerId);
    }
  }, [reviewFreelancerId]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/payments/history");
      setTransactionHistory(response.data || []);
    } catch (error) {
      console.error(error);
      setStatusMessage("Unable to load transaction history. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadReviewAnalytics = async (freelancerIdValue: string) => {
    try {
      const response = await api.get(`/reviews/analytics/${freelancerIdValue}`);
      setReviewAnalytics(response.data);
    } catch (error) {
      console.error(error);
      setReviewAnalytics(null);
    }
  };

  const loadReviewList = async (freelancerIdValue: string) => {
    try {
      const response = await api.get(`/reviews/${freelancerIdValue}`);
      setReviewList(response.data || []);
    } catch (error) {
      console.error(error);
      setReviewList([]);
    }
  };

  const clearStatus = () => {
    setStatusMessage(null);
  };

  const startEscrow = async () => {
    if (!jobId || !freelancerId || !escrowAmount) {
      setStatusMessage("Enter job, freelancer and escrow amount to continue.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/payments/create-escrow", {
        jobId,
        freelancerId,
        amount: escrowAmount,
        milestoneTitle: milestoneTitle || "Initial escrow",
      });
      setStatusMessage("Escrow created successfully. Release the milestone when ready.");
      setEscrowAmount(0);
      loadPaymentHistory();
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to create escrow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const releaseMilestone = async () => {
    if (!jobId || !freelancerId || !milestoneAmount || !milestoneTitle) {
      setStatusMessage("Provide job, freelancer, milestone title and amount before releasing.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/payments/release-milestone", {
        jobId,
        freelancerId,
        amount: milestoneAmount,
        milestoneTitle,
      });
      setStatusMessage("Milestone released successfully to the freelancer.");
      setMilestoneAmount(0);
      setMilestoneTitle("");
      loadPaymentHistory();
    } catch (error) {
      console.error(error);
      setStatusMessage("Unable to release milestone. Check details and retry.");
    } finally {
      setLoading(false);
    }
  };

  const payoutFreelancer = async () => {
    if (!jobId || !freelancerId || !payoutAmount) {
      setStatusMessage("Enter job, freelancer and payout amount to process the payout.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/payments/payout-freelancer", {
        jobId,
        freelancerId,
        amount: payoutAmount,
      });
      setStatusMessage("Freelancer payout processed successfully.");
      setPayoutAmount(0);
      loadPaymentHistory();
    } catch (error) {
      console.error(error);
      setStatusMessage("Payout request failed. Please check the details.");
    } finally {
      setLoading(false);
    }
  };

  const requestRefund = async () => {
    if (!refundPaymentId || !refundAmount || !refundReason) {
      setStatusMessage("Provide payment ID, refund amount and reason.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/payments/request-refund", {
        paymentId: refundPaymentId,
        amount: refundAmount,
        reason: refundReason,
      });
      setStatusMessage("Refund request submitted. The payment has been marked for refund.");
      setRefundAmount(0);
      setRefundReason("");
      setRefundPaymentId("");
      loadPaymentHistory();
    } catch (error) {
      console.error(error);
      setStatusMessage("Refund submission failed. Verify the payment ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!reviewFreelancerId || !jobId || !reviewComment) {
      setStatusMessage("Add freelancer ID, job ID and your review comment first.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/reviews", {
        freelancerId: reviewFreelancerId,
        jobId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setStatusMessage("Review submitted successfully. Reputation updated.");
      setReviewComment("");
      loadReviewAnalytics(reviewFreelancerId);
      loadReviewList(reviewFreelancerId);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to submit review. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-600 font-semibold">Funds & Reputation</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">
              Secure Escrow payments with milestone control
            </h1>
            <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
              Professional payment flows for clients and freelancers, with escrow, milestone release, automated payout simulation, refund handling, and reputation analytics.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/client/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
            >
              Open collaboration <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-6 rounded-3xl border border-cyan-300 bg-cyan-50 px-5 py-4 text-sm text-cyan-800 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <span>{statusMessage}</span>
              <button 
                onClick={clearStatus} 
                className="text-cyan-700 hover:text-cyan-900 font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <section className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-lg shadow-cyan-100/30">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-cyan-200 bg-cyan-50/50 p-5 transition hover:shadow-md hover:shadow-cyan-100/20">
                <div className="flex items-center gap-3 text-cyan-600">
                  <ShieldCheck className="h-6 w-6" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium">Escrow payment</p>
                    <p className="text-lg font-semibold text-slate-900">Create secure escrow funds</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm text-slate-600 font-medium">Job ID</label>
                  <input
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
                    placeholder="Enter job ID"
                  />
                  <label className="block text-sm text-slate-600 font-medium">Freelancer ID</label>
                  <input
                    value={freelancerId}
                    onChange={(e) => setFreelancerId(e.target.value)}
                    className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
                    placeholder="Enter freelancer ID"
                  />
                  <label className="block text-sm text-slate-600 font-medium">Escrow amount (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={escrowAmount || ""}
                    onChange={(e) => setEscrowAmount(Number(e.target.value))}
                    className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
                    placeholder="Enter amount"
                  />
                  <button
                    onClick={startEscrow}
                    disabled={loading}
                    className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98]"
                  >
                    {loading ? "Processing..." : "Create Escrow"}
                  </button>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-cyan-200 bg-cyan-50/50 p-5 transition hover:shadow-md hover:shadow-cyan-100/20">
                <div className="flex items-center gap-3 text-cyan-600">
                  <DollarSign className="h-6 w-6" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium">Milestone release</p>
                    <p className="text-lg font-semibold text-slate-900">Pay on delivery</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm text-slate-600 font-medium">Milestone title</label>
                  <input
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
                    placeholder="Enter milestone title"
                  />
                  <label className="block text-sm text-slate-600 font-medium">Release amount (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={milestoneAmount || ""}
                    onChange={(e) => setMilestoneAmount(Number(e.target.value))}
                    className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
                    placeholder="Enter amount"
                  />
                  <button
                    onClick={releaseMilestone}
                    disabled={loading}
                    className="w-full rounded-2xl bg-white border border-cyan-300 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98]"
                  >
                    {loading ? "Processing..." : "Release Milestone"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-5">
                <div className="flex items-center gap-3 text-cyan-600">
                  <Clock className="h-5 w-5" />
                  <p className="font-semibold uppercase tracking-[0.2em] text-slate-500">Escrow health</p>
                </div>
                <div className="mt-4 grid mx-auto gap-4 sm:grid-cols-3 text-sm">
                  <div className="rounded-3xl bg-white p-4 text-center border border-cyan-100 shadow-sm transition hover:shadow-md">
                    <p className="text-3xl font-bold text-cyan-600">{pendingCount}</p>
                    <p className="mt-2 text-xs uppercase tracking-widest text-slate-500 font-medium">Pending</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-center border border-cyan-100 shadow-sm transition hover:shadow-md">
                    <p className="text-3xl font-bold text-cyan-600">{completedCount}</p>
                    <p className="mt-2 mx-auto text-xs uppercase tracking-widest text-slate-500 font-medium">Completed</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-center border border-cyan-100 shadow-sm transition hover:shadow-md">
                    <p className="text-3xl font-bold text-cyan-600">{transactionHistory.length}</p>
                    <p className="mt-2 mx-auto text-xs uppercase tracking-widest text-slate-500 font-medium">Transactions</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-5">
                <div className="flex items-center gap-3 text-cyan-600">
                  <UserCheck className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Freelancer payout</p>
                </div>
                <div className="mt-4 space-y-3">
                  <label className="block text-sm text-slate-600 font-medium">Payout amount (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={payoutAmount || ""}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
                    placeholder="Enter payout amount"
                  />
                  <button
                    onClick={payoutFreelancer}
                    disabled={loading}
                    className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98]"
                  >
                    {loading ? "Processing..." : "Process Payout"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-lg shadow-cyan-100/30">
              <div className="flex items-center gap-3 text-cyan-600">
                <Star className="h-6 w-6" />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium">Smart reputation</p>
                  <p className="text-xl font-semibold text-slate-900">Reputation snapshot</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <div className="space-y-2 rounded-3xl border border-cyan-200 bg-cyan-50/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Freelancer ID for insights</p>
                  <input
                    value={reviewFreelancerId}
                    onChange={(e) => setReviewFreelancerId(e.target.value)}
                    placeholder="Enter freelancer ID"
                    className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-4 text-center shadow-sm transition hover:shadow-md">
                    <p className="text-3xl font-bold text-cyan-600">{reviewAnalytics?.averageRating?.toFixed(1) ?? "-"}</p>
                    <p className="mt-2 text-sm text-slate-600 font-medium">Average rating</p>
                  </div>
                  <div className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-4 text-center shadow-sm transition hover:shadow-md">
                    <p className="text-3xl font-bold text-cyan-600">{reviewAnalytics?.totalReviews ?? 0}</p>
                    <p className="mt-2 text-sm text-slate-600 font-medium">Reviews received</p>
                  </div>
                </div>
                <div className="mt-4 rounded-3xl border border-cyan-200 bg-cyan-50/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Weighted reputation</p>
                      <p className="text-2xl font-bold text-cyan-700">{reviewAnalytics ? reviewAnalytics.weightedReputation.toFixed(1) : "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 font-medium">Verified reviews</p>
                      <p className="text-lg font-semibold text-cyan-600">{reviewAnalytics?.verifiedReviews ?? 0}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4 text-slate-700 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Fraud risk</p>
                      <p className="mt-2 text-xl font-semibold text-red-600">{reviewAnalytics ? `${reviewAnalytics.fraudRisk}%` : "-"}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 text-slate-700 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Flagged reviews</p>
                      <p className="mt-2 text-xl font-semibold text-cyan-600">{reviewAnalytics?.fraudReviews ?? 0}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-3xl border border-cyan-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-700">Guarded review feed</p>
                    <button
                      type="button"
                      onClick={() => setShowVerifiedOnly((prev) => !prev)}
                      className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                    >
                      {showVerifiedOnly ? "All reviews" : "Verified only"}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                    {reviewAnalytics?.ratingDistribution.map((item) => (
                      <span key={item.rating} className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
                        {item.rating}★ {item.count}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-3xl border border-cyan-200 bg-cyan-50/50 p-4">
                  <p className="text-sm text-slate-600 font-medium">Review list</p>
                  <div className="mt-3 space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {reviewList.filter((item) => (showVerifiedOnly ? item.isVerifiedReview : true)).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No reviews match the selected filter.</p>
                    ) : (
                      reviewList
                        .filter((item) => (showVerifiedOnly ? item.isVerifiedReview : true))
                        .map((item) => (
                          <div key={item._id} className="rounded-2xl bg-white border border-cyan-100 px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:border-cyan-300 hover:shadow">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-semibold text-slate-900">{item.reviewer?.name || "Client"}</span>
                              <span className="text-cyan-600 font-bold">{item.rating}/5</span>
                            </div>
                            <p className="mt-2 text-slate-600">{item.comment}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.15em] text-slate-500">
                              <span className={item.isVerifiedReview ? "rounded-full bg-emerald-100 px-2 py-1 text-emerald-700" : "rounded-full bg-slate-100 px-2 py-1 text-slate-600"}>
                                {item.isVerifiedReview ? "Verified" : "Unverified"}
                              </span>
                              <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700">Fraud score {item.fraudScore.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-lg shadow-cyan-100/30">
              <div className="flex items-center gap-3 text-cyan-600">
                <RefreshCcw className="h-6 w-6" />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium">Refund & dispute</p>
                  <p className="text-lg font-semibold text-slate-900">Easy refund requests</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <label className="block text-sm text-slate-600 font-medium">Payment ID</label>
                <input
                  value={refundPaymentId}
                  onChange={(e) => setRefundPaymentId(e.target.value)}
                  className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
                  placeholder="Enter payment ID"
                />
                <label className="block text-sm text-slate-600 font-medium">Refund amount</label>
                <input
                  type="number"
                  min={0}
                  value={refundAmount || ""}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
                  placeholder="Enter refund amount"
                />
                <label className="block text-sm text-slate-600 font-medium">Refund reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400 resize-none"
                  placeholder="Explain reason for refund"
                />
                <button
                  onClick={requestRefund}
                  disabled={loading}
                  className="w-full rounded-2xl bg-white border border-cyan-300 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98]"
                >
                  {loading ? "Submitting..." : "Submit Refund Request"}
                </button>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-3xl border border-cyan-200 bg-white p-6 shadow-lg shadow-cyan-100/30">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium">Transaction history</p>
              <h2 className="text-2xl font-semibold text-slate-900">All payments & escrow activity</h2>
            </div>
            <button
              onClick={loadPaymentHistory}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-500 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98]"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
              {loading ? "Loading..." : "Refresh history"}
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-cyan-200 bg-cyan-50/30">
            <table className="w-full min-w-180 border-collapse text-sm text-slate-800">
              <thead className="bg-cyan-100/50 text-slate-600">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold">Type</th>
                  <th className="px-4 py-4 text-left font-semibold">Job</th>
                  <th className="px-4 py-4 text-left font-semibold">Freelancer</th>
                  <th className="px-4 py-4 text-right font-semibold">Amount</th>
                  <th className="px-4 py-4 text-left font-semibold">Status</th>
                  <th className="px-4 py-4 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500 italic">
                      No transaction records yet.
                    </td>
                  </tr>
                ) : (
                  transactionHistory.map((item) => (
                    <tr key={item._id} className="border-t border-cyan-100 hover:bg-cyan-50/50 transition">
                      <td className="px-4 py-4 text-slate-700 font-medium">{item.transactionType}</td>
                      <td className="px-4 py-4 text-slate-700">{typeof item.job === "object" ? item.job?.title : item.job || "—"}</td>
                      <td className="px-4 py-4 text-slate-700">{typeof item.freelancer === "object" ? item.freelancer?.name : item.freelancer || "—"}</td>
                      <td className="px-4 py-4 text-right font-semibold text-cyan-700">{item.currency} {item.amount.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'refunded' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-cyan-200 bg-white p-6 shadow-lg shadow-cyan-100/30">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium">Review workflow</p>
              <h2 className="text-2xl font-semibold text-slate-900">Add smart freelancer reputation</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-4 rounded-3xl border border-cyan-200 bg-cyan-50/50 p-5">
              <label className="block text-sm text-slate-600 font-medium">Freelancer ID</label>
              <input
                value={reviewFreelancerId}
                onChange={(e) => setReviewFreelancerId(e.target.value)}
                placeholder="Freelancer ID for rating"
                className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
              />
              <label className="block text-sm text-slate-600 font-medium">Job ID</label>
              <input
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="Related job ID"
                className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400"
              />
              <label className="block text-sm text-slate-600 font-medium">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReviewRating(value)}
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 ${
                      reviewRating === value 
                        ? "bg-cyan-600 text-white shadow-md" 
                        : "bg-white border border-cyan-300 text-slate-600 hover:bg-cyan-50 hover:border-cyan-400"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <label className="block text-sm text-slate-600 font-medium">Review comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="w-full rounded-3xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition placeholder-slate-400 resize-none"
                placeholder="Share your experience with this freelancer..."
              />
              <button
                onClick={submitReview}
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98]"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>

            <div className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-5">
              <div className="flex items-center gap-3 text-cyan-600">
                <FileText className="h-6 w-6" />
                <p className="text-base font-semibold text-slate-900">Reputation intelligence</p>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Collect structured feedback from clients and show automated reputation signals for each freelancer.
              </p>
              <div className="mt-6 grid gap-4 rounded-3xl bg-white p-4 border border-cyan-100 shadow-sm">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-medium">Total reviews</span>
                  <span className="font-bold text-cyan-600">{reviewAnalytics?.totalReviews ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-medium">Average rating</span>
                  <span className="font-bold text-cyan-600">{reviewAnalytics?.averageRating?.toFixed(1) ?? "0.0"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-medium">Expert score</span>
                  <span className="font-bold text-cyan-600">{reviewAnalytics ? Math.min(100, Math.round(reviewAnalytics.averageRating * 20)) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClientFinance;