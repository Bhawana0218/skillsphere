import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

// Freelancer Type
interface Freelancer {
  name: string;
  avatar?: string;
  rating?: number;
  completedJobs?: number;
}

// Proposal Type
interface Proposal {
  _id: string;
  freelancer: Freelancer;
  coverLetter: string;
  bidAmount: string;
  createdAt?: string;
  status?: "pending" | "accepted" | "rejected";
}

function Proposals() {
  const { jobId } = useParams<{ jobId: string }>();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Debug: Log the jobId to identify invalid values
  useEffect(() => {
    console.log("Proposals component loaded with jobId:", jobId);
    
    // Validate MongoDB ObjectId format
    if (jobId && !/^[0-9a-f]{24}$/i.test(jobId)) {
      console.error("❌ INVALID JOB ID FORMAT:", jobId);
      console.error("Expected MongoDB ObjectId (24 hex characters), got:", jobId);
      setError("Invalid job identifier. Please check the URL and try again.");
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) {
      setError("No job ID provided");
      setLoading(false);
      return;
    }
    if (!/^[0-9a-f]{24}$/i.test(jobId)) {
      setError("Cannot fetch proposals with invalid jobId");
      setLoading(false);
      return;
    }
    fetchProposals();
  }, [jobId]);

  // Fetch Proposals
  const fetchProposals = async () => {
    try {
      console.log("Fetching proposals for jobId:", jobId);
      setLoading(true);
      setError(null);
      const { data } = await API.get<Proposal[]>(`/proposals/${jobId}`);
      
      setProposals(data);
    } catch (error: any) {
      
      if (error.response?.status === 400) {
        setError("Invalid Job ID format. Expected MongoDB ObjectId format (24 hex chars)");
      } else if (error.response?.status === 404) {
        setError("No proposals found for this job");
      } else {
        setError("Failed to load proposals. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Accept Proposal
  const handleAccept = async (id: string) => {
    try {
      setAcceptingId(id);
      await API.put(`/proposals/accept/${id}`);
      
      // Optimistic update
      setProposals(prev => 
        prev.map(p => 
          p._id === id ? { ...p, status: "accepted" } : p
        )
      );
      
      // Refresh list to ensure data consistency
      await fetchProposals();
    } catch (error) {
      console.error("Error accepting proposal:", error);
      setError("Failed to accept proposal. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(amount));
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Render Rating Stars
  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating) 
                ? 'text-cyan-500' 
                : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-500">({rating})</span>
      </div>
    );
  };

  // Loading Skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="flex gap-3 pt-2">
                <div className="h-10 bg-gray-200 rounded-lg w-24" />
                <div className="h-10 bg-gray-200 rounded-lg w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const renderEmptyState = () => (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-cyan-50 to-blue-50 mb-6">
        <svg className="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No proposals yet</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Great jobs attract great talent. Share your job posting to start receiving proposals from skilled freelancers.
      </p>
      <button 
        onClick={() => window.history.back()}
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Jobs
      </button>
    </div>
  );

  // Error State
  const renderErrorState = () => (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{error}</p>
      <button 
        onClick={fetchProposals}
        className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/25"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Try Again
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-cyan-50/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mt-2 animate-pulse" />
          </div>
          {renderSkeleton()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-cyan-50/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Proposals
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
              </p>
            </div>
            <button
              onClick={fetchProposals}
              className="p-2.5 rounded-xl bg-gray-50 hover:bg-cyan-50 text-gray-600 hover:text-cyan-600 transition-all duration-200 border border-gray-200 hover:border-cyan-200"
              aria-label="Refresh proposals"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && proposals.length === 0 ? (
          renderErrorState()
        ) : proposals.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal, index) => (
              <article
                key={proposal._id}
                className={`group bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-cyan-200 hover:-translate-y-0.5 ${
                  proposal.status === 'accepted' 
                    ? 'border-cyan-300 bg-linear-to-br from-cyan-50/50 to-white' 
                    : 'border-gray-100'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  {/* Freelancer Avatar */}
                  <div className="shrink-0">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-400 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-500/20">
                        {proposal.freelancer.name?.charAt(0).toUpperCase()}
                      </div>
                      {proposal.status === 'accepted' && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proposal Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {proposal.freelancer.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {renderStars(proposal.freelancer.rating)}
                          {proposal.freelancer.completedJobs && (
                            <span className="text-sm text-gray-500">
                              {proposal.freelancer.completedJobs} jobs completed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                          {formatCurrency(proposal.bidAmount)}
                        </div>
                        {proposal.createdAt && (
                          <p className="text-sm text-gray-400 mt-1">
                            {formatDate(proposal.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-5">
                      <p className="line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                        {proposal.coverLetter}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      {proposal.status === 'accepted' ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium text-sm border border-green-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Accepted
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              handleAccept(proposal._id);
                              toast.success("Proposal accepted Successfully!");
                            }}
                            disabled={acceptingId === proposal._id}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all duration-200 shadow-md ${
                              acceptingId === proposal._id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-linear-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95'
                            }`}
                          >
                            {acceptingId === proposal._id ? (
                              <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accept Proposal
                              </>
                            )}
                          </button>
                          
                          <button
                            className="px-5 py-2.5 text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 transition-all duration-200"
                          >
                            View Profile
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <button
          onClick={fetchProposals}
          className="w-14 h-14 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 active:scale-95"
          aria-label="Refresh"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Proposals;
