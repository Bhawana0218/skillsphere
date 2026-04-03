
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import toast from "react-hot-toast";
import API from "../../../services/api";

// Job Type
interface JobForm {
  title: string;
  description: string;
  skillsRequired: string;
  budget: string;
  deadline: string;
}

function CreateJob() {

  const navigate = useNavigate();

  const [job, setJob] = useState<JobForm>({
    title: "",
    description: "",
    skillsRequired: "",
    budget: "",
    deadline: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);

  // Handle Change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);

  const toastId = toast.loading(
    isEditMode ? "Updating job..." : "Publishing job..."
  );

  try {
    const payload = {
      ...job,
      budget: Number(job.budget),
      skillsRequired: job.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    if (isEditMode) {
      await API.put(`/jobs/${id}`, payload);
      toast.success("Job updated successfully!", { id: toastId });
    } else {
      await API.post("/jobs", payload);

      toast.success("Job created successfully!", { id: toastId });
    }

    navigate("/jobs");
  } catch (error: any) {
    console.error(error);
    toast.error(error?.response?.data?.message || "Something went wrong", {
      id: toastId,
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Preview skills as tags
  const previewSkills = job.skillsRequired
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const { id } = useParams();

  useEffect(() => {
  if (id) {
    API.get(`/jobs/${id}`)
      .then((res) => {
        const data = res.data;

        setJob({
          title: data.title || "",
          description: data.description || "",
          skillsRequired: (data.skillsRequired || []).join(", "),
          budget: data.budget?.toString() || "",
          deadline: data.deadline?.split("T")[0] || "",
        });
      })
      .catch(() => {
        toast.error("Failed to load job");
      });
  }
}, [id]);

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role !== "client") {
    toast.error("Access denied");
    navigate("/");
  }
}, []);

useEffect(() => {
  if (isEditMode && id) {
    API.get(`/jobs/${id}`).then((res) => {
      const data = res.data;

      setJob({
        title: data.title,
        description: data.description,
        skillsRequired: data.skillsRequired.join(", "),
        budget: data.budget,
        deadline: data.deadline,
      });
    });
  }
}, [id]);

  const isEditMode = Boolean(id);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-200/50 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-cyan-600 bg-clip-text text-transparent">
            {isEditMode ? "Edit Job" : "Post a New Job"}
          </h1>
          <p className="mt-2 text-gray-600">
            Fill in the details below to attract top talent to your project
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-cyan-100/50 border border-cyan-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-200/50">
          {/* Card Header */}
          <div className="bg-cyan-500 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Job Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title Field */}
            <div className="group">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 transition-colors duration-200 ${isFocused === 'title' ? 'text-cyan-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Senior React Developer"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                    isFocused === 'title'
                      ? 'border-cyan-400 ring-4 ring-cyan-100'
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}
                  value={job.title}
                  onChange={handleChange}
                  onFocus={() => setIsFocused('title')}
                  onBlur={() => setIsFocused(null)}
                  required
                />
              </div>
            </div>

            {/* Description Field */}
            <div className="group">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-4 left-4 pointer-events-none">
                  <svg className={`w-5 h-5 transition-colors duration-200 ${isFocused === 'description' ? 'text-cyan-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200 resize-none ${
                    isFocused === 'description'
                      ? 'border-cyan-400 ring-4 ring-cyan-100'
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}
                  value={job.description}
                  onChange={handleChange}
                  onFocus={() => setIsFocused('description')}
                  onBlur={() => setIsFocused(null)}
                  required
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Be specific about requirements and expectations</p>
            </div>

            {/* Skills Field with Preview */}
            <div className="group">
              <label htmlFor="skillsRequired" className="block text-sm font-semibold text-gray-700 mb-2">
                Required Skills <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 transition-colors duration-200 ${isFocused === 'skillsRequired' ? 'text-cyan-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <input
                  id="skillsRequired"
                  name="skillsRequired"
                  type="text"
                  placeholder="React, TypeScript, Node.js (comma separated)"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                    isFocused === 'skillsRequired'
                      ? 'border-cyan-400 ring-4 ring-cyan-100'
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}
                  value={job.skillsRequired}
                  onChange={handleChange}
                  onFocus={() => setIsFocused('skillsRequired')}
                  onBlur={() => setIsFocused(null)}
                  required
                />
              </div>
              
              {/* Skills Preview Tags */}
              {previewSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previewSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 bg-linear-to-r from-cyan-50 to-blue-50 text-cyan-700 text-sm font-medium rounded-full border border-cyan-200 animate-fade-in"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => {
                          const newSkills = previewSkills.filter((_, i) => i !== index);
                          setJob({ ...job, skillsRequired: newSkills.join(', ') });
                        }}
                        className="ml-2 text-cyan-400 hover:text-cyan-600 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1.5 text-xs text-gray-500">Separate multiple skills with commas</p>
            </div>

            {/* Budget & Deadline Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Budget */}
              <div className="group">
                <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className={`font-medium transition-colors duration-200 ${isFocused === 'budget' ? 'text-cyan-500' : 'text-gray-400'}`}>₹</span>
                  </div>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="50000"
                    className={`w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                      isFocused === 'budget'
                        ? 'border-cyan-400 ring-4 ring-cyan-100'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                    value={job.budget}
                    onChange={handleChange}
                    onFocus={() => setIsFocused('budget')}
                    onBlur={() => setIsFocused(null)}
                    required
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="group">
                <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-2">
                  Application Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors duration-200 ${isFocused === 'deadline' ? 'text-cyan-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-800 focus:outline-none transition-all duration-200 ${
                      isFocused === 'deadline'
                        ? 'border-cyan-400 ring-4 ring-cyan-100'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                    value={job.deadline}
                    onChange={handleChange}
                    onFocus={() => setIsFocused('deadline')}
                    onBlur={() => setIsFocused(null)}
                    required
                  />
                </div>
              </div>
            </div>

         {isEditMode && (
          <button
            type="button"
            onClick={async () => {
            if (!window.confirm("Delete this job?")) return;

             const toastId = toast.loading("Deleting job...");

             try {
              await API.delete(`/jobs/${id}`);
              toast.success("Job deleted!", { id: toastId });
              navigate("/jobs");
             } catch (error) {
             toast.error("Failed to delete job", { id: toastId });
             }
           }}
              className="w-full mb-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Delete Job
            </button>
           )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-cyan-700 hover:from-cyan-800 shadow-lg shadow-cyan-200/50 hover:shadow-xl hover:shadow-cyan-300/50"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                   {isEditMode ? "Updating Job..." : "Publishing Job..."}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isEditMode ? "Update Job" : "Post Job Now"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Helper Footer */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-cyan-100">
            <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600">
              Jobs are reviewed within 24 hours before going live
            </span>
          </div>
        </div>
      </div>

      {/* Custom Animation Style */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CreateJob;