import { useEffect, useMemo, useState } from "react";
import { FileText, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../services/api";

interface UserRef {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface JobRef {
  _id?: string;
  title?: string;
  status?: string;
}

interface PaymentRef {
  _id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  transactionType?: string;
}

interface DisputeItem {
  _id: string;
  issueTitle: string;
  category: string;
  description: string;
  amountInDispute: number;
  status: "Pending" | "In Review" | "Resolved" | "Rejected";
  priority: "low" | "medium" | "high";
  evidence: string[];
  resolution?: string;
  resolutionType?: string;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string | null;
  filedBy?: UserRef;
  against?: UserRef;
  adminMediator?: UserRef;
  job?: JobRef;
  payment?: PaymentRef | null;
}

interface DisputeSummary {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  rejected: number;
}

const statusBadgeClass: Record<string, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  "In Review": "border-cyan-200 bg-cyan-50 text-cyan-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const uploadsBaseUrl = ((import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api").replace(
  /\/api\/?$/,
  ""
);

const AdminDisputes = () => {
  const [summary, setSummary] = useState<DisputeSummary>({
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
    rejected: 0,
  });
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "In Review" | "Resolved" | "Rejected">("all");
  const [reviewNotes, setReviewNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [resolutionType, setResolutionType] = useState("refund");
  const [closingStatus, setClosingStatus] = useState<"Resolved" | "Rejected">("Resolved");
  const [actionLoading, setActionLoading] = useState(false);

  const selectedDispute = useMemo(
    () => disputes.find((item) => item._id === selectedDisputeId) || null,
    [disputes, selectedDisputeId]
  );

  const filteredDisputes = useMemo(() => {
    if (statusFilter === "all") return disputes;
    return disputes.filter((item) => item.status === statusFilter);
  }, [disputes, statusFilter]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const { data } = await API.get<{ summary: DisputeSummary; disputes: DisputeItem[] }>("/disputes");
      setSummary(
        data?.summary || {
          total: 0,
          pending: 0,
          inReview: 0,
          resolved: 0,
          rejected: 0,
        }
      );
      setDisputes(data?.disputes || []);
      if (!selectedDisputeId && data?.disputes?.length) {
        setSelectedDisputeId(data.disputes[0]._id);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Unable to fetch disputes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDisputes();
  }, []);

  const markInReview = async () => {
    if (!selectedDispute) {
      toast.error("Select a dispute first.");
      return;
    }
    setActionLoading(true);
    try {
      await API.put(`/disputes/${selectedDispute._id}/review`, { adminNotes: reviewNotes });
      toast.success("Dispute moved to In Review.");
      await fetchDisputes();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update review status.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeDispute = async () => {
    if (!selectedDispute) {
      toast.error("Select a dispute first.");
      return;
    }
    if (!resolution.trim()) {
      toast.error("Resolution summary is required.");
      return;
    }

    setActionLoading(true);
    try {
      await API.put(`/disputes/${selectedDispute._id}/resolve`, {
        status: closingStatus,
        resolution: resolution.trim(),
        resolutionType,
        adminNotes: reviewNotes.trim(),
      });
      toast.success(`Dispute ${closingStatus.toLowerCase()} successfully.`);
      setResolution("");
      await fetchDisputes();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to resolve dispute.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cyan-50 to-cyan-100 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(6,182,212,0.7)]">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            <ShieldCheck className="h-4 w-4" />
            Admin Mediation Console
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Dispute Resolution Management</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Review payment disputes, assess evidence, mediate between parties, and close with structured resolution outcomes.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-cyan-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-wide text-amber-700">Pending</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{summary.pending}</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-700">In Review</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{summary.inReview}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Resolved</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{summary.resolved}</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-xs uppercase tracking-wide text-rose-700">Rejected</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{summary.rejected}</p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(6,182,212,0.7)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Dispute Queue</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-700"
              >
                <option value="all">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-slate-500">Loading disputes...</p>
            ) : filteredDisputes.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No disputes in this filter.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {filteredDisputes.map((dispute) => (
                  <button
                    key={dispute._id}
                    onClick={() => setSelectedDisputeId(dispute._id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      dispute._id === selectedDisputeId
                        ? "border-cyan-400 bg-cyan-50"
                        : "border-cyan-100 bg-white hover:border-cyan-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{dispute.issueTitle}</p>
                        <p className="text-xs text-slate-500">
                          {dispute.filedBy?.name || dispute.filedBy?.email || "User"} vs{" "}
                          {dispute.against?.name || dispute.against?.email || "User"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusBadgeClass[dispute.status] || "border-slate-200 bg-slate-100 text-slate-700"
                        }`}
                      >
                        {dispute.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1">
                        INR {Number(dispute.amountInDispute || 0).toLocaleString()}
                      </span>
                      <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1">
                        Priority: {dispute.priority}
                      </span>
                      <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(6,182,212,0.7)]">
            {!selectedDispute ? (
              <p className="text-sm text-slate-500">Select a dispute to begin mediation.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedDispute.issueTitle}</h3>
                    <p className="text-sm text-slate-600">{selectedDispute.job?.title || "No linked job"}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusBadgeClass[selectedDispute.status] || "border-slate-200 bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedDispute.status}
                  </span>
                </div>

                <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-700">
                  <p>{selectedDispute.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-cyan-200 bg-white px-2.5 py-1">
                      Category: {selectedDispute.category.replaceAll("_", " ")}
                    </span>
                    <span className="rounded-full border border-cyan-200 bg-white px-2.5 py-1">
                      Amount: INR {Number(selectedDispute.amountInDispute || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {Array.isArray(selectedDispute.evidence) && selectedDispute.evidence.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence Files</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedDispute.evidence.map((item, index) => (
                        <a
                          key={`${selectedDispute._id}-evidence-${index}`}
                          href={item.startsWith("http") ? item : `${uploadsBaseUrl}${item}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-50"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Evidence {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Admin mediation notes"
                  rows={3}
                  className="w-full rounded-xl border border-cyan-100 px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />

                <button
                  onClick={() => void markInReview()}
                  disabled={actionLoading}
                  className="w-full rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-100 disabled:opacity-60"
                >
                  {actionLoading ? "Updating..." : "Move to In Review"}
                </button>

                <div className="rounded-xl border border-cyan-100 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-900">Close Dispute</h4>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <select
                      value={closingStatus}
                      onChange={(e) => setClosingStatus(e.target.value as "Resolved" | "Rejected")}
                      className="rounded-lg border border-cyan-100 px-3 py-2 text-sm text-slate-900"
                    >
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <select
                      value={resolutionType}
                      onChange={(e) => setResolutionType(e.target.value)}
                      className="rounded-lg border border-cyan-100 px-3 py-2 text-sm text-slate-900"
                    >
                      <option value="refund">Refund</option>
                      <option value="partial_refund">Partial Refund</option>
                      <option value="payment_release">Payment Release</option>
                      <option value="declined">Declined</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Final resolution summary"
                    rows={4}
                    className="mt-3 w-full rounded-lg border border-cyan-100 px-3 py-2 text-sm text-slate-900"
                  />

                  <button
                    onClick={() => void closeDispute()}
                    disabled={actionLoading}
                    className="mt-3 w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
                  >
                    {actionLoading ? "Saving..." : "Close Dispute"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDisputes;
