
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Search, Code, ShieldCheck, Zap, MessageSquare,X, MapPin, Star, 
  Clock, CheckCircle, Heart, ChevronDown,
  Bell, ArrowRight, Globe, Lock, TrendingUp,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

// --- Types ---
interface Project {
  id: number;
  title: string;
  category: string;
  budget: string;
  budgetRange: { min: number; max: number };
  location: string;
  coordinates?: { lat: number; lng: number };
  postedAt: string;
  postedTimestamp: number;
  tags: string[];
  description: string;
  client: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  applications: number;
  featured?: boolean;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// --- Mock Data ---
const TESTIMONIALS: Testimonial[] = [];

const FAQS: FAQ[] = [];

const CATEGORIES = ["All", "Web Development", "Mobile Development", "Graphic Design", "Digital Marketing", "3D Design", "Writing & Translation", "Data Science"];

// --- Utility Components ---

const Toast: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Bell className="w-5 h-5 text-blue-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-amber-50 border-amber-200"
  };

  useEffect(() => {
    const timer = setTimeout(onClose, notification.duration || 4000);
    return () => clearTimeout(timer);
  }, [notification.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-lg max-w-sm ${bgColors[notification.type]}`}
    >
      {icons[notification.type]}
      <p className="text-sm font-medium text-slate-800 flex-1">{notification.message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-5 bg-slate-200 rounded w-24"></div>
      <div className="h-4 bg-slate-200 rounded w-16"></div>
    </div>
    <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
    <div className="flex gap-2 mb-4">
      <div className="h-6 w-14 bg-slate-200 rounded-full"></div>
      <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
      <div className="h-6 w-12 bg-slate-200 rounded-full"></div>
    </div>
    <div className="flex items-center gap-2 mb-4">
      <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
      <div className="h-4 bg-slate-200 rounded w-24"></div>
    </div>
    <div className="h-10 bg-slate-200 rounded-lg w-full mt-auto"></div>
  </div>
);

const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const { scrollYProgress } = useScroll();
  const isInView = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  useEffect(() => {
    const unsubscribe = isInView.onChange((latest) => {
      if (latest > 0.5 && count === 0) {
        let start = 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        return () => clearInterval(timer);
      }
    });
    return () => unsubscribe?.();
  }, [end, duration, isInView, count]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// --- Main Component ---

const SkillSphereHome: React.FC = () => {
  // State Management
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "budget-high" | "budget-low" | "applications">("newest");
 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
 
  const [isPostProjectModalOpen, setIsPostProjectModalOpen] = useState(false);
  
  const [postProjectData, setPostProjectData] = useState({
    title: '',
    category: CATEGORIES[1] || 'Web Development',
    budgetRange: '300-500',
    locationPreference: 'Either',
    duration: '1 month',
    description: '',
  });

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isPlayingTestimonial] = useState(true);
  // const [isMuted, setIsMuted] = useState(true);

  // Notification system
  const addNotification = useCallback((type: Notification['type'], message: string, duration?: number) => {
  const id = Math.random().toString(36).slice(2);
  setNotifications(prev => [...prev, { id, type, message, duration }]);
}, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handlePostProjectField = (field: keyof typeof postProjectData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setPostProjectData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const mapBackendJobs = (jobs: any[]): Project[] =>
    jobs.map((job) => ({
      id: job._id || job.id || Math.random().toString(36).slice(2),
      title: job.title || 'New Project',
      category: job.skillsRequired?.[0] || 'Web Development',
      budget: typeof job.budget === 'number' ? `₹${job.budget.toLocaleString()}` : job.budget || '$500',
      budgetRange: {
        min: typeof job.budget === 'number' ? job.budget : 0,
        max: typeof job.budget === 'number' ? job.budget : 0,
      },
      location: job.location || 'Remote',
      coordinates: job.coordinates,
      postedAt: job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Just now',
      postedTimestamp: job.createdAt ? new Date(job.createdAt).getTime() : Date.now(),
      tags: job.skillsRequired || [],
      description: job.description || '',
      client: {
        name: job.client?.name || 'Verified Client',
        avatar: job.client?.avatar || '💼',
        rating: job.client?.rating || 4.7,
        verified: job.client?.verified ?? true,
      },
      applications: job.proposalCount || 0,
    }));

  // 🔧 FIXED: Load projects with proper state management
  useEffect(() => {
    let isMounted = true;
    
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/jobs');
        if (isMounted) {
          const normalized = mapBackendJobs(Array.isArray(data) ? data : []);
          setProjects(normalized.length ? normalized : []);
          setFilteredProjects(normalized.length ? normalized : []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        if (isMounted) {
          addNotification('error', 'Failed to load projects. Please try again.');
          setProjects([]);
          setFilteredProjects([]);
          setLoading(false);
        }
      }
    };
    
    fetchProjects();
    
    return () => {
      isMounted = false; // Cleanup to prevent state updates on unmounted component
    };
  }, [addNotification]);

  //  Separate filtering/sorting effect with proper guards
  useEffect(() => {
    // Don't filter if projects aren't loaded yet
    if (projects.length === 0) return;
    
    let result = [...projects];
    
    // Search filter (only if query has content)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query)) ||
        p.location.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // Sorting - create NEW array to avoid mutation issues
    const sorted = [...result];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => b.postedTimestamp - a.postedTimestamp);
        break;
      case "budget-high":
        sorted.sort((a, b) => b.budgetRange.max - a.budgetRange.max);
        break;
      case "budget-low":
        sorted.sort((a, b) => a.budgetRange.min - b.budgetRange.min);
        break;
      case "applications":
        sorted.sort((a, b) => b.applications - a.applications);
        break;
    }
    
    setFilteredProjects(sorted);
  }, [projects, searchQuery, selectedCategory, sortBy]);


  // Auto-rotate testimonials
  useEffect(() => {
  if (!isPlayingTestimonial || TESTIMONIALS.length === 0) return;

  const interval = setInterval(() => {
    setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
  }, 6000);

  return () => clearInterval(interval);
}, [isPlayingTestimonial]);


  // Handlers
  const handleApply = (project: Project) => {
    addNotification("success", `Application submitted for "${project.title}"!`);
    setSelectedProject(null);
  };

  const handleSaveProject = (project: Project) => {
    addNotification('info', `Saved "${project.title}" to favorites`);
  };

  const handleSearchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('keyword', searchQuery.trim());
      if (selectedCategory !== 'All') params.append('skills', selectedCategory);
      const backendSort = sortBy === 'budget-high'
        ? 'budget-desc'
        : sortBy === 'budget-low'
          ? 'budget-asc'
          : 'newest';
      params.append('sortBy', backendSort);

      const { data } = await api.get(`/jobs/search?${params.toString()}`);
      const normalized = mapBackendJobs(Array.isArray(data) ? data : []);
      setProjects(normalized.length ? normalized : []);
      setFilteredProjects(normalized.length ? normalized : []);
    } catch (error) {
      console.error('Search failed:', error);
      addNotification('error', 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(prev => prev === index ? null : index);
  };

  // Memoized values
  const stats = useMemo(() => [
    { label: "Active Freelancers", value: 50000, suffix: "+" },
    { label: "Projects Completed", value: 125000, suffix: "+" },
    { label: "Client Satisfaction", value: 98, suffix: "%" },
    { label: "Cities Covered", value: 250, suffix: "+" }
  ], []);

  const currentTestimonial =
  TESTIMONIALS.length > 0
    ? TESTIMONIALS[activeTestimonial]
    : null;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* Toast Notifications */}
      <AnimatePresence>
        {notifications.map(notification => (
          <Toast 
            key={notification.id} 
            notification={notification} 
            onClose={() => removeNotification(notification.id)} 
          />
        ))}
      </AnimatePresence>

      {/* --- Navigation --- */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/90 sticky backdrop-blur-xl w-full z-50 border-b border-slate-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              
            </motion.div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex mx-auto items-center space-x-1">
              {["Find Work", "Find Talent", "How it Works", "Pricing"].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ y: -2 }}
                  className="px-4 py-2 text-slate-600 hover:text-cyan-600 font-medium transition-colors relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-linear-to-r from-cyan-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </motion.nav> 

      {/* --- Hero Section --- */}
      <section className="relative  -mt-28   pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-100/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[linear-linear(to_right,#cbd5e120_1px,transparent_1px),linear-linear(to_bottom,#cbd5e120_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-50 to-blue-50 border border-cyan-200 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
             
              Intelligent Hyperlocal Ecosystem • AI-Powered Matching
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight"
            >
              Hire Local Talent.<br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-600 animate-linear-x">
                Powered by AI.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              SkillSphere connects clients with verified professionals in your area. 
              Experience secure milestone payments, AI-driven matching, and real-time collaboration—all in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-2xl mx-auto mb-10"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  <Search className="w-5 h-5 text-slate-400 ml-5" />
                  <input
                    type="text"
                    placeholder="Search projects, skills, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-4 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSearchProjects}
                    className="m-2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-medium transition-all shadow-md"
                  >
                    Search
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPostProjectModalOpen(true)}
                className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group"
              >
                Post a Project 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                Browse Talent 
                <Code className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-16 flex flex-wrap justify-center gap-6 text-base text-slate-500"
            >
              {["🔒 Secure Escrow", "⭐ 4.9/5 Rating", "🌍 250+ Cities", "💬 24/7 Support"].map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{badge}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400"
        >
          {/* <ChevronDown className="w-6 h-6" /> */}
        </motion.div>
      </section>

      {/* --- Stats Section --- */}
      <section className="py-12 bg-slate-200/50 backdrop-blur-sm border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-600 to-blue-600 mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Industry Leaders Choose SkillSphere
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              We've engineered a complete ecosystem to ensure your projects succeed with zero friction and maximum impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "AI-Powered Matching",
                description: "Our HuggingFace AI engine analyzes skills, location, and work style to recommend the perfect freelancer instantly. 94% match accuracy.",
                color: "cyan",
                delay: 0
              },
              {
                icon: ShieldCheck,
                title: "Secure Escrow Payments",
                description: "Funds held in encrypted escrow, released only when milestones are approved. Integrated with Stripe & Razorpay for global coverage.",
                color: "blue",
                delay: 0.1
              },
              {
                icon: MessageSquare,
                title: "Real-Time Collaboration",
                description: "Built-in chat, file sharing, screen sharing, and video calls powered by WebRTC keep your team connected throughout the project.",
                color: "cyan",
                delay: 0.2
              },
              {
                icon: MapPin,
                title: "Hyperlocal Search",
                description: "Find professionals in your city for in-person meetings or local expertise. Filter by distance, availability, and on-site capability.",
                color: "blue",
                delay: 0.3
              },
              {
                icon: Star,
                title: "Smart Reputation System",
                description: "Weighted reputation scores, verified reviews, and AI fraud detection ensure you only work with trusted, high-quality talent.",
                color: "cyan",
                delay: 0.4
              },
              {
                icon: Clock,
                title: "Project Intelligence",
                description: "Track milestones, deadlines, and progress with AI-powered insights. Get proactive alerts for potential delays or budget overruns.",
                color: "blue",
                delay: 0.5
              }
            ].map((feature, _) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group p-7 rounded-2xl bg-linear-to-br from-slate-50 to-white border border-slate-200/50 hover:border-cyan-300/50 transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br from-${feature.color}-100 to-${feature.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Projects Section (FIXED) --- */}
      <section className="py-20 bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Featured Opportunities
              </h2>
              <p className="text-slate-600">
                Discover high-quality projects matched to your expertise
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="budget-high">Highest Budget</option>
                  <option value="budget-low">Lowest Budget</option>
                  <option value="applications">Most Applications</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 🔧 FIXED: Loading/Empty/Projects rendering logic */}
          {loading ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-slate-200"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your search or filters</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="text-cyan-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            // 🔧 FIXED: Projects Grid - simplified without complex AnimatePresence
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 hover:border-cyan-300/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {project.featured && (
                        <span className="px-2.5 py-1 bg-linear-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                          Featured
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        project.category === "Web Development" ? "bg-blue-50 text-blue-700" :
                        project.category === "Mobile Development" ? "bg-cyan-50 text-cyan-700" :
                        project.category === "Graphic Design" ? "bg-purple-50 text-purple-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {project.category}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {project.postedAt}
                    </span>
                  </div>
                  
                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
                    {project.description}
                  </p>
                  
                  {/* Location & Client */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{project.client.avatar}</span>
                      <span className="font-medium text-slate-700">{project.client.name}</span>
                      {project.client.verified && (
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-xs text-slate-400 px-1">+{project.tags.length - 3}</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg text-slate-900">{project.budget}</span>
                      <div className="text-xs text-slate-500">{project.applications} applications</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); handleSaveProject(project); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Save project"
                      >
                        <Heart className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl transition-all shadow-md"
                        aria-label="Apply now"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* View All Button */}
          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:border-cyan-400 hover:text-cyan-600 transition-all shadow-sm"
            >
              View All Projects <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section className="py-20 bg-linear-to-br from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Loved by Freelancers & Clients Alike
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Don't just take our word for it. Here's what our community has to say.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-200/50"
              >
                <div className="flex items-center gap-1 mb-6">
        
                  {/* TESTIMONIALS[activeTestimonial]; */}

{[...Array(5)].map((_, i) => (
  <Star 
    key={i} 
    className={`w-5 h-5 ${
      i < (currentTestimonial?.rating ??  0)
        ? "text-amber-400 fill-amber-400"
        : "text-slate-300"
    }`} 
  />
))}
                  {/* {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < TESTIMONIALS[activeTestimonial]?.rating ?? 0 ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} 
                    />
                  ))} */}
                </div>
                
                <blockquote className="text-xl md:text-2xl font-medium text-slate-800 mb-8 leading-relaxed">
                  "{currentTestimonial?.content || 'No testimonials available yet.'}"
                </blockquote>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-2xl">
                    {currentTestimonial?.avatar || "👤"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{currentTestimonial?.name || "Anonymous"}</div>
                    <div className="text-slate-600">
  {currentTestimonial
    ? `${currentTestimonial.role} at ${currentTestimonial.company}`
    : "No role information"}
</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setActiveTestimonial(prev => prev === 0 ? TESTIMONIALS.length - 1 : prev - 1)}
                className="p-3 rounded-full bg-white border border-slate-200 hover:border-cyan-400 transition-colors shadow-sm"
                aria-label="Previous testimonial"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeTestimonial 
                        ? "bg-linear-to-r from-cyan-500 to-blue-500 w-8" 
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => {
  if (TESTIMONIALS.length === 0) return;
  setActiveTestimonial(prev => prev === TESTIMONIALS.length - 1 ? 0 : prev + 1);
}}
                className="p-3 rounded-full bg-white border border-slate-200 hover:border-cyan-400 transition-colors shadow-sm"
                aria-label="Next testimonial"
              >
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-lg">
              Everything you need to know about getting started with SkillSphere
            </p>
          </motion.div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-slate-900 hover:bg-slate-100/50 transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-20 bg-linear-to-br from-blue-600 via-cyan-600 to-cyan-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* <Sparkles className="w-12 h-12 mx-auto mb-6 text-white/90" /> */}
            <img 
                  src="./Logo.png" 
                  alt="SkillSphere" 
                  className="mx-auto block w-900 h-60 object-contain -my-12" 
             />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform How You Work?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Join over 50,000+ professionals and businesses building the future of work—locally and globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(255, 255, 255, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl"
              >
                Get Started as Freelancer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Hire a Pro Today
              </motion.button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-blue-100/90">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" /> Bank-Level Security
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> 98% Satisfaction Rate
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> Available in 190+ Countries
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Project Detail Modal --- */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 p-6 flex items-start justify-between z-10">
                <div>
                  <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full mb-3">
                    {selectedProject.category}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedProject.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Budget</div>
                    <div className="font-bold text-lg text-slate-900">{selectedProject.budget}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Location</div>
                    <div className="font-medium text-slate-700 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {selectedProject.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Posted</div>
                    <div className="font-medium text-slate-700">{selectedProject.postedAt}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Project Description</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedProject.description}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-2xl">
                  <h4 className="font-bold text-slate-900 mb-4">About the Client</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-2xl">
                      {selectedProject.client.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {selectedProject.client.name}
                        {selectedProject.client.verified && (
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.round(selectedProject.client.rating) ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} 
                          />
                        ))}
                        <span className="text-slate-500 ml-1">{selectedProject.client.rating} rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-slate-900">{selectedProject.applications}</div>
                    <div className="text-sm text-slate-500">Applications</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-slate-900">48h</div>
                    <div className="text-sm text-slate-500">Avg. Response</div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 p-6 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApply(selectedProject)}
                  className="flex-1 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Apply Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSaveProject(selectedProject)}
                  className="px-6 py-4 border border-slate-300 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" /> Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Post Project Modal --- */}
      <AnimatePresence>
        {isPostProjectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsPostProjectModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Post a New Project</h3>
                <button
                  onClick={() => setIsPostProjectModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., React Native App for Local Delivery"
                    value={postProjectData.title}
                    onChange={handlePostProjectField('title')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                    <select
                      value={postProjectData.category}
                      onChange={handlePostProjectField('category')}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
                    >
                      {CATEGORIES.filter(c => c !== "All").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Budget *</label>
                    <select
                      value={postProjectData.budgetRange}
                      onChange={handlePostProjectField('budgetRange')}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
                    >
                      <option value="300-500">$300 - $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-2500">$1,000 - $2,500</option>
                      <option value="2500+">$2,500+</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location Preference</label>
                  <div className="flex gap-3">
                    {["Remote", "Local", "Either"].map((loc) => (
                      <label key={loc} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="location" className="text-cyan-600 focus:ring-cyan-500" checked={postProjectData.locationPreference === loc} onChange={() => setPostProjectData(prev => ({ ...prev, locationPreference: loc }))} />
                        <span className="text-sm text-slate-700">{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duration *</label>
                  <select
                    value={postProjectData.duration}
                    onChange={handlePostProjectField('duration')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
                  >
                    <option value="1 month">1 month</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="3 months">3 months</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your project, goals, and requirements..."
                    value={postProjectData.description}
                    onChange={handlePostProjectField('description')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 resize-none"
                  ></textarea>
                </div>

                
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-800">
                    Your project will be reviewed by our AI matching engine and shown to qualified freelancers within minutes. Funds are held securely in escrow.
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => setIsPostProjectModalOpen(false)}
                  className="flex-1 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsPostProjectModalOpen(false);
                    addNotification("success", "Project posted successfully! Matching with freelancers...");
                  }}
                  className="flex-1 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
                >
                  Post Project • $5 Fee
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillSphereHome;






