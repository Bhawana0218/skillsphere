
import { useEffect, useState} from "react";
import API from "../../../services/api";
import { Link } from "react-router-dom";
import { 
  PlusIcon,
  MagnifyingGlassIcon,  
  FunnelIcon,           
  TrashIcon,            
  XMarkIcon,             
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,    
  UsersIcon,
  PencilSquareIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

// Job Type Interface
interface Job {
  _id: string;
  title: string;
  description: string;
  budget: number;
  skillsRequired: string[];
  company: string;
  location: string;
  postedBy: string;
  postedAt: Date | string;
  status: "active" | "closed" | "pending";
  applicationCount?: number;
}

// User Interface from localStorage
interface User {
  _id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

// Initial Filters State
interface Filters {
  keyword: string;
  minBudget: string;
  maxBudget: string;
  skills: string;
  status: string;
  sortBy: "newest" | "oldest" | "budget-asc" | "budget-desc";
}

 const formatCurrency = (value: number) => {
    // const num = parseFloat();
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Status badge colors
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "closed":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

export default function JobsDashboard() {
  // const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState<Filters>({
    keyword: "",
    minBudget: "",
    maxBudget: "",
    skills: "",
    status: "",
    sortBy: "newest",
  });
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: 0,
    skillsRequired: "" as string | string[],
    company: "",
    location: "",
    status: "active" as "active" | "closed" | "pending",
  });

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    applications: 0,
  });

  // Get user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchJobs();
  }, []);

  // Fetch all jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await API.get<Job[]>("/jobs");
      setJobs(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      showNotification("error", "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (jobData: Job[]) => {
    setStats({
      totalJobs: jobData.length,
      activeJobs: jobData.filter((j) => j.status === "active").length,
      pendingJobs: jobData.filter((j) => j.status === "pending").length,
      applications: jobData.reduce((acc, job) => acc + (job.applicationCount || 0), 0),
    });
  };

  // Show notification toast
  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Open modal for creating new job
  const openModal = (job: Job | null = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        description: job.description,
        budget: job.budget,
        skillsRequired: Array.isArray(job.skillsRequired) ? job.skillsRequired.join(", ") : job.skillsRequired,
        company: job.company,
        location: job.location,
        status: job.status,
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: "",
        description: "",
        budget: Number(0),
        skillsRequired: "",
        company: "",
        location: "",
        status: "active",
      });
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingJob(null);
    setFormData({
      title: "",
      description: "",
      budget: Number(0),
      skillsRequired: "",
      company: "",
      location: "",
      status: "active",
    });
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create or Update job
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showNotification("error", "Please log in to manage jobs");
      return;
    }

    try {
      const payload = {
        ...formData,
        skillsRequired: typeof formData.skillsRequired === "string" 
          ? formData.skillsRequired.split(",").map((s) => s.trim()).filter((s) => s)
          : formData.skillsRequired,
        postedBy: user._id,
        postedAt: new Date().toISOString(),
      };

      if (editingJob) {
        const response = await API.put(`/jobs/${editingJob._id}`, payload);
        showNotification("success", `Job updated successfully!`);
         console.log(response.data);
      } else {
        const response = await API.post("/jobs", payload);
        showNotification("success", `Job created successfully!`);
         console.log(response.data);
      }
     

      closeModal();
      fetchJobs();
    } catch (error: any) {
      console.error("Job save error:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to save job"
      );
    }
  };

  // Delete job
  const deleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      await API.delete(`/jobs/${jobId}`);
      showNotification("success", "Job deleted successfully!");
      fetchJobs();
    } catch (error: any) {
      console.error("Delete error:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to delete job"
      );
    }
  };

  // Search/Filter jobs
  const searchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.minBudget) params.append("minBudget", filters.minBudget);
    if (filters.maxBudget) params.append("maxBudget", filters.maxBudget);
    if (filters.skills) params.append("skills", filters.skills);
    if (filters.status) params.append("status", filters.status);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);

    const { data } = await API.get(`/jobs/search?${params.toString()}`);

    setJobs(data || []);
    calculateStats(data || []);
    } catch (error) {
      console.error("Search error:", error);
      showNotification("error", "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      keyword: "",
      minBudget: "",
      maxBudget: "",
      skills: "",
      status: "",
      sortBy: "newest",
    });
    fetchJobs();
  };

  // Format currency
 

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-cyan-50">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              notification.type === "success"
                ? "bg-emerald-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.type === "success" && (
              <CheckCircleIcon className="w-5 h-5" />
            )}
            {notification.type === "error" && (
              <ExclamationCircleIcon className="w-5 h-5" />
            )}
            {notification.type === "info" && (
              <ClockIcon className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <nav className="bg-white mt-10 shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <BriefcaseIcon className="w-8 h-8 text-cyan-600" />
              <span className="text-xl font-bold text-gray-900">
                Jobs
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* User Info */}
              {user && (
                <div className="flex items-center gap-3 px-4 py-2 bg-cyan-50 rounded-full">
                  <div className="w-8 h-8 bg-linear-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-cyan-600 capitalize">{user.role}</p>
                  </div>
                </div>
              )}

              {/* Add Job Button */}
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Post New Job</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Jobs", value: stats.totalJobs, icon: BriefcaseIcon, color: "text-cyan-600", bg: "bg-cyan-50" },
            { label: "Active Jobs", value: stats.activeJobs, icon: ArrowTrendingUpIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pending", value: stats.pendingJobs, icon: ClockIcon, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Applications", value: stats.applications, icon: UsersIcon, color: "text-blue-600", bg: "bg-blue-50" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bg} p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <FunnelIcon className="w-6 h-6 text-cyan-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Jobs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Keyword Search */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Job title..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 placeholder:text-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>

            {/* Min Budget */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Budget
              </label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minBudget}
                onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 placeholder:text-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>

            {/* Max Budget */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Budget
              </label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxBudget}
                onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 placeholder:text-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>

            {/* Skills */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <input
                type="text"
                placeholder="React, Node..."
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 text-blackrounded-lg focus:ring-2 text-black placeholder:text-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>

            {/* Sort & Action */}
            <div className="lg:col-span-1 flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget-asc">Budget: Low to High</option>
                <option value="budget-desc">Budget: High to Low</option>
              </select>
            </div>
          </div>

          {/* Status Filter Row */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={searchJobs}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Search
                </button>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-all duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Jobs Grid */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <BriefcaseIcon className="w-6 h-6 text-cyan-600" />
          Available Jobs
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({jobs.length} positions)
          </span>
        </h2>

        {loading ? (
          /* Loading Skeleton */
          <div className="grid gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100"
          >
            <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-500 mb-6">
              {filters.keyword || filters.status ? "Try adjusting your filters" : "Start by posting your first job"}
            </p>
            {!filters.keyword && !filters.status && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                Post Your First Job
              </button>
            )}
          </motion.div>
        ) : (
          /* Jobs Grid */
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onEdit={() => openModal(job)}
                onDelete={() => deleteJob(job._id)}
                canEdit={user?._id === job.postedBy}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Modal for Create/Edit Job */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingJob ? "Edit Job" : "Post New Job"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Fill in the details below
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon  className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Senior Frontend Developer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-blackfocus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Acme Technologies"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Location & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Remote / Bangalore / Mumbai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 text-blackrounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending Review</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range (₹) *
                  </label>
                  <input
                    type="number"
                    name="budget"
                    required
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="1000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-blackfocus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Skills Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills Required (comma separated) *
                  </label>
                  <input
                    type="text"
                    name="skillsRequired"
                    required
                    value={formData.skillsRequired}
                    onChange={handleInputChange}
                    placeholder="React, TypeScript, Node.js, MongoDB"
                    className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple skills with commas
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the job responsibilities, requirements, and benefits..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none"
                  />
                </div>
              </form>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {editingJob ? "Update Job" : "Post Job"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Job Card Component
function JobCard({ 
  job, 
  onEdit, 
  onDelete, 
  canEdit 
}: { 
  job: Job; 
  onEdit: () => void; 
  onDelete: () => void; 
  canEdit: boolean;
}) {
  const isOwner = canEdit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
      onClick={!canEdit ? onEdit : undefined}
    >
      <div className="p-6">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
              {job.title}
            </h3>
            <p className="text-sm text-gray-600">{job.company}</p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(
              job.status
            )}`}
          >
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>

        {/* Location & Posted Date */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(job.postedAt)}</span>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {job.description.length > 150
            ? `${job.description.substring(0, 150)}...`
            : job.description}
        </p>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(job.skillsRequired || []).slice(0, 5).map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-linear-to-r from-cyan-50 to-blue-50 text-cyan-700 text-xs font-medium rounded-full border border-cyan-200"
            >
              {skill}
            </span>
          ))}
          {(job.skillsRequired || []).length > 5 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
              +{(job.skillsRequired || []).length - 5} more
            </span>
          )}
        </div>

        {/* Bottom Section - Budget & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-600">{formatCurrency(job.budget)}</span>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg transition-all duration-200"
                  title="Edit"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </>
            )}
            
            {!isOwner && (
              <Link
                to={`/jobs/${job._id}`}
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}