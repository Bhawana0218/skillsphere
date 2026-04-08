import { useEffect, useMemo, useState } from "react";
import { FileText, Gavel, UploadCloud } from "lucide-react";
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

interface PaymentOption {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  transactionType: string;
  createdAt: string;
  job?: JobRef;
  client?: UserRef;
  freelancer?: UserRef;
}

interface DisputeItem {
  _id: string;
  issueTitle: string;
  category: string;
  description: string;
  amountInDispute: number;
  status: "Pending" | "In Review" | "Resolved" | "Rejected";
  evidence: string[];
  resolution?: string;
  resolutionType?: string;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string | null;
  filedBy?: UserRef;
  against?: UserRef;
  job?: JobRef;
  payment?: PaymentOption | null;
}

interface DisputeSummary {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  rejected: number;
}

const categoryOptions = [
  { value: "payment_not_received", label: "Payment not received" },
  { value: "payment_delay", label: "Payment delay" },
  { value: "refund_issue", label: "Refund issue" },
  { value: "incorrect_amount", label: "Incorrect amount" },
  { value: "unauthorized_charge", label: "Unauthorized charge" },
  { value: "other", label: "Other" },
];

const statusClass: Record<string, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  "In Review": "border-cyan-200 bg-cyan-50 text-cyan-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const uploadsBaseUrl = ((import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api").replace(
  /\/api\/?$/,
  ""
);

const UserDisputesPage = () => {
  const [payments, setPayments] = useState<PaymentOption[]>([]);
  const [summary, setSummary] = useState<DisputeSummary>({
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
    rejected: 0,
  });
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "Pending" | "In Review" | "Resolved" | "Rejected">("all");
  const [form, setForm] = useState({
    paymentId: "",
    issueTitle: "",
    category: "payment_not_received",
    description: "",
    amountInDispute: "",
  });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  const selectedPayment = useMemo(
    () => payments.find((payment) => payment._id === form.paymentId) || null,
    [payments, form.paymentId]
  );

  const filteredDisputes = useMemo(() => {
    if (filter === "all") return disputes;
    return disputes.filter((item) => item.status === filter);
  }, [disputes, filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentResponse, disputeResponse] = await Promise.all([
        API.get<PaymentOption[]>("/disputes/payment-options"),
        API.get<{ summary: DisputeSummary; disputes: DisputeItem[] }>("/disputes/me"),
      ]);

      setPayments(paymentResponse.data || []);
      setSummary(
        disputeResponse.data?.summary || {
          total: 0,
          pending: 0,
          inReview: 0,
          resolved: 0,
          rejected: 0,
        }
      );
      setDisputes(disputeResponse.data?.disputes || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Unable to load disputes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const submitDispute = async () => {
    if (!form.paymentId || !form.issueTitle.trim() || !form.description.trim()) {
      toast.error("Payment, issue title, and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("paymentId", form.paymentId);
      formData.append("issueTitle", form.issueTitle.trim());
      formData.append("category", form.category);
      formData.append("description", form.description.trim());

      if (form.amountInDispute.trim()) {
        formData.append("amountInDispute", form.amountInDispute.trim());
      }

      evidenceFiles.forEach((file) => {
        formData.append("evidenceFiles", file);
      });

      await API.post("/disputes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Dispute request filed successfully.");
      setForm({
        paymentId: "",
        issueTitle: "",
        category: "payment_not_received",
        description: "",
        amountInDispute: "",
      });
      setEvidenceFiles([]);
      await loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to file dispute.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cyan-50 to-cyan-100 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(6,182,212,0.7)]">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            <Gavel className="h-4 w-4" />
            Dispute Resolution Center
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Payment Dispute Resolution System</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            File payment disputes with evidence, track admin mediation in real time, and receive final resolution updates.
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

        <section className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
          <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(6,182,212,0.7)]">
            <h2 className="text-xl font-bold text-slate-900">File Dispute Request</h2>
            <p className="mt-1 text-sm text-slate-600">Attach payment details and supporting evidence.</p>

            <div className="mt-4 space-y-3">
              <select
                value={form.paymentId}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentId: e.target.value }))}
                className="w-full rounded-xl border border-cyan-100 px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Select payment</option>
                {payments.map((payment) => (
                  <option key={payment._id} value={payment._id}>
                    {payment.job?.title || "Job"} - {payment.currency} {payment.amount} ({payment.status})
                  </option>
                ))}
              </select>

              <input
                value={form.issueTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, issueTitle: e.target.value }))}
                placeholder="Issue title (e.g. Milestone released but payment missing)"
                className="w-full rounded-xl border border-cyan-100 px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100 px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  value={form.amountInDispute}
                  onChange={(e) => setForm((prev) => ({ ...prev, amountInDispute: e.target.value }))}
                  placeholder="Amount in dispute (optional)"
                  className="w-full rounded-xl border border-cyan-100 px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe payment issue with timeline and expected resolution"
                rows={5}
                className="w-full rounded-xl border border-cyan-100 px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              />

              <label className="block rounded-xl border border-dashed border-cyan-300 bg-cyan-50 px-4 py-4 text-sm text-cyan-700">
                <span className="mb-2 inline-flex items-center gap-2 font-semibold">
                  <UploadCloud className="h-4 w-4" />
                  Upload evidence (PNG, JPG, PDF, DOC, DOCX)
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
                  className="mt-2 block text-xs text-slate-700"
                />
              </label>

              {evidenceFiles.length > 0 && (
                <p className="text-xs text-slate-500">{evidenceFiles.length} evidence file(s) selected</p>
              )}

              <button
                onClick={() => void submitDispute()}
                disabled={submitting}
                className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Dispute"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(6,182,212,0.7)]">
            <h2 className="text-xl font-bold text-slate-900">Selected Payment Preview</h2>
            {!selectedPayment ? (
              <p className="mt-3 text-sm text-slate-500">Choose a payment to auto-link dispute participants and job context.</p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-cyan-700">Transaction</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {selectedPayment.transactionType.toUpperCase()} - {selectedPayment.status}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedPayment.currency} {selectedPayment.amount}
                  </p>
                </div>
                <div className="rounded-xl border border-cyan-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Job</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedPayment.job?.title || "Unknown job"}</p>
                </div>
                <div className="rounded-xl border border-cyan-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Participants</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Client: {selectedPayment.client?.name || selectedPayment.client?.email || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Freelancer: {selectedPayment.freelancer?.name || selectedPayment.freelancer?.email || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(6,182,212,0.7)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">My Disputes</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
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
            <p className="mt-4 text-sm text-slate-500">Loading dispute history...</p>
          ) : filteredDisputes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No disputes found for selected filter.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {filteredDisputes.map((dispute) => (
                <article key={dispute._id} className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{dispute.issueTitle}</p>
                      <p className="text-sm text-slate-600">{dispute.job?.title || "Job not linked"}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusClass[dispute.status] || "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-700">{dispute.description}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full border border-cyan-200 bg-white px-2.5 py-1">
                      Category: {dispute.category.replaceAll("_", " ")}
                    </span>
                    <span className="rounded-full border border-cyan-200 bg-white px-2.5 py-1">
                      Amount: INR {Number(dispute.amountInDispute || 0).toLocaleString()}
                    </span>
                    <span className="rounded-full border border-cyan-200 bg-white px-2.5 py-1">
                      Created: {new Date(dispute.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {Array.isArray(dispute.evidence) && dispute.evidence.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {dispute.evidence.map((item, index) => (
                          <a
                            key={`${dispute._id}-evidence-${index}`}
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

                  {(dispute.resolution || dispute.adminNotes) && (
                    <div className="mt-3 rounded-xl border border-cyan-200 bg-white p-3">
                      {dispute.resolution && (
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">Resolution:</span> {dispute.resolution}
                        </p>
                      )}
                      {dispute.adminNotes && (
                        <p className="mt-1 text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">Admin notes:</span> {dispute.adminNotes}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserDisputesPage;
