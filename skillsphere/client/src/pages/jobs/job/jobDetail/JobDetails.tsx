
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import API from "../../../../services/api";
import { useParams } from "react-router-dom";
import  toast  from "react-hot-toast"; 

// Job Type
interface Job {
  _id: string;
  title: string;
  description: string;
  budget: string;
  skillsRequired: string[];
}

// Proposal Type
interface Proposal {
  bidAmount: string;
  duration: string;
  coverLetter: string;
}

function JobDetails() {
  const { id } = useParams<{ id?: string }>();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [user, setUser] = useState<{ role: string } | null>(null);

 useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);

  // Proposal State
  const [proposal, setProposal] = useState<Proposal>({
    bidAmount: "",
    duration: "",
    coverLetter: "",
  });

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  // Fetch Job
  const fetchJob = async () => {
    try {
      const { data } = await API.get<Job>(`/jobs/${id}`);
      setJob(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Proposal Input
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProposal({
      ...proposal,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Proposal
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting proposal:", proposal);

      await API.post("/proposals", {
        jobId: job?._id,
        ...proposal,
      });

      setApplied(true);
      toast.success('Proposal submitted successfully! 🎉');
    } catch (error: any) {
      console.error("ERROR:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to apply");
      console.log("Job ID:", job?._id);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Invalid ID
  if (!id) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-cyan-100/50 p-8 max-w-md w-full text-center border border-cyan-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Job ID</h2>
          <p className="text-gray-500">The job identifier you provided is not valid.</p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-cyan-100/50 p-8 max-w-2xl w-full border border-cyan-100">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-cyan-100 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-cyan-100 rounded w-full"></div>
              <div className="h-4 bg-cyan-100 rounded w-5/6"></div>
              <div className="h-4 bg-cyan-100 rounded w-4/6"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-cyan-100 rounded-full w-20"></div>
              <div className="h-8 bg-cyan-100 rounded-full w-24"></div>
              <div className="h-8 bg-cyan-100 rounded-full w-16"></div>
            </div>
            <div className="h-10 bg-cyan-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // No Job
  if (!job) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-cyan-100/50 p-8 max-w-md w-full text-center border border-cyan-100">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Job Not Found</h2>
          <p className="text-gray-500">The job you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-cyan-100/50 overflow-hidden border border-cyan-100 mb-6 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-200/50">
          <div className="bg-linear-to-r from-cyan-500 to-cyan-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed text-lg">{job.description}</p>
            
            {/* Skills Tags */}
            {job.skillsRequired?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-4 py-2 bg-linear-to-r from-cyan-50 to-blue-50 text-cyan-700 text-sm font-medium rounded-full border border-cyan-200 hover:from-cyan-100 hover:to-blue-100 transition-all duration-200 cursor-default"
                    >
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Badge */}
            <div className="mt-6 flex items-center gap-3">
              <div className="shrink-0 w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="text-2xl font-bold bg-cyan-600 bg-clip-text text-transparent">
                  ₹{job.budget}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Proposal Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-cyan-100/50 border border-cyan-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-200/50">
          
        {user?.role === "freelancer" ? (
          <>
          <div className="bg-cyan-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Submit Your Proposal
            </h2>
          </div>

          <div className="p-6">
            {applied ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200/50">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Proposal Submitted! 🎉</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your proposal has been successfully submitted. The client will review your application and get back to you soon.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  Awaiting Response
                </div>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-5">
                {/* Bid Amount */}
                <div className="group">
                  <label htmlFor="bidAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                    Bid Amount (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">₹</span>
                    </div>
                    <input
                      id="bidAmount"
                      name="bidAmount"
                      type="number"
                      placeholder="Enter your bid"
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 hover:border-cyan-300"
                      value={proposal.bidAmount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Set your expected compensation for this project</p>
                </div>

                {/* Duration */}
                <div className="group">
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated Duration
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      id="duration"
                      name="duration"
                      type="text"
                      placeholder="e.g., 7 days, 2 weeks"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 hover:border-cyan-300"
                      value={proposal.duration}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">How long will you need to complete this job?</p>
                </div>

                {/* Cover Letter */}
                <div className="group">
                  <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    rows={5}
                    placeholder="Tell the client why you're the perfect fit for this job..."
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 hover:border-cyan-300 resize-none"
                    value={proposal.coverLetter}
                    onChange={handleChange}
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Highlight your relevant experience and approach</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50 ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-cyan-700 shadow-lg shadow-cyan-200/50 hover:shadow-xl hover:shadow-cyan-300/50"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Proposal...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Proposal
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
          </>
        ):(
          <div className="p-10 text-center">
      
      <div className="w-22 h-22 mx-auto mb-6 bg-linear-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
       <svg 
  className="w-14 h-14 text-cyan-600" 
  fill="none" 
  stroke="currentColor" 
  viewBox="0 0 24 24"
>
  <path 
    strokeWidth={2} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V9a5 5 0 00-10 0v2H6a2 2 0 00-2 2v6a2 2 0 002 2zm3-10V9a3 3 0 116 0v2H9z" 
  />
</svg>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Want to apply for this job?
      </h3>

      <p className="text-gray-500 mb-4">
        Only freelancers can submit proposals.
      </p>

      <button
        onClick={() => toast(
      "🚀 Switch role feature coming soon!\n\n👉 Register as a freelancer to apply for jobs.")}
        className="px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:scale-105 transition"
      >
        Switch to Freelancer
      </button>
       </div>
       )}
       
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By submitting a proposal, you agree to our{" "}
            <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium underline-offset-2 hover:underline transition-colors">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;