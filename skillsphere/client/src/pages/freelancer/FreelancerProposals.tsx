
import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../../services/api";
import {
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  IndianRupee,
  Briefcase,
  Calendar,
  ChevronRight,
  X,
  Check
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Job {
  title: string;
  description?: string;
}

interface Proposal {
  _id: string;
  status: "pending" | "accepted" | "rejected" | "under_review" | "withdrawn";
  bidAmount: number;
  duration: string;
  job: Job;
  createdAt: string;
}

type ToastType = { id: number; message: string; type: "success" | "error" };
type StatusFilter = "all" | Proposal["status"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<Proposal["status"], { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock size={14} /> },
  accepted: { label: "Accepted", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} /> },
  rejected: { label: "Rejected", color: "bg-rose-100 text-rose-700 border-rose-200", icon: <XCircle size={14} /> },
  under_review: { label: "Under Review", color: "bg-cyan-100 text-cyan-700 border-cyan-200", icon: <AlertCircle size={14} /> },
  withdrawn: { label: "Withdrawn", color: "bg-slate-100 text-slate-600 border-slate-200", icon: <Trash2 size={14} /> },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Main Component ──────────────────────────────────────────────────────────
const FreelancerProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Safe user extraction
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchProposals = useCallback(async () => {
    if (!user?._id) {
      setError("Unable to identify user. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await API.get<Proposal[]>(`/proposals/freelancer/${user._id}`);
      setProposals(res.data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load proposals. Please try again.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

// const fetchProposals = useCallback(async () => {
//   if (!user?._id) {
//     setError("User not found. Please login again.");
//     setLoading(false);
//     return;
//   }

//   setLoading(true);
//   setError(null);

//   try {
//     const res = await API.get(`/proposals/freelancer/${user._id}`);

//     console.log("API RESPONSE:", res.data);

//     const proposalsData =
//       res.data?.data || res.data?.proposals || res.data || [];

//     setProposals(proposalsData);
//   } catch (err: any) {
//     console.error("FETCH ERROR:", err);

//     const msg =
//       err?.response?.data?.message ||
//       err?.message ||
//       "Failed to load proposals";

//     setError(msg);
//     addToast(msg, "error");
//   } finally {
//     setLoading(false);
//   }
// }, [user, addToast]);

  // Filter logic
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchesSearch = p.job.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proposals, search, statusFilter]);

  // Actions
  const handleWithdraw = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      // Replace with your actual DELETE endpoint
      await API.delete(`/proposals/${id}`);
      setProposals((prev) => prev.map((p) => (p._id === id ? { ...p, status: "withdrawn" } : p)));
      addToast("Proposal withdrawn successfully", "success");
      setSelectedProposal(null);
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to withdraw proposal", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRefresh = () => {
    fetchProposals();
    addToast("Refreshing data...", "success");
  };

  // ─── UI Components ───────────────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 w-20 bg-slate-100 rounded-lg" />
        <div className="h-8 w-24 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: Proposal["status"] }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Proposals</h1>
            <p className="text-slate-500 mt-1">Track your active submissions and engagement status</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-cyan-200 text-cyan-700 rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold">
              <Filter size={16} />
              Filters
            </div>
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Job title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 placeholder:text-slate-400 text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-4 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-700">{proposals.length}</div>
                <div className="text-xs text-cyan-600 font-medium">Total</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-700">
                  {proposals.filter((p) => p.status === "accepted").length}
                </div>
                <div className="text-xs text-emerald-600 font-medium">Won</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main List */}
        <div className="lg:col-span-3">
          {loading && (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && error && (
            <div className="bg-white border border-rose-200 rounded-xl p-6 text-center shadow-sm">
              <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
              <p className="text-rose-600 font-medium mb-4">{error}</p>
              <button
                onClick={fetchProposals}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
              >
                Retry Request
              </button>
            </div>
          )}

          {!loading && !error && filteredProposals.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No proposals found</h3>
              <p className="text-slate-500 mb-5 max-w-md mx-auto">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters or search query."
                  : "Start bidding on jobs to see your proposals here."}
              </p>
              {(search || statusFilter !== "all") && (
                <button
                  onClick={() => { setSearch(""); setStatusFilter("all"); }}
                  className="px-4 py-2 text-cyan-700 border border-cyan-300 rounded-lg hover:bg-cyan-50 transition-colors text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredProposals.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal._id}
                  className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-cyan-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <StatusBadge status={proposal.status} />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleWithdraw(proposal._id); }}
                      disabled={actionLoading[proposal._id] || proposal.status === "withdrawn" || proposal.status === "accepted"}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={proposal.status === "withdrawn" || proposal.status === "accepted" ? "Action disabled" : "Withdraw proposal"}
                    >
                      {actionLoading[proposal._id] ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-cyan-700 transition-colors">
                    {proposal.job.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Submitted on {formatDate(proposal.createdAt)}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <IndianRupee size={15} className="text-cyan-600" />
                      <span className="font-medium">{formatCurrency(proposal.bidAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar size={15} className="text-cyan-600" />
                      <span className="font-medium">{proposal.duration}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">View details</span>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-linear-to-r from-cyan-50 to-blue-50">
              <h2 className="text-lg font-bold text-slate-900">Proposal Details</h2>
              <button onClick={() => setSelectedProposal(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</label>
                <p className="mt-1 text-slate-900 font-medium">{selectedProposal.job.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bid Amount</label>
                  <p className="mt-1 text-lg font-bold text-cyan-700">{formatCurrency(selectedProposal.bidAmount)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</label>
                  <p className="mt-1 text-slate-800 font-medium">{selectedProposal.duration}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Status</label>
                <div className="mt-2">
                  <StatusBadge status={selectedProposal.status} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                {selectedProposal.status !== "withdrawn" && selectedProposal.status !== "accepted" && (
                  <button
                    onClick={() => handleWithdraw(selectedProposal._id)}
                    disabled={actionLoading[selectedProposal._id]}
                    className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading[selectedProposal._id] ? <Loader2 size={16} className="animate-spin" /> : <><Check size={14} /> Withdraw</>}
                  </button>
                )}
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium animate-in slide-in-from-right duration-300 ${
              toast.type === "success"
                ? "bg-white border-emerald-200 text-emerald-800"
                : "bg-white border-rose-200 text-rose-800"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreelancerProposals;