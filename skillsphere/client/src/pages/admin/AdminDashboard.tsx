import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  BadgeCheck,
  RefreshCcw,
  Scale
} from "lucide-react";

interface TopCategory {
  category: string;
  count: number;
}

interface AdminSummary {
  totalUsers: number;
  clients: number;
  freelancers: number;
  admins: number;
  verifiedFreelancers: number;
  suspendedUsers: number;
  totalJobs: number;
  openJobs: number;
  pendingGigs: number;
  paymentVolume: number;
  paymentsCount: number;
  completedPayments: number;
  failedPayments: number;
  refundedPayments: number;
  platformRevenue?: number;
  activeFreelancers?: number;
  topCategories?: TopCategory[];
  jobSuccessRate?: number;
}

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isSuspended: boolean;
  authProvider: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "client" | "freelancer" | "admin";
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

interface AdminGig {
  _id: string;
  title: string;
  budget?: number;
  deadline?: string;
  status: string;
  adminApproved: boolean;
  client?: { name?: string; email?: string };
  createdAt: string;
}

interface AdminPayment {
  _id: string;
  client?: { name?: string };
  freelancer?: { name?: string };
  job?: { title?: string };
  amount: number;
  currency: string;
  status: string;
  transactionType: string;
  createdAt: string;
}

interface FraudReview {
  _id: string;
  rating: number;
  fraudScore: number;
  comment: string;
  reviewer?: { name?: string };
  freelancer?: { name?: string };
  createdAt: string;
}

interface FraudPayment {
  _id: string;
  client?: { name?: string };
  freelancer?: { name?: string };
  job?: { title?: string };
  amount: number;
  currency: string;
  status: string;
  transactionType: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingGigs, setPendingGigs] = useState<AdminGig[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<AdminSummary | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [fraudReviews, setFraudReviews] = useState<FraudReview[]>([]);
  const [fraudPayments, setFraudPayments] = useState<FraudPayment[]>([]);
  const [disputeSummary, setDisputeSummary] = useState({ pendingDisputes: 0, inReviewDisputes: 0, resolvedDisputes: 0 });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      console.log('Loading is True', loading);
      const [summaryRes, profileRes, usersRes, gigsRes, paymentsRes, fraudRes, disputesRes] = await Promise.all([
        api.get("/admin/summary"),
        api.get("/admin/profile"),
        api.get("/admin/users"),
        api.get("/admin/gigs/pending"),
        api.get("/admin/payments"),
        api.get("/admin/fraud-alerts"),
        api.get("/disputes"),
      ]);

      setSummary(summaryRes.data);
      setAdminProfile(profileRes.data);
      setUsers(usersRes.data || []);
      setPendingGigs(gigsRes.data || []);
      setPayments(paymentsRes.data.payments || []);
      setPaymentSummary({
        totalUsers: 0,
        clients: 0,
        freelancers: 0,
        admins: 0,
        verifiedFreelancers: 0,
        suspendedUsers: 0,
        totalJobs: 0,
        openJobs: 0,
        pendingGigs: 0,
        paymentVolume: paymentsRes.data.summary.totalVolume,
        paymentsCount: paymentsRes.data.summary.totalPayments,
        completedPayments: paymentsRes.data.summary.completedPayments,
        failedPayments: paymentsRes.data.summary.failedPayments,
        refundedPayments: paymentsRes.data.summary.refundedPayments,
      });
      setFraudReviews(fraudRes.data.suspiciousReviews || []);
      setFraudPayments(fraudRes.data.suspiciousPayments || []);
      setDisputeSummary(disputesRes.data.summary || { pendingDisputes: 0, inReviewDisputes: 0, resolvedDisputes: 0 });
    } catch (error) {
      console.error(error);
      setStatusMessage("Unable to load admin dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateUserStatus = async (id: string, suspend: boolean) => {
    try {
      await api.put(`/admin/users/${id}/suspend`, { suspend });
      setStatusMessage(`User account ${suspend ? "suspended" : "reinstated"} successfully.`);
      loadDashboard();
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to update user status.");
    }
  };

  const verifyFreelancer = async (id: string, verify: boolean) => {
    try {
      await api.put(`/admin/users/${id}/verify`, { verify });
      setStatusMessage(`Freelancer ${verify ? "verified" : "unverified"} successfully.`);
      loadDashboard();
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to update freelancer verification.");
    }
  };

  const approveGig = async (id: string) => {
    try {
      await api.put(`/admin/gigs/${id}/approve`);
      setStatusMessage("Gig approved successfully.");
      loadDashboard();
    } catch (error) {
      console.error(error);
      setStatusMessage("Unable to approve gig. Please try again.");
    }
  };

  const totalSuspiciousAlerts = fraudReviews.length + fraudPayments.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-5 xl:grid-cols-[1.9fr_0.95fr]">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-600 font-semibold">Admin control center</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Platform governance & admin performance</h1>
              <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
                Full administrative control with user management, freelancer verification, gig approval, revenue monitoring, and trusted platform analytics.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 hover:border-cyan-400"
              >
                <ArrowLeft className="w-4 h-4" /> Back to platform
              </Link>
              <button
                onClick={loadDashboard}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                <RefreshCcw className="w-4 h-4" /> Refresh data
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-cyan-600">
              <ShieldCheck className="w-6 h-6" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">My admin profile</p>
                <p className="text-lg font-semibold text-slate-900">Connected securely to backend</p>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-slate-700">
              <div className="rounded-3xl bg-cyan-50 p-4">
                <p className="text-sm text-slate-500">Name</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{adminProfile?.name || "Loading..."}</p>
              </div>
              <div className="rounded-3xl bg-cyan-50 p-4">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{adminProfile?.email || "Loading..."}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-4 border border-cyan-100">
                  <p className="text-sm text-slate-500">Account Status</p>
                  <p className="mt-1 text-base font-semibold text-cyan-700">{adminProfile?.isSuspended ? "Suspended" : "Active"}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 border border-cyan-100">
                  <p className="text-sm text-slate-500">Verified</p>
                  <p className="mt-1 text-base font-semibold text-cyan-700">{adminProfile?.isVerified ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-4 border border-cyan-100">
                <p className="text-sm text-slate-500">Auth provider</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{adminProfile?.authProvider || "local"}</p>
              </div>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-6 rounded-3xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm text-cyan-900 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <span>{statusMessage}</span>
              <button onClick={() => setStatusMessage(null)} className="text-cyan-700 hover:text-slate-900 font-medium">
                Dismiss
              </button>
            </div>
          </div>
        )}

        <section className="grid gap-5 xl:grid-cols-3">
          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-cyan-600">
              <Users className="w-6 h-6" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Users</p>
                <p className="text-lg font-semibold text-slate-900">Account overview</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="flex items-center justify-between rounded-3xl bg-cyan-50 p-4 text-slate-700">
                <span>Total accounts</span>
                <span className="font-bold text-cyan-700">{summary?.totalUsers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-cyan-50 p-4 text-slate-700">
                <span>Verified freelancers</span>
                <span className="font-bold text-cyan-700">{summary?.verifiedFreelancers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-cyan-50 p-4 text-slate-700">
                <span>Suspended accounts</span>
                <span className="font-bold text-rose-600">{summary?.suspendedUsers ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-cyan-600">
              <Briefcase className="w-6 h-6" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Gigs & approvals</p>
                <p className="text-lg font-semibold text-slate-900">Pending review</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="flex items-center justify-between rounded-3xl bg-cyan-50 p-4 text-slate-700">
                <span>Open jobs</span>
                <span className="font-bold text-cyan-700">{summary?.openJobs ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-cyan-50 p-4 text-slate-700">
                <span>Pending approvals</span>
                <span className="font-bold text-cyan-700">{summary?.pendingGigs ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-cyan-600">
              <DollarSign className="w-6 h-6" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Payments</p>
                <p className="text-lg font-semibold text-slate-900">Monitoring</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="flex items-center justify-between rounded-3xl bg-cyan-50 p-4 text-slate-700">
                <span>Volume processed</span>
                <span className="font-bold text-cyan-700">INR {paymentSummary?.paymentVolume.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-cyan-50 p-4 text-slate-700">
                <span>Completed</span>
                <span className="font-bold text-emerald-700">{paymentSummary?.completedPayments ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-cyan-50 p-4 text-slate-700">
                <span>Suspicious / refunds</span>
                <span className="font-bold text-rose-600">{paymentSummary?.failedPayments ?? 0}</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-cyan-600">
              <Scale className="w-6 h-6" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Disputes</p>
                <p className="text-lg font-semibold text-slate-900">Mediation Queue</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="flex items-center justify-between rounded-3xl bg-amber-50 p-4 text-slate-700">
                <span>Pending</span>
              <span className="font-bold text-amber-700">{disputeSummary.pendingDisputes}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-cyan-50 p-4 text-slate-700">
                <span>In Review</span>
                <span className="font-bold text-cyan-700">{disputeSummary.inReviewDisputes}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-emerald-50 p-4 text-slate-700">
                <span>Resolved</span>
                <span className="font-bold text-emerald-700">{disputeSummary.resolvedDisputes}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-4">
          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Revenue</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              INR {summary?.platformRevenue?.toLocaleString() ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">Platform revenue from processed payments</p>
          </div>

          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Freelancers</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {summary?.activeFreelancers ?? 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">Active verified freelancers on the platform</p>
          </div>

          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Success rate</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {summary?.jobSuccessRate ?? 0}%
            </p>
            <p className="mt-2 text-sm text-slate-500">Completed project success ratio</p>
          </div>

          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Top categories</p>
            <div className="mt-4 space-y-3">
              {summary?.topCategories?.slice(0, 3).map((item) => (
                <div key={item.category} className="rounded-3xl bg-cyan-50 p-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <span>{item.category}</span>
                    <span className="font-semibold text-cyan-700">{item.count}</span>
                  </div>
                </div>
              ))}
              {(!summary?.topCategories || summary.topCategories.length === 0) && (
                <p className="text-sm text-slate-500">No category data available.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">User management</p>
                <h2 className="text-2xl font-semibold text-slate-900">Approve, verify, suspend</h2>
              </div>
              <button
                onClick={loadDashboard}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
              >
                Refresh
              </button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200 bg-cyan-50 p-4">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Verified</th>
                    <th className="px-4 py-3 font-semibold">Suspended</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                        No user records available.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="border-t border-slate-200">
                        <td className="px-4 py-4">{user.name || user.email}</td>
                        <td className="px-4 py-4 uppercase text-slate-500">{user.role}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${user.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                            {user.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${user.isSuspended ? "bg-rose-100 text-rose-700" : "bg-cyan-100 text-cyan-700"}`}>
                            {user.isSuspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-4 space-x-2">
                          {user.role === "freelancer" && (
                            <button
                              onClick={() => verifyFreelancer(user._id, !user.isVerified)}
                              className="rounded-2xl border border-cyan-300 bg-white px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50"
                            >
                              {user.isVerified ? "Unverify" : "Verify"}
                            </button>
                          )}
                          <button
                            onClick={() => updateUserStatus(user._id, !user.isSuspended)}
                            className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${user.isSuspended ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-rose-600 text-white hover:bg-rose-700"}`}
                          >
                            {user.isSuspended ? "Restore" : "Suspend"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-cyan-600">
              <ShieldCheck className="w-6 h-6" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Fraud detection</p>
                <p className="text-xl font-semibold text-slate-900">Risk signals</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-4">
                <p className="text-sm text-slate-500">Suspicious reviews</p>
                <p className="mt-2 text-2xl font-bold text-rose-700">{fraudReviews.length}</p>
              </div>
              <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-4">
                <p className="text-sm text-slate-500">Suspicious payments</p>
                <p className="mt-2 text-2xl font-bold text-rose-700">{fraudPayments.length}</p>
              </div>
              <div className="rounded-3xl border border-cyan-100 bg-white p-4 text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Total risk alerts</p>
                    <p className="text-3xl font-bold text-slate-900">{totalSuspiciousAlerts}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-rose-600" />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Review fraud scores and refund / failed payment patterns are highlighted here for rapid action.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Gig approval</p>
                <h2 className="text-2xl font-semibold text-slate-900">Pending job approvals</h2>
              </div>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{pendingGigs.length} pending</span>
            </div>
            <div className="mt-5 space-y-4">
              {pendingGigs.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50 p-6 text-center text-slate-500">
                  No pending gigs available right now.
                </div>
              ) : (
                pendingGigs.map((gig) => (
                  <div key={gig._id} className="rounded-3xl border border-slate-200 bg-cyan-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{gig.title}</p>
                        <p className="text-sm text-slate-600">Client: {gig.client?.name || gig.client?.email || "Unknown"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">Budget: INR {gig.budget ?? "-"}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{gig.status}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-slate-500">Created at {new Date(gig.createdAt).toLocaleDateString()}</div>
                      <button
                        onClick={() => approveGig(gig._id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve gig
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Payment trace</p>
                <h2 className="text-2xl font-semibold text-slate-900">Recent payment activity</h2>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {payments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-cyan-200 bg-cyan-50 p-6 text-center text-slate-500">
                  No payment history available yet.
                </div>
              ) : (
                payments.slice(0, 6).map((payment) => (
                  <div key={payment._id} className="rounded-3xl border border-slate-200 bg-cyan-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{payment.transactionType.toUpperCase()}</p>
                        <p className="text-sm text-slate-500">{payment.client?.name || "Client"} → {payment.freelancer?.name || "Freelancer"}</p>
                      </div>
                      <span className="text-lg font-semibold text-cyan-700">INR {payment.amount.toFixed(2)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">{payment.job?.title || "Job"}</span>
                      <span className={`rounded-full px-2.5 py-1 ${payment.status === "completed" ? "bg-emerald-100 text-emerald-700" : payment.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-rose-100 text-rose-700"}`}>
                        {payment.status}
                      </span>
                      <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Risk board</p>
              <h2 className="text-2xl font-semibold text-slate-900">Suspected fraud signals</h2>
            </div>
            <BadgeCheck className="w-6 h-6 text-cyan-600" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Review fraud alerts</p>
              <div className="mt-4 space-y-3">
                {fraudReviews.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 text-slate-500 text-sm text-center">
                    No suspicious reviews detected.
                  </div>
                ) : (
                  fraudReviews.slice(0, 5).map((item) => (
                    <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900">{item.reviewer?.name || "Client"}</span>
                        <span className="text-xs uppercase tracking-[0.18em] text-rose-600">Fraud {Math.round(item.fraudScore * 100)}%</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{item.comment}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>Rating {item.rating}/5</span>
                        <span>Freelancer {item.freelancer?.name || "Unknown"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Payment risk alerts</p>
              <div className="mt-4 space-y-3">
                {fraudPayments.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 text-slate-500 text-sm text-center">
                    No suspicious payment patterns detected.
                  </div>
                ) : (
                  fraudPayments.slice(0, 5).map((payment) => (
                    <div key={payment._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900">{payment.transactionType}</span>
                        <span className="text-xs uppercase tracking-[0.18em] text-rose-600">{payment.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{payment.job?.title || "Job payment"}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>INR {payment.amount.toFixed(2)}</span>
                        <span>{payment.client?.name || "Client"} → {payment.freelancer?.name || "Freelancer"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
