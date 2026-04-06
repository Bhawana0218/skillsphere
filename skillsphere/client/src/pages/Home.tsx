
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
// import { 
//   Search, Code, ShieldCheck, Zap, MessageSquare,X, MapPin, Star, 
//   Clock, CheckCircle, Heart, ChevronDown,
//   Bell, ArrowRight, Globe, Lock, TrendingUp,
//   AlertCircle
// } from 'lucide-react';
// import api from '../services/api';

// // --- Types ---
// interface Project {
//   id: number | string;
//   title: string;
//   category: string;
//   budget: string;
//   budgetRange: { min: number; max: number };
//   location: string;
//   coordinates?: { lat: number; lng: number };
//   postedAt: string;
//   postedTimestamp: number;
//   tags: string[];
//   description: string;
//   client: {
//     name: string;
//     avatar: string;
//     rating: number;
//     verified: boolean;
//   };
//   applications: number;
//   featured?: boolean;

//    freelancer?: {
//     id?: string;
//     name?: string;
//   };
// }

// interface Review {
//   _id: string;
//   rating: number;
//   comment: string;
//   reviewer?: {
//     name: string;
//   };
// }

// interface Testimonial {
//   id: number;
//   name: string;
//   role: string;
//   company: string;
//   avatar: string;
//   content: string;
//   rating: number;
// }

// interface FAQ {
//   question: string;
//   answer: string;
// }

// interface Notification {
//   id: string;
//   type: 'success' | 'error' | 'info' | 'warning';
//   message: string;
//   duration?: number;
// }


// const FAQS: FAQ[] = [];

// const CATEGORIES = ["All", "Web Development", "Mobile Development", "Graphic Design", "Digital Marketing", "3D Design", "Writing & Translation", "Data Science"];

// // --- Utility Components ---

// const Toast: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
//   const icons = {
//     success: <CheckCircle className="w-5 h-5 text-green-600" />,
//     error: <AlertCircle className="w-5 h-5 text-red-600" />,
//     info: <Bell className="w-5 h-5 text-blue-600" />,
//     warning: <AlertCircle className="w-5 h-5 text-amber-600" />
//   };

//   const bgColors = {
//     success: "bg-green-50 border-green-200",
//     error: "bg-red-50 border-red-200",
//     info: "bg-blue-50 border-blue-200",
//     warning: "bg-amber-50 border-amber-200"
//   };

//   useEffect(() => {
//     const timer = setTimeout(onClose, notification.duration || 4000);
//     return () => clearTimeout(timer);
//   }, [notification.duration, onClose]);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 50, scale: 0.9 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       exit={{ opacity: 0, y: 20, scale: 0.95 }}
//       className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-lg max-w-sm ${bgColors[notification.type]}`}
//     >
//       {icons[notification.type]}
//       <p className="text-sm font-medium text-slate-800 flex-1">{notification.message}</p>
//       <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
//         <X className="w-4 h-4" />
//       </button>
//     </motion.div>
//   );
// };

// const SkeletonCard: React.FC = () => (
//   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
//     <div className="flex justify-between items-start mb-4">
//       <div className="h-5 bg-slate-200 rounded w-24"></div>
//       <div className="h-4 bg-slate-200 rounded w-16"></div>
//     </div>
//     <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
//     <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
//     <div className="flex gap-2 mb-4">
//       <div className="h-6 w-14 bg-slate-200 rounded-full"></div>
//       <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
//       <div className="h-6 w-12 bg-slate-200 rounded-full"></div>
//     </div>
//     <div className="flex items-center gap-2 mb-4">
//       <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
//       <div className="h-4 bg-slate-200 rounded w-24"></div>
//     </div>
//     <div className="h-10 bg-slate-200 rounded-lg w-full mt-auto"></div>
//   </div>
// );

// const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2000, suffix = "" }) => {
//   const [count, setCount] = useState(0);
//   const { scrollYProgress } = useScroll();
//   const isInView = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

//   useEffect(() => {
//     const unsubscribe = isInView.onChange((latest) => {
//       if (latest > 0.5 && count === 0) {
//         let start = 0;
//         const increment = end / (duration / 16);
//         const timer = setInterval(() => {
//           start += increment;
//           if (start >= end) {
//             setCount(end);
//             clearInterval(timer);
//           } else {
//             setCount(Math.floor(start));
//           }
//         }, 16);
//         return () => clearInterval(timer);
//       }
//     });
//     return () => unsubscribe?.();
//   }, [end, duration, isInView, count]);

//   return <span>{count.toLocaleString()}{suffix}</span>;
// };

// // --- Main Component ---

// const SkillSphereHome: React.FC = () => {
//   // State Management
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [newReview, setNewReview] = useState({
//   rating: 5,
//   reviewText: ""
//   });
 
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [sortBy, setSortBy] = useState<"newest" | "budget-high" | "budget-low" | "applications">("newest");
 
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [selectedProject, setSelectedProject] = useState<Project | null>(null);
 
//   const [isPostProjectModalOpen, setIsPostProjectModalOpen] = useState(false);

//   const [testimonials, settestimonials] = useState<Testimonial[]>([]);
  
//   const [postProjectData, setPostProjectData] = useState({
//     title: '',
//     category: CATEGORIES[1] || 'Web Development',
//     budgetRange: '300-500',
//     locationPreference: 'Either',
//     duration: '1 month',
//     description: '',
//   });

//   const [activeTestimonial, setActiveTestimonial] = useState(0);
//   const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
//   const [isPlayingTestimonial] = useState(true);
//   const [ratingData, setRatingData] = useState({ avgRating: 0, totalReviews: 0 });

//   // const [isMuted, setIsMuted] = useState(true);

//   // Notification system
//   const addNotification = useCallback((type: Notification['type'], message: string, duration?: number) => {
//   const id = Math.random().toString(36).slice(2);
//   setNotifications(prev => [...prev, { id, type, message, duration }]);
// }, []);

//   const removeNotification = useCallback((id: string) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   }, []);

//   const handlePostProjectField = (field: keyof typeof postProjectData) => (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     setPostProjectData(prev => ({ ...prev, [field]: e.target.value }));
//   };

//   const mapBackendJobs = (jobs: any[]): Project[] =>
//     jobs.map((job) => ({
//       id: job._id || job.id || Math.random().toString(36).slice(2),
//       title: job.title || 'New Project',
//       category: job.skillsRequired?.[0] || 'Web Development',
//       budget: typeof job.budget === 'number' ? `₹${job.budget.toLocaleString()}` : job.budget || '$500',
//       budgetRange: {
//         min: typeof job.budget === 'number' ? job.budget : 0,
//         max: typeof job.budget === 'number' ? job.budget : 0,
//       },
//       location: job.location || 'Remote',
//       coordinates: job.coordinates,
//       postedAt: job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Just now',
//       postedTimestamp: job.createdAt ? new Date(job.createdAt).getTime() : Date.now(),
//       tags: job.skillsRequired || [],
//       description: job.description || '',
//       client: {
//         name: job.client?.name || 'Verified Client',
//         avatar: job.client?.avatar || '💼',
//         rating: job.client?.rating || 4.7,
//         verified: job.client?.verified ?? true,
//       },
//       freelancer: {
//     id: job.freelancer?._id,
//     name: job.freelancer?.name
//   },
//       applications: job.proposalCount || 0,
//     }));

//   // 🔧 FIXED: Load projects with proper state management
//   useEffect(() => {
//     let isMounted = true;
    
//     const fetchProjects = async () => {
//       try {
//         setLoading(true);
//         const { data } = await api.get('/jobs');
//         if (isMounted) {
//           const normalized = mapBackendJobs(Array.isArray(data) ? data : []);
//           setProjects(normalized.length ? normalized : []);
//           setFilteredProjects(normalized.length ? normalized : []);
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error('Failed to fetch projects:', error);
//         if (isMounted) {
//           addNotification('error', 'Failed to load projects. Please try again.');
//           setProjects([]);
//           setFilteredProjects([]);
//           setLoading(false);
//         }
//       }
//     };
    
//     fetchProjects();
    
//     return () => {
//       isMounted = false; // Cleanup to prevent state updates on unmounted component
//     };
//   }, [addNotification]);

//   //  Separate filtering/sorting effect with proper guards
//   useEffect(() => {
//     // Don't filter if projects aren't loaded yet
//     if (projects.length === 0) return;
    
//     let result = [...projects];
    
//     // Search filter (only if query has content)
//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase();
//       result = result.filter(p => 
//         p.title.toLowerCase().includes(query) ||
//         p.description.toLowerCase().includes(query) ||
//         p.tags.some(tag => tag.toLowerCase().includes(query)) ||
//         p.location.toLowerCase().includes(query)
//       );
//     }
    
//     // Category filter
//     if (selectedCategory !== "All") {
//       result = result.filter(p => p.category === selectedCategory);
//     }
    
//     // Sorting - create NEW array to avoid mutation issues
//     const sorted = [...result];
//     switch (sortBy) {
//       case "newest":
//         sorted.sort((a, b) => b.postedTimestamp - a.postedTimestamp);
//         break;
//       case "budget-high":
//         sorted.sort((a, b) => b.budgetRange.max - a.budgetRange.max);
//         break;
//       case "budget-low":
//         sorted.sort((a, b) => a.budgetRange.min - b.budgetRange.min);
//         break;
//       case "applications":
//         sorted.sort((a, b) => b.applications - a.applications);
//         break;
//     }
    
//     setFilteredProjects(sorted);
//   }, [projects, searchQuery, selectedCategory, sortBy]);


//   // Auto-rotate testimonials
//   useEffect(() => {
//   if (!isPlayingTestimonial || testimonials.length === 0) return;

//   const interval = setInterval(() => {
//     setActiveTestimonial(prev => (prev + 1) % testimonials.length);
//   }, 6000);

//   return () => clearInterval(interval);
// }, [isPlayingTestimonial, testimonials.length]);


//   // Handlers
//   const handleApply = (project: Project) => {
//     addNotification("success", `Application submitted for "${project.title}"!`);
//     setSelectedProject(null);
//   };

//   const handleSaveProject = (project: Project) => {
//     addNotification('info', `Saved "${project.title}" to favorites`);
//   };

//   const handleSearchProjects = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (searchQuery.trim()) params.append('keyword', searchQuery.trim());
//       if (selectedCategory !== 'All') params.append('skills', selectedCategory);
//       const backendSort = sortBy === 'budget-high'
//         ? 'budget-desc'
//         : sortBy === 'budget-low'
//           ? 'budget-asc'
//           : 'newest';
//       params.append('sortBy', backendSort);

//       const { data } = await api.get(`/jobs/search?${params.toString()}`);
//       const normalized = mapBackendJobs(Array.isArray(data) ? data : []);
//       setProjects(normalized.length ? normalized : []);
//       setFilteredProjects(normalized.length ? normalized : []);
//     } catch (error) {
//       console.error('Search failed:', error);
//       addNotification('error', 'Search failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleFaq = (index: number) => {
//     setExpandedFaq(prev => prev === index ? null : index);
//   };

//   // Memoized values
//   const stats = useMemo(() => [
//     { label: "Active Freelancers", value: 50000, suffix: "+" },
//     { label: "Projects Completed", value: 125000, suffix: "+" },
//     { label: "Client Satisfaction", value: 98, suffix: "%" },
//     { label: "Cities Covered", value: 250, suffix: "+" }
//   ], []);

//   const currentTestimonial =
//   testimonials.length > 0
//     ? testimonials[activeTestimonial]
//     : null;

//     useEffect(() => {
//   const fetchtestimonials = async () => {
//     try {
//       const { data } = await api.get("/testimonials");
//       settestimonials(data || []);
//     } catch (error) {
//       console.error("Failed to fetch testimonials", error);
//     }
//   };

//   fetchtestimonials();

// }, []);

// useEffect(() => {
//   if (!selectedProject?.freelancer?.id) return;

//   const fetchRating = async () => {
//     const { data } = await api.get(
//       `/reviews/rating/${selectedProject?.freelancer?.id}`
//     );
//     setRatingData(data);
//   };

//   fetchRating();
// }, [selectedProject]);

// const handleSubmitReview = async () => {
//   if (!selectedProject?.freelancer?.id) {
//     addNotification("error", "No freelancer selected");
//     return;
//   }

//   try {
//     await api.post("/reviews", {
//       jobId: selectedProject.id, // ✅ now safe
//       freelancerId: selectedProject.freelancer.id,
//       rating: newReview.rating,
//       comment: newReview.reviewText
//     });

//     addNotification("success", "Review submitted!");

//     // refresh reviews
//     const { data } = await api.get(
//       `/reviews/${selectedProject.freelancer.id}`
//     );
//     setReviews(data);

//     setNewReview({ rating: 5, reviewText: "" });

//   } catch (error) {
//     addNotification("error", "Failed to submit review");
//   }
// };

// useEffect(() => {
//   if (!selectedProject?.freelancer?.id) return;

//   const fetchReviews = async () => {
//     try {
//       const { data } = await api.get(
//         `/reviews/${selectedProject?.freelancer?.id}`
//       );
//       setReviews(data);
//     } catch (error) {
//       console.error("Failed to fetch reviews");
//     }
//   };

//   fetchReviews();
// }, [selectedProject]);

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-800">
      
//       {/* Toast Notifications */}
//       <AnimatePresence>
//         {notifications.map(notification => (
//           <Toast 
//             key={notification.id} 
//             notification={notification} 
//             onClose={() => removeNotification(notification.id)} 
//           />
//         ))}
//       </AnimatePresence>

//       {/* --- Navigation --- */}
//       <motion.nav 
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         className="bg-white/90 sticky backdrop-blur-xl w-full z-50 border-b border-slate-200/50 shadow-sm"
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-20 items-center">
//             {/* Logo */}
//             <motion.div 
//               whileHover={{ scale: 1.05 }}
//               className="flex items-center gap-3 cursor-pointer"
//             >
              
//             </motion.div>
            
//             {/* Desktop Menu */}
//             <div className="hidden md:flex mx-auto items-center space-x-1">
//               {["Find Work", "Find Talent", "How it Works", "Pricing"].map((item) => (
//                 <motion.a
//                   key={item}
//                   href="#"
//                   whileHover={{ y: -2 }}
//                   className="px-4 py-2 text-slate-600 hover:text-cyan-600 font-medium transition-colors relative group"
//                 >
//                   {item}
//                   <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-linear-to-r from-cyan-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
//                 </motion.a>
//               ))}
//             </div>
//           </div>
//         </div>
//       </motion.nav> 

//       {/* --- Hero Section --- */}
//       <section className="relative  -mt-28   pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
//           <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
//           <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-100/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
//           <div className="absolute inset-0 bg-[linear-linear(to_right,#cbd5e120_1px,transparent_1px),linear-linear(to_bottom,#cbd5e120_1px,transparent_1px)] bg-size-[24px_24px]"></div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//           <div className="text-center max-w-4xl mx-auto">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-50 to-blue-50 border border-cyan-200 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm"
//             >
//               <span className="relative flex h-2.5 w-2.5">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
//               </span>
             
//               Intelligent Hyperlocal Ecosystem • AI-Powered Matching
//             </motion.div>
            
//             <motion.h1 
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3, duration: 0.6 }}
//               className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight"
//             >
//               Hire Local Talent.<br />
//               <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-600 animate-linear-x">
//                 Powered by AI.
//               </span>
//             </motion.h1>
            
//             <motion.p 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//               className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
//             >
//               SkillSphere connects clients with verified professionals in your area. 
//               Experience secure milestone payments, AI-driven matching, and real-time collaboration—all in one platform.
//             </motion.p>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.7 }}
//               className="max-w-2xl mx-auto mb-10"
//             >
//               <div className="relative group">
//                 <div className="absolute -inset-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
//                 <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
//                   <Search className="w-5 h-5 text-slate-400 ml-5" />
//                   <input
//                     type="text"
//                     placeholder="Search projects, skills, or locations..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="flex-1 px-4 py-4 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleSearchProjects}
//                     className="m-2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-medium transition-all shadow-md"
//                   >
//                     Search
//                   </button>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.9 }}
//               className="flex flex-col sm:flex-row gap-4 justify-center"
//             >
//               <motion.button
//                 whileHover={{ scale: 1.03, y: -2 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => setIsPostProjectModalOpen(true)}
//                 className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group"
//               >
//                 Post a Project 
//                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.03, y: -2 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 group"
//               >
//                 Browse Talent 
//                 <Code className="w-5 h-5 group-hover:rotate-6 transition-transform" />
//               </motion.button>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 1.2 }}
//               className="mt-16 flex flex-wrap justify-center gap-6 text-base text-slate-500"
//             >
//               {["🔒 Secure Escrow", "⭐ 4.9/5 Rating", "🌍 250+ Cities", "💬 24/7 Support"].map((badge, i) => (
//                 <div key={i} className="flex items-center gap-2">
//                   <CheckCircle className="w-4 h-4 text-green-600" />
//                   <span>{badge}</span>
//                 </div>
//               ))}
//             </motion.div>
//           </div>
//         </div>

//         <motion.div
//           animate={{ y: [0, 10, 0] }}
//           transition={{ repeat: Infinity, duration: 2 }}
//           className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400"
//         >
//           {/* <ChevronDown className="w-6 h-6" /> */}
//         </motion.div>
//       </section>

//       {/* --- Stats Section --- */}
//       <section className="py-12 bg-slate-200/50 backdrop-blur-sm border-y border-slate-200/50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//             {stats.map((stat, index) => (
//               <motion.div
//                 key={stat.label}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1 }}
//                 className="text-center"
//               >
//                 <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-600 to-blue-600 mb-1">
//                   <AnimatedCounter end={stat.value} suffix={stat.suffix} />
//                 </div>
//                 <div className="text-slate-600 font-medium">{stat.label}</div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* --- Features Section --- */}
//       <section className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
//               Why Industry Leaders Choose SkillSphere
//             </h2>
//             <p className="text-slate-600 max-w-2xl mx-auto text-lg">
//               We've engineered a complete ecosystem to ensure your projects succeed with zero friction and maximum impact.
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[
//               {
//                 icon: Zap,
//                 title: "AI-Powered Matching",
//                 description: "Our HuggingFace AI engine analyzes skills, location, and work style to recommend the perfect freelancer instantly. 94% match accuracy.",
//                 color: "cyan",
//                 delay: 0
//               },
//               {
//                 icon: ShieldCheck,
//                 title: "Secure Escrow Payments",
//                 description: "Funds held in encrypted escrow, released only when milestones are approved. Integrated with Stripe & Razorpay for global coverage.",
//                 color: "blue",
//                 delay: 0.1
//               },
//               {
//                 icon: MessageSquare,
//                 title: "Real-Time Collaboration",
//                 description: "Built-in chat, file sharing, screen sharing, and video calls powered by WebRTC keep your team connected throughout the project.",
//                 color: "cyan",
//                 delay: 0.2
//               },
//               {
//                 icon: MapPin,
//                 title: "Hyperlocal Search",
//                 description: "Find professionals in your city for in-person meetings or local expertise. Filter by distance, availability, and on-site capability.",
//                 color: "blue",
//                 delay: 0.3
//               },
//               {
//                 icon: Star,
//                 title: "Smart Reputation System",
//                 description: "Weighted reputation scores, verified reviews, and AI fraud detection ensure you only work with trusted, high-quality talent.",
//                 color: "cyan",
//                 delay: 0.4
//               },
//               {
//                 icon: Clock,
//                 title: "Project Intelligence",
//                 description: "Track milestones, deadlines, and progress with AI-powered insights. Get proactive alerts for potential delays or budget overruns.",
//                 color: "blue",
//                 delay: 0.5
//               }
//             ].map((feature, _) => (
//               <motion.div
//                 key={feature.title}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: feature.delay }}
//                 whileHover={{ y: -5, transition: { duration: 0.2 } }}
//                 className="group p-7 rounded-2xl bg-linear-to-br from-slate-50 to-white border border-slate-200/50 hover:border-cyan-300/50 transition-all duration-300 shadow-sm hover:shadow-xl"
//               >
//                 <div className={`w-14 h-14 rounded-2xl bg-linear-to-br from-${feature.color}-100 to-${feature.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
//                   <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
//                 </div>
//                 <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
//                 <p className="text-slate-600 leading-relaxed">{feature.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* --- Projects Section (FIXED) --- */}
//       <section className="py-20 bg-linear-to-b from-slate-50 to-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
//             <div>
//               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
//                 Featured Opportunities
//               </h2>
//               <p className="text-slate-600">
//                 Discover high-quality projects matched to your expertise
//               </p>
//             </div>
            
//             {/* Filters */}
//             <div className="flex flex-wrap items-center gap-3">
//               <div className="relative">
//                 <select
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
//                 >
//                   {CATEGORIES.map(cat => (
//                     <option key={cat} value={cat}>{cat}</option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//               </div>
              
//               <div className="relative">
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value as any)}
//                   className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
//                 >
//                   <option value="newest">Newest First</option>
//                   <option value="budget-high">Highest Budget</option>
//                   <option value="budget-low">Lowest Budget</option>
//                   <option value="applications">Most Applications</option>
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//               </div>
//             </div>
//           </div>

//           {/* 🔧 FIXED: Loading/Empty/Projects rendering logic */}
//           {loading ? (
//             // Loading Skeleton
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {[1, 2, 3, 4, 5, 6].map((i) => (
//                 <SkeletonCard key={i} />
//               ))}
//             </div>
//           ) : filteredProjects.length === 0 ? (
//             // Empty State
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center py-16 bg-white rounded-2xl border border-slate-200"
//             >
//               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <Search className="w-10 h-10 text-slate-400" />
//               </div>
//               <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found</h3>
//               <p className="text-slate-600 mb-6">Try adjusting your search or filters</p>
//               <button 
//                 onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
//                 className="text-cyan-600 font-medium hover:underline"
//               >
//                 Clear all filters
//               </button>
//             </motion.div>
//           ) : (
//             // 🔧 FIXED: Projects Grid - simplified without complex AnimatePresence
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredProjects.map((project, index) => (
//                 <motion.div
//                   key={project.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.05 }}
//                   whileHover={{ y: -5, transition: { duration: 0.2 } }}
//                   className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 hover:border-cyan-300/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
//                   onClick={() => setSelectedProject(project)}
//                 >
//                   {/* Header */}
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex items-center gap-2">
//                       {project.featured && (
//                         <span className="px-2.5 py-1 bg-linear-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
//                           Featured
//                         </span>
//                       )}
//                       <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
//                         project.category === "Web Development" ? "bg-blue-50 text-blue-700" :
//                         project.category === "Mobile Development" ? "bg-cyan-50 text-cyan-700" :
//                         project.category === "Graphic Design" ? "bg-purple-50 text-purple-700" :
//                         "bg-slate-100 text-slate-700"
//                       }`}>
//                         {project.category}
//                       </span>
//                     </div>
//                     <span className="text-xs text-slate-400 flex items-center gap-1">
//                       <Clock className="w-3.5 h-3.5" /> {project.postedAt}
//                     </span>
//                   </div>
                  
//                   {/* Title & Description */}
//                   <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
//                     {project.title}
//                   </h3>
//                   <div className="flex items-center gap-1">
//   {[...Array(5)].map((_, i) => (
//     <Star
//       key={i}
//       className={
//         i < Math.round(ratingData.avgRating)
//           ? "text-amber-400"
//           : "text-gray-300"
//       }
//     />
//   ))}
//   <span className="text-sm text-slate-500 ml-2">
//     ({ratingData.totalReviews})
//   </span>
// </div>
//                   <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
//                     {project.description}
//                   </p>
                  
//                   {/* Location & Client */}
//                   <div className="flex items-center gap-4 mb-4 text-sm">
//                     <div className="flex items-center gap-1.5 text-slate-500">
//                       <MapPin className="w-4 h-4" />
//                       {project.location}
//                     </div>
//                     <div className="flex items-center gap-1.5">
//                       <span className="text-lg">{project.client.avatar}</span>
//                       <span className="font-medium text-slate-700">{project.client.name}</span>
//                       {project.client.verified && (
//                         <ShieldCheck className="w-4 h-4 text-green-600" />
//                       )}
//                     </div>
//                   </div>

//                   {/* Tags */}
//                   <div className="flex flex-wrap gap-1.5 mb-5">
//                     {project.tags.slice(0, 3).map((tag, idx) => (
//                       <span 
//                         key={idx} 
//                         className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg hover:bg-slate-200 transition-colors"
//                       >
//                         #{tag}
//                       </span>
//                     ))}
//                     {project.tags.length > 3 && (
//                       <span className="text-xs text-slate-400 px-1">+{project.tags.length - 3}</span>
//                     )}
//                   </div>

//                   {/* Footer */}
//                   <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
//                     <div>
//                       <span className="font-bold text-lg text-slate-900">{project.budget}</span>
//                       <div className="text-xs text-slate-500">{project.applications} applications</div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <motion.button
//                         whileTap={{ scale: 0.9 }}
//                         onClick={(e) => { e.stopPropagation(); handleSaveProject(project); }}
//                         className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                         aria-label="Save project"
//                       >
//                         <Heart className="w-5 h-5" />
//                       </motion.button>
//                       <motion.button
//                         whileTap={{ scale: 0.95 }}
//                         className="p-2.5 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl transition-all shadow-md"
//                         aria-label="Apply now"
//                       >
//                         <ArrowRight className="w-4 h-4" />
//                       </motion.button>
//                     </div>
//                   </div>



                  
//                 </motion.div>
//               ))}
//             </div>
//           )}
          
//           {/* View All Button */}
//           <div className="mt-12 text-center">
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:border-cyan-400 hover:text-cyan-600 transition-all shadow-sm"
//             >
//               View All Projects <ArrowRight className="w-4 h-4" />
//             </motion.button>
//           </div>
//         </div>
//       </section>

//       {/* --- testimonials Section --- */}
//       <section className="py-20 bg-linear-to-br from-cyan-50 to-blue-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
//               Loved by Freelancers & Clients Alike
//             </h2>
//             <p className="text-slate-600 max-w-2xl mx-auto text-lg">
//               Don't just take our word for it. Here's what our community has to say.
//             </p>
//           </motion.div>

//           <div className="relative max-w-4xl mx-auto">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={activeTestimonial}
//                 initial={{ opacity: 0, x: 50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -50 }}
//                 transition={{ duration: 0.3 }}
//                 className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-200/50"
//               >
//                 <div className="flex items-center gap-1 mb-6">
        
//                   {/* testimonials[activeTestimonial]; */}

// {[...Array(5)].map((_, i) => (
//   <Star 
//     key={i} 
//     className={`w-5 h-5 ${
//       i < (currentTestimonial?.rating ??  0)
//         ? "text-amber-400 fill-amber-400"
//         : "text-slate-300"
//     }`} 
//   />
// ))}
//                   {/* {[...Array(5)].map((_, i) => (
//                     <Star 
//                       key={i} 
//                       className={`w-5 h-5 ${i < testimonials[activeTestimonial]?.rating ?? 0 ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} 
//                     />
//                   ))} */}
//                 </div>
                
//                 <blockquote className="text-xl md:text-2xl font-medium text-slate-800 mb-8 leading-relaxed">
//                   "{currentTestimonial?.content || 'No testimonials available yet.'}"
//                 </blockquote>
                
//                 <div className="flex items-center gap-4">
//                   <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-2xl">
//                     {currentTestimonial?.avatar || "👤"}
//                   </div>
//                   <div>
//                     <div className="font-bold text-slate-900">{currentTestimonial?.name || "Anonymous"}</div>
//                     <div className="text-slate-600">
//   {currentTestimonial
//     ? `${currentTestimonial.role} at ${currentTestimonial.company}`
//     : "No role information"}
// </div>
//                   </div>
//                 </div>
                
//       <div className="mt-6">
//   <h4 className="font-bold text-slate-900 mb-3">Reviews</h4>

//   {reviews.length === 0 ? (
//     <p className="text-slate-500 text-sm">No reviews yet</p>
//   ) : (
//     reviews.map((review) => (
//       <div key={review._id} className="border-b py-3">
//         <p className="font-semibold">{review.reviewer?.name}</p>

//         <div className="flex gap-1">
//           {[...Array(5)].map((_, i) => (
//             <Star
//               key={i}
//               className={i < review.rating ? "text-amber-400" : "text-gray-300"}
//             />
//           ))}
//         </div>

//         <p className="text-slate-600 text-sm">{review.comment}</p>
//       </div>
//     ))
//   )}
// </div>


// <div className="mt-6">
//   <h4 className="font-bold text-slate-900 mb-3">Add Review</h4>

//   <select
//     value={newReview.rating}
//     onChange={(e) =>
//       setNewReview({ ...newReview, rating: Number(e.target.value) })
//     }
//     className="border p-2 rounded mb-2 w-full"
//   >
//     {[5, 4, 3, 2, 1].map((r) => (
//       <option key={r} value={r}>
//         {r} Stars
//       </option>
//     ))}
//   </select>

//   <textarea
//     placeholder="Write your review..."
//     value={newReview.reviewText}
//     onChange={(e) =>
//       setNewReview({ ...newReview, reviewText: e.target.value })
//     }
//     className="border p-2 rounded w-full mb-3"
//   />

//  <button
//   onClick={handleSubmitReview}
//   // disabled={!selectedProject}
//   className="bg-cyan-600 text-white px-4 py-2 rounded disabled:opacity-50"
// >
//   Submit Review
// </button>
// </div>

//               </motion.div>
//             </AnimatePresence>

//             <div className="flex items-center justify-center gap-4 mt-8">
//               <button
//                 onClick={() => setActiveTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
//                 className="p-3 rounded-full bg-white border border-slate-200 hover:border-cyan-400 transition-colors shadow-sm"
//                 aria-label="Previous testimonial"
//               >
//                 <ChevronDown className="w-5 h-5 rotate-90" />
//               </button>
              
//               <div className="flex gap-2">
//                 {testimonials.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setActiveTestimonial(index)}
//                     className={`w-3 h-3 rounded-full transition-all ${
//                       index === activeTestimonial 
//                         ? "bg-linear-to-r from-cyan-500 to-blue-500 w-8" 
//                         : "bg-slate-300 hover:bg-slate-400"
//                     }`}
//                     aria-label={`Go to testimonial ${index + 1}`}
//                   />
//                 ))}
//               </div>
              
//               <button
//                 onClick={() => {
//   if (testimonials.length === 0) return;
//   setActiveTestimonial(prev => prev === testimonials.length - 1 ? 0 : prev + 1);
// }}
//                 className="p-3 rounded-full bg-white border border-slate-200 hover:border-cyan-400 transition-colors shadow-sm"
//                 aria-label="Next testimonial"
//               >
//                 <ChevronDown className="w-5 h-5 -rotate-90" />
//               </button>
//             </div>

//             <div className="flex items-center justify-center gap-3 mt-6">
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* --- FAQ Section --- */}
//       <section className="py-20 bg-white">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
//               Frequently Asked Questions
//             </h2>
//             <p className="text-slate-600 text-lg">
//               Everything you need to know about getting started with SkillSphere
//             </p>
//           </motion.div>

//           <div className="space-y-4">
//             {FAQS.map((faq, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 10 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1 }}
//                 className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50"
//               >
//                 <button
//                   onClick={() => toggleFaq(index)}
//                   className="w-full flex items-center justify-between p-6 text-left font-semibold text-slate-900 hover:bg-slate-100/50 transition-colors"
//                 >
//                   <span className="pr-4">{faq.question}</span>
//                   <motion.div
//                     animate={{ rotate: expandedFaq === index ? 180 : 0 }}
//                     transition={{ duration: 0.2 }}
//                   >
//                     <ChevronDown className="w-5 h-5 text-slate-400" />
//                   </motion.div>
//                 </button>
//                 <AnimatePresence>
//                   {expandedFaq === index && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: "auto", opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                       transition={{ duration: 0.2 }}
//                       className="overflow-hidden"
//                     >
//                       <div className="px-6 pb-6 text-slate-600 leading-relaxed">
//                         {faq.answer}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* --- CTA Section --- */}
//       <section className="py-20 bg-linear-to-br from-blue-600 via-cyan-600 to-cyan-500 text-white relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
//           <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
//         </div>
        
//         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             {/* <Sparkles className="w-12 h-12 mx-auto mb-6 text-white/90" /> */}
//             <img 
//                   src="./Logo.png" 
//                   alt="SkillSphere" 
//                   className="mx-auto block w-900 h-60 object-contain -my-12" 
//              />
//             <h2 className="text-3xl md:text-5xl font-bold mb-6">
//               Ready to Transform How You Work?
//             </h2>
//             <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
//               Join over 50,000+ professionals and businesses building the future of work—locally and globally.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <motion.button
//                 whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(255, 255, 255, 0.3)" }}
//                 whileTap={{ scale: 0.98 }}
//                 className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl"
//               >
//                 Get Started as Freelancer
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
//               >
//                 Hire a Pro Today
//               </motion.button>
//             </div>
            
//             <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-blue-100/90">
//               <div className="flex items-center gap-2">
//                 <Lock className="w-4 h-4" /> Bank-Level Security
//               </div>
//               <div className="flex items-center gap-2">
//                 <TrendingUp className="w-4 h-4" /> 98% Satisfaction Rate
//               </div>
//               <div className="flex items-center gap-2">
//                 <Globe className="w-4 h-4" /> Available in 190+ Countries
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* --- Project Detail Modal --- */}
//       <AnimatePresence>
//         {selectedProject && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
//             onClick={() => setSelectedProject(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.95, opacity: 0, y: 20 }}
//               className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
//               onClick={e => e.stopPropagation()}
//             >
//               <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 p-6 flex items-start justify-between z-10">
//                 <div>
//                   <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full mb-3">
//                     {selectedProject.category}
//                   </span>
//                   <h3 className="text-2xl font-bold text-slate-900">{selectedProject.title}</h3>
//                 </div>
//                 <button
//                   onClick={() => setSelectedProject(null)}
//                   className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
//                   aria-label="Close modal"
//                 >
//                   <X className="w-6 h-6 text-slate-500" />
//                 </button>
//               </div>

//               <div className="p-6 space-y-6">
//                 <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-2xl">
//                   <div>
//                     <div className="text-sm text-slate-500 mb-1">Budget</div>
//                     <div className="font-bold text-lg text-slate-900">{selectedProject.budget}</div>
//                   </div>
//                   <div>
//                     <div className="text-sm text-slate-500 mb-1">Location</div>
//                     <div className="font-medium text-slate-700 flex items-center gap-1">
//                       <MapPin className="w-4 h-4" /> {selectedProject.location}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-sm text-slate-500 mb-1">Posted</div>
//                     <div className="font-medium text-slate-700">{selectedProject.postedAt}</div>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="font-bold text-slate-900 mb-3">Project Description</h4>
//                   <p className="text-slate-600 leading-relaxed">{selectedProject.description}</p>
//                 </div>

//                 <div>
//                   <h4 className="font-bold text-slate-900 mb-3">Required Skills</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedProject.tags.map((tag, idx) => (
//                       <span 
//                         key={idx} 
//                         className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="p-4 border border-slate-200 rounded-2xl">
//                   <h4 className="font-bold text-slate-900 mb-4">About the Client</h4>
//                   <div className="flex items-center gap-4">
//                     <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-2xl">
//                       {selectedProject.client.avatar}
//                     </div>
//                     <div>
//                       <div className="font-bold text-slate-900 flex items-center gap-2">
//                         {selectedProject.client.name}
//                         {selectedProject.client.verified && (
//                           <ShieldCheck className="w-4 h-4 text-green-600" />
//                         )}
//                       </div>
//                       <div className="flex items-center gap-1 text-sm">
//                         {[...Array(5)].map((_, i) => (
//                           <Star 
//                             key={i} 
//                             className={`w-4 h-4 ${i < Math.round(selectedProject.client.rating) ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} 
//                           />
//                         ))}
//                         <span className="text-slate-500 ml-1">{selectedProject.client.rating} rating</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="p-4 bg-slate-50 rounded-xl text-center">
//                     <div className="text-2xl font-bold text-slate-900">{selectedProject.applications}</div>
//                     <div className="text-sm text-slate-500">Applications</div>
//                   </div>
//                   <div className="p-4 bg-slate-50 rounded-xl text-center">
//                     <div className="text-2xl font-bold text-slate-900">48h</div>
//                     <div className="text-sm text-slate-500">Avg. Response</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 p-6 flex flex-col sm:flex-row gap-3">
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => handleApply(selectedProject)}
//                   className="flex-1 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
//                 >
//                   <CheckCircle className="w-5 h-5" /> Apply Now
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => handleSaveProject(selectedProject)}
//                   className="px-6 py-4 border border-slate-300 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
//                 >
//                   <Heart className="w-5 h-5" /> Save
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>


// {/* 
//       <div className="mt-6">
//   <h4 className="font-bold text-slate-900 mb-3">Reviews</h4>

//   {reviews.length === 0 ? (
//     <p className="text-slate-500 text-sm">No reviews yet</p>
//   ) : (
//     reviews.map((review) => (
//       <div key={review._id} className="border-b py-3">
//         <p className="font-semibold">{review.reviewer?.name}</p>

//         <div className="flex gap-1">
//           {[...Array(5)].map((_, i) => (
//             <Star
//               key={i}
//               className={i < review.rating ? "text-amber-400" : "text-gray-300"}
//             />
//           ))}
//         </div>

//         <p className="text-slate-600 text-sm">{review.comment}</p>
//       </div>
//     ))
//   )}
// </div>


// <div className="mt-6">
//   <h4 className="font-bold text-slate-900 mb-3">Add Review</h4>

//   <select
//     value={newReview.rating}
//     onChange={(e) =>
//       setNewReview({ ...newReview, rating: Number(e.target.value) })
//     }
//     className="border p-2 rounded mb-2 w-full"
//   >
//     {[5, 4, 3, 2, 1].map((r) => (
//       <option key={r} value={r}>
//         {r} Stars
//       </option>
//     ))}
//   </select>

//   <textarea
//     placeholder="Write your review..."
//     value={newReview.reviewText}
//     onChange={(e) =>
//       setNewReview({ ...newReview, reviewText: e.target.value })
//     }
//     className="border p-2 rounded w-full mb-3"
//   />

//  <button
//   onClick={handleSubmitReview}
//   disabled={!selectedProject}
//   className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
// >
//   Submit Review
// </button>
// </div> */}

//       {/* --- Post Project Modal --- */}
//       <AnimatePresence>
//         {isPostProjectModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
//             onClick={() => setIsPostProjectModalOpen(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.95, opacity: 0, y: 20 }}
//               className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200"
//               onClick={e => e.stopPropagation()}
//             >
//               <div className="p-6 border-b border-slate-200 flex items-center justify-between">
//                 <h3 className="text-xl font-bold text-slate-900">Post a New Project</h3>
//                 <button
//                   onClick={() => setIsPostProjectModalOpen(false)}
//                   className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
//                 >
//                   <X className="w-5 h-5 text-slate-500" />
//                 </button>
//               </div>
              
//               <div className="p-6 space-y-5">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Project Title *</label>
//                   <input
//                     type="text"
//                     placeholder="e.g., React Native App for Local Delivery"
//                     value={postProjectData.title}
//                     onChange={handlePostProjectField('title')}
//                     className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900"
//                   />
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
//                     <select
//                       value={postProjectData.category}
//                       onChange={handlePostProjectField('category')}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
//                     >
//                       {CATEGORIES.filter(c => c !== "All").map(cat => (
//                         <option key={cat} value={cat}>{cat}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Budget *</label>
//                     <select
//                       value={postProjectData.budgetRange}
//                       onChange={handlePostProjectField('budgetRange')}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
//                     >
//                       <option value="300-500">$300 - $500</option>
//                       <option value="500-1000">$500 - $1,000</option>
//                       <option value="1000-2500">$1,000 - $2,500</option>
//                       <option value="2500+">$2,500+</option>
//                     </select>
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Location Preference</label>
//                   <div className="flex gap-3">
//                     {["Remote", "Local", "Either"].map((loc) => (
//                       <label key={loc} className="flex items-center gap-2 cursor-pointer">
//                         <input type="radio" name="location" className="text-cyan-600 focus:ring-cyan-500" checked={postProjectData.locationPreference === loc} onChange={() => setPostProjectData(prev => ({ ...prev, locationPreference: loc }))} />
//                         <span className="text-sm text-slate-700">{loc}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Duration *</label>
//                   <select
//                     value={postProjectData.duration}
//                     onChange={handlePostProjectField('duration')}
//                     className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
//                   >
//                     <option value="1 month">1 month</option>
//                     <option value="2 weeks">2 weeks</option>
//                     <option value="3 months">3 months</option>
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
//                   <textarea
//                     rows={4}
//                     placeholder="Describe your project, goals, and requirements..."
//                     value={postProjectData.description}
//                     onChange={handlePostProjectField('description')}
//                     className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 resize-none"
//                   ></textarea>
//                 </div>

                
//                 <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
//                   <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
//                   <p className="text-sm text-blue-800">
//                     Your project will be reviewed by our AI matching engine and shown to qualified freelancers within minutes. Funds are held securely in escrow.
//                   </p>
//                 </div>
//               </div>
              
//               <div className="p-6 border-t border-slate-200 flex gap-3">
//                 <button
//                   onClick={() => setIsPostProjectModalOpen(false)}
//                   className="flex-1 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => {
//                     setIsPostProjectModalOpen(false);
//                     addNotification("success", "Project posted successfully! Matching with freelancers...");
//                   }}
//                   className="flex-1 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
//                 >
//                   Post Project • $5 Fee
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default SkillSphereHome;



























// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../services/api';

// // --- Types (Extended from backend) ---
// interface Project {
//   id: number | string;
//   title: string;
//   category: string;
//   budget: string;
//   budgetRange: { min: number; max: number };
//   location: string;
//   coordinates?: { lat: number; lng: number };
//   postedAt: string;
//   postedTimestamp: number;
//   tags: string[];
//   description: string;
//   client: {
//     name: string;
//     avatar: string;
//     rating: number;
//     verified: boolean;
//   };
//   applications: number;
//   featured?: boolean;
//   freelancer?: {
//     id?: string;
//     name?: string;
//   };
// }

// interface Review {
//   _id: string;
//   rating: number;
//   comment: string;
//   reviewer?: {
//     name: string;
//   };
// }

// interface Testimonial {
//   id: number;
//   name: string;
//   role: string;
//   company: string;
//   avatar: string;
//   content: string;
//   rating: number;
// }

// interface FAQ {
//   question: string;
//   answer: string;
// }

// interface Notification {
//   id: string;
//   type: 'success' | 'error' | 'info' | 'warning';
//   message: string;
//   duration?: number;
// }

// interface Freelancer {
//   id: string;
//   name: string;
//   avatar: string;
//   skills: string[];
//   rating: number;
//   reviewCount: number;
//   location: string;
//   hourlyRate: number;
//   completedProjects: number;
//   verified: boolean;
//   testimonial?: string;
// }

// interface MatchResult {
//   freelancer: Freelancer;
//   matchScore: number;
//   available: boolean;
// }

// interface TrendingSkill {
//   name: string;
//   count: number;
//   icon: string;
// }

// interface LocalArea {
//   city: string;
//   region: string;
//   freelancerCount: number;
//   activeProjects: number;
// }

// // --- Icons Components ---
// const Icons = {
//   AI: () => (
//     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//     </svg>
//   ),
//   Search: () => (
//     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//     </svg>
//   ),
//   Star: ({ filled = true }: { filled?: boolean }) => (
//     <svg className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
//       <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//     </svg>
//   ),
//   Check: () => (
//     <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//     </svg>
//   ),
//   Shield: () => (
//     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//     </svg>
//   ),
//   Chat: () => (
//     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//     </svg>
//   ),
//   Location: () => (
//     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//     </svg>
//   ),
//   ArrowRight: () => (
//     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//     </svg>
//   ),
//   Menu: () => (
//     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//     </svg>
//   ),
//   Close: () => (
//     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//     </svg>
//   ),
// };

// // --- Helper Components ---
// const StarRating: React.FC<{ rating: number; max?: number }> = ({ rating, max = 5 }) => (
//   <div className="flex items-center gap-0.5">
//     {[...Array(max)].map((_, i) => (
//       <Icons.Star key={i} filled={i < Math.floor(rating)} />
//     ))}
//     <span className="ml-1 text-sm text-gray-600">({rating})</span>
//   </div>
// );

// const SectionTitle: React.FC<{ title: string; subtitle?: string; centered?: boolean }> = ({ 
//   title, subtitle, centered = true 
// }) => (
//   <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
//     <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
//     {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
//   </div>
// );

// const CTAButton: React.FC<{
//   children: React.ReactNode;
//   variant?: 'primary' | 'secondary' | 'outline';
//   onClick?: () => void;
//   href?: string;
//   className?: string;
// }> = ({ children, variant = 'primary', onClick, href, className = '' }) => {
//   const baseClasses = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
//   const variants = {
//     primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl",
//     secondary: "bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50",
//     outline: "border-2 border-gray-300 text-gray-700 hover:border-indigo-600 hover:text-indigo-600"
//   };

//   if (href) {
//     return (
//       <a href={href} className={`${baseClasses} ${variants[variant]} ${className}`}>
//         {children}
//       </a>
//     );
//   }
//   return (
//     <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
//       {children}
//     </button>
//   );
// };

// // --- Main Component ---
// const SkillSphereLanding: React.FC = () => {
//   // State Management
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
//   const [isMatching, setIsMatching] = useState(false);
//   const [featuredFreelancers, setFeaturedFreelancers] = useState<Freelancer[]>([]);
//   const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
//   const [trendingSkills, setTrendingSkills] = useState<TrendingSkill[]>([]);
//   const [localAreas, setLocalAreas] = useState<LocalArea[]>([]);
//   const [notification, setNotification] = useState<Notification | null>(null);
//   const [activeTab, setActiveTab] = useState<'clients' | 'freelancers'>('clients');

//   // Fetch data on mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [freelancersRes, testimonialsRes, skillsRes, areasRes] = await Promise.all([
//           api.get('/freelancers/featured'),
//           api.get('/testimonials'),
//           api.get('/skills/trending'),
//           api.get('/locations/active')
//         ]);
//         setFeaturedFreelancers(freelancersRes.data);
//         setTestimonials(testimonialsRes.data);
//         setTrendingSkills(skillsRes.data);
//         setLocalAreas(areasRes.data);
//       } catch (error) {
//         console.error('Failed to fetch landing page data:', error);
//         showNotification('error', 'Failed to load some content. Please refresh.');
//       }
//     };
//     fetchData();
//   }, []);

//   // Notification handler
//   const showNotification = useCallback((type: Notification['type'], message: string) => {
//     const id = Math.random().toString(36).substr(2, 9);
//     setNotification({ id, type, message, duration: 5000 });
//     setTimeout(() => setNotification(null), 5000);
//   }, []);

//   // AI Matching Demo
//   const handleAIMatch = async () => {
//     if (!searchQuery.trim()) {
//       showNotification('warning', 'Please enter a skill or job title');
//       return;
//     }
    
//     setIsMatching(true);
//     try {
//       const response = await api.post('/ai/match', { 
//         query: searchQuery,
//         limit: 4 
//       });
//       setMatchResults(response.data.matches);
//       showNotification('success', `Found ${response.data.matches.length} matches!`);
//     } catch (error) {
//       console.error('AI Match error:', error);
//       showNotification('error', 'Failed to get matches. Please try again.');
//     } finally {
//       setIsMatching(false);
//     }
//   };

//   // Carousel state for freelancers
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.max(featuredFreelancers.length, 1));
//   const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + Math.max(featuredFreelancers.length, 1)) % Math.max(featuredFreelancers.length, 1));

//   // How It Works Steps
//   const clientSteps = [
//     { title: 'Post Your Project', desc: 'Describe your needs, budget, and timeline', icon: '📝' },
//     { title: 'Get AI Recommendations', desc: 'Receive verified local freelancer matches', icon: '🤖' },
//     { title: 'Collaborate in Real-Time', desc: 'Use built-in tools for seamless communication', icon: '💬' },
//     { title: 'Secure Milestone Payments', desc: 'Pay only when work meets your standards', icon: '💰' },
//   ];

//   const freelancerSteps = [
//     { title: 'Create Your Profile', desc: 'Showcase skills, portfolio, and availability', icon: '👤' },
//     { title: 'Get Matched Locally', desc: 'AI connects you with nearby clients needing your expertise', icon: '🎯' },
//     { title: 'Work with Built-in Tools', desc: 'Manage projects, files, and communication in one place', icon: '🛠️' },
//     { title: 'Grow Your Reputation', desc: 'Earn reviews and build a standout career', icon: '📈' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans">
//       {/* Notification Toast */}
//       {notification && (
//         <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
//           notification.type === 'success' ? 'bg-green-500' :
//           notification.type === 'error' ? 'bg-red-500' :
//           notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
//         } text-white`}>
//           <p className="font-medium">{notification.message}</p>
//         </div>
//       )}

//       {/* Navigation */}
//       <nav className="bg-white shadow-sm sticky top-0 z-40">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <div className="flex-shrink-0 flex items-center gap-2">
//                 <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
//                   <span className="text-white font-bold text-lg">S</span>
//                 </div>
//                 <span className="text-xl font-bold text-gray-900">SkillSphere</span>
//               </div>
//             </div>
            
//             {/* Desktop Menu */}
//             <div className="hidden md:flex items-center space-x-8">
//               <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 transition-colors">How It Works</a>
//               <a href="#freelancers" className="text-gray-700 hover:text-indigo-600 transition-colors">Find Talent</a>
//               <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 transition-colors">Success Stories</a>
//               <a href="#resources" className="text-gray-700 hover:text-indigo-600 transition-colors">Resources</a>
//               <div className="flex items-center gap-3 ml-4">
//                 <CTAButton variant="outline" href="/login">Sign In</CTAButton>
//                 <CTAButton variant="primary" href="/signup">Get Started</CTAButton>
//               </div>
//             </div>

//             {/* Mobile menu button */}
//             <div className="md:hidden">
//               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
//                 {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <div className="md:hidden bg-white border-t">
//             <div className="px-4 py-4 space-y-3">
//               <a href="#how-it-works" className="block text-gray-700 hover:text-indigo-600 py-2">How It Works</a>
//               <a href="#freelancers" className="block text-gray-700 hover:text-indigo-600 py-2">Find Talent</a>
//               <a href="#testimonials" className="block text-gray-700 hover:text-indigo-600 py-2">Success Stories</a>
//               <a href="#resources" className="block text-gray-700 hover:text-indigo-600 py-2">Resources</a>
//               <div className="pt-4 flex flex-col gap-3">
//                 <CTAButton variant="outline" href="/login" className="w-full justify-center">Sign In</CTAButton>
//                 <CTAButton variant="primary" href="/signup" className="w-full justify-center">Get Started</CTAButton>
//               </div>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* 1. Hero Section */}
//       <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 lg:py-32 overflow-hidden">
//         <div className="absolute inset-0 opacity-30">
//           <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
//           <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
//           <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
//         </div>
        
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
//             Unlock Local Talent.<br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
//               Empower Your Freelance Journey.
//             </span>
//           </h1>
//           <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
//             SkillSphere connects businesses with trusted local freelancers through AI-driven job matching and secure collaboration tools.
//           </p>
          
//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
//             <CTAButton variant="primary" href="/clients/post-project" className="w-full sm:w-auto">
//               Find Local Experts <Icons.ArrowRight />
//             </CTAButton>
//             <CTAButton variant="secondary" href="/freelancers/signup" className="w-full sm:w-auto">
//               Join the Freelance Revolution
//             </CTAButton>
//           </div>

//           {/* Trust Badges */}
//           <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
//             <div className="flex items-center gap-2">
//               <Icons.Shield />
//               <span>Verified Professionals</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Icons.Check />
//               <span>Secure Payments</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Icons.AI />
//               <span>AI-Powered Matching</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 2. How It Works */}
//       <section id="how-it-works" className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <SectionTitle 
//             title="How SkillSphere Works" 
//             subtitle="A seamless experience designed for both clients and freelancers"
//           />

//           {/* Tabs */}
//           <div className="flex justify-center mb-12">
//             <div className="bg-gray-100 p-1 rounded-lg inline-flex">
//               <button
//                 onClick={() => setActiveTab('clients')}
//                 className={`px-6 py-2 rounded-md font-medium transition-all ${
//                   activeTab === 'clients' 
//                     ? 'bg-white text-indigo-600 shadow-sm' 
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 For Clients
//               </button>
//               <button
//                 onClick={() => setActiveTab('freelancers')}
//                 className={`px-6 py-2 rounded-md font-medium transition-all ${
//                   activeTab === 'freelancers' 
//                     ? 'bg-white text-indigo-600 shadow-sm' 
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 For Freelancers
//               </button>
//             </div>
//           </div>

//           {/* Steps Grid */}
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {(activeTab === 'clients' ? clientSteps : freelancerSteps).map((step, index) => (
//               <div key={index} className="relative group">
//                 <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
//                 <div className="relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
//                   <div className="text-4xl mb-4">{step.icon}</div>
//                   <div className="flex items-center gap-3 mb-3">
//                     <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold text-sm">
//                       {index + 1}
//                     </span>
//                     <h3 className="font-semibold text-gray-900">{step.title}</h3>
//                   </div>
//                   <p className="text-gray-600 text-sm">{step.desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* 3. AI-Powered Job Matching Demo */}
//       <section className="py-20 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <SectionTitle 
//             title="✨ AI-Powered Job Matching" 
//             subtitle="See how our intelligent engine connects you with the perfect opportunities"
//             centered
//           />

//           <div className="max-w-2xl mx-auto mb-12">
//             <div className="flex gap-3">
//               <div className="relative flex-1">
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleAIMatch()}
//                   placeholder="Try: 'Graphic Designer', 'React Developer', 'Content Writer'..."
//                   className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
//                 />
//                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
//                   <Icons.Search />
//                 </div>
//               </div>
//               <CTAButton 
//                 variant="primary" 
//                 onClick={handleAIMatch}
//                 className="!bg-white !text-indigo-900 hover:!bg-gray-100 whitespace-nowrap"
//               >
//                 {isMatching ? 'Matching...' : 'Find Matches'}
//               </CTAButton>
//             </div>
//             <p className="text-center text-white/70 text-sm mt-3">
//               Our AI analyzes skills, location, availability, and project fit
//             </p>
//           </div>

//           {/* Results */}
//           {matchResults.length > 0 && (
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {matchResults.map((result, index) => (
//                 <div key={result.freelancer.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:border-white/40 transition-all">
//                   <div className="flex items-center gap-3 mb-4">
//                     <img 
//                       src={result.freelancer.avatar} 
//                       alt={result.freelancer.name}
//                       className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
//                     />
//                     <div>
//                       <h4 className="font-semibold">{result.freelancer.name}</h4>
//                       <div className="flex items-center gap-1 text-sm text-white/80">
//                         <Icons.Location />
//                         <span>{result.freelancer.location}</span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex flex-wrap gap-1 mb-3">
//                     {result.freelancer.skills.slice(0, 3).map((skill) => (
//                       <span key={skill} className="px-2 py-1 bg-white/20 rounded-full text-xs">
//                         {skill}
//                       </span>
//                     ))}
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <StarRating rating={result.freelancer.rating} />
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       result.matchScore > 85 ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
//                     }`}>
//                       {result.matchScore}% Match
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {matchResults.length === 0 && !isMatching && searchQuery && (
//             <p className="text-center text-white/70">No matches found. Try different keywords!</p>
//           )}
//         </div>
//       </section>

//       {/* 4. Featured Freelancers */}
//       <section id="freelancers" className="py-20 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
//             <SectionTitle 
//               title="Featured Local Experts" 
//               subtitle="Top-rated freelancers ready to bring your projects to life"
//               centered={false}
//             />
//             <a href="/freelancers" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mb-12 md:mb-0">
//               View All Freelancers <Icons.ArrowRight />
//             </a>
//           </div>

//           {/* Carousel */}
//           <div className="relative">
//             <div className="flex overflow-hidden">
//               <div 
//                 className="flex transition-transform duration-500 ease-in-out"
//                 style={{ transform: `translateX(-${currentSlide * (100 / Math.min(4, featuredFreelancers.length))}%)` }}
//               >
//                 {featuredFreelancers.map((freelancer) => (
//                   <div key={freelancer.id} className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4">
//                     <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 border border-gray-100 h-full flex flex-col">
//                       <div className="flex items-center gap-4 mb-4">
//                         <img 
//                           src={freelancer.avatar} 
//                           alt={freelancer.name}
//                           className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
//                         />
//                         <div>
//                           <h4 className="font-semibold text-gray-900">{freelancer.name}</h4>
//                           <div className="flex items-center gap-1 text-sm text-gray-500">
//                             <Icons.Location />
//                             <span>{freelancer.location}</span>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="flex flex-wrap gap-2 mb-4">
//                         {freelancer.skills.slice(0, 4).map((skill) => (
//                           <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
//                             {skill}
//                           </span>
//                         ))}
//                       </div>

//                       <div className="mt-auto">
//                         <div className="flex items-center justify-between mb-4">
//                           <StarRating rating={freelancer.rating} />
//                           <span className="text-sm font-semibold text-gray-900">${freelancer.hourlyRate}/hr</span>
//                         </div>
                        
//                         {freelancer.testimonial && (
//                           <p className="text-sm text-gray-600 italic mb-4 line-clamp-2">"{freelancer.testimonial}"</p>
//                         )}

//                         <div className="flex gap-2">
//                           <a 
//                             href={`/freelancers/${freelancer.id}`}
//                             className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
//                           >
//                             View Profile
//                           </a>
//                           <button 
//                             onClick={() => showNotification('info', `Hiring flow for ${freelancer.name} coming soon!`)}
//                             className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
//                           >
//                             Hire
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Carousel Controls */}
//             {featuredFreelancers.length > 4 && (
//               <div className="flex justify-center gap-3 mt-8">
//                 <button 
//                   onClick={prevSlide}
//                   className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
//                 >
//                   ←
//                 </button>
//                 <button 
//                   onClick={nextSlide}
//                   className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
//                 >
//                   →
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* 5. Testimonials & Success Stories */}
//       <section id="testimonials" className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <SectionTitle 
//             title="Success Stories" 
//             subtitle="Real results from our community of clients and freelancers"
//           />

//           {/* Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
//             {[
//               { value: '500+', label: 'Projects Completed' },
//               { value: '98%', label: 'Client Satisfaction' },
//               { value: '2.5k+', label: 'Active Freelancers' },
//               { value: '4.9/5', label: 'Average Rating' },
//             ].map((stat, i) => (
//               <div key={i} className="text-center p-6 bg-gray-50 rounded-xl">
//                 <div className="text-3xl font-bold text-indigo-600 mb-1">{stat.value}</div>
//                 <div className="text-gray-600 text-sm">{stat.label}</div>
//               </div>
//             ))}
//           </div>

//           {/* Testimonials Grid */}
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {testimonials.map((testimonial) => (
//               <div key={testimonial.id} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
//                 <div className="flex items-center gap-1 mb-4">
//                   {[...Array(5)].map((_, i) => (
//                     <Icons.Star key={i} filled={i < testimonial.rating} />
//                   ))}
//                 </div>
//                 <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
//                 <div className="flex items-center gap-3">
//                   <img 
//                     src={testimonial.avatar} 
//                     alt={testimonial.name}
//                     className="w-12 h-12 rounded-full object-cover"
//                   />
//                   <div>
//                     <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
//                     <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* 6. Reputation & Trust */}
//       <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <div>
//               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
//                 Trust Built on <span className="text-indigo-600">Verification & Transparency</span>
//               </h2>
//               <p className="text-lg text-gray-600 mb-8">
//                 Every freelancer on SkillSphere goes through a rigorous verification process to ensure quality and reliability for our clients.
//               </p>
              
//               <div className="space-y-4">
//                 {[
//                   { icon: <Icons.Check />, title: 'Identity Verification', desc: 'Government ID and professional credentials verified' },
//                   { icon: <Icons.Star filled />, title: 'Reviews & Ratings', desc: 'Transparent feedback system from real clients' },
//                   { icon: <Icons.AI />, title: 'AI Quality Scoring', desc: 'Algorithmic assessment of work history and skills' },
//                   { icon: <Icons.Shield />, title: 'Secure Contracts', desc: 'Legally-binding agreements with clear terms' },
//                 ].map((item, i) => (
//                   <div key={i} className="flex items-start gap-4">
//                     <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
//                       {item.icon}
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-900">{item.title}</h4>
//                       <p className="text-gray-600 text-sm">{item.desc}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             <div className="relative">
//               <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
//                 <div className="flex items-center gap-4 mb-6 pb-6 border-b">
//                   <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
//                     JS
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900">Jessica Smith</h4>
//                     <p className="text-sm text-gray-500">UX Designer • Verified</p>
//                     <StarRating rating={4.9} />
//                   </div>
//                 </div>
                
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Completed Projects</span>
//                     <span className="font-semibold">47</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">On-Time Delivery</span>
//                     <span className="font-semibold text-green-600">98%</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Response Time</span>
//                     <span className="font-semibold">&lt; 2 hours</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Member Since</span>
//                     <span className="font-semibold">Jan 2024</span>
//                   </div>
//                 </div>
                
//                 <div className="mt-6 pt-6 border-t">
//                   <div className="flex items-center gap-2 text-sm text-green-600">
//                     <Icons.Check />
//                     <span>Background check verified</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
//                     <Icons.Check />
//                     <span>Portfolio authenticated</span>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Decorative elements */}
//               <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>
//               <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 7. Real-Time Collaboration Tools */}
//       <section className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <SectionTitle 
//             title="Work Together, Anywhere" 
//             subtitle="Built-in tools for seamless communication and project management"
//           />

//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <div className="order-2 lg:order-1">
//               {/* Mock UI Preview */}
//               <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
//                 <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
//                   <div className="flex gap-1.5">
//                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
//                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                   </div>
//                   <span className="text-gray-400 text-sm ml-4">skillphere.app/project/alpha-launch</span>
//                 </div>
//                 <div className="p-6 space-y-4">
//                   <div className="flex gap-4">
//                     <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">C</div>
//                     <div className="flex-1 bg-gray-800 rounded-lg p-3">
//                       <p className="text-white text-sm">Let's finalize the homepage design by Friday. I've shared the Figma link in files.</p>
//                       <span className="text-gray-500 text-xs mt-2 block">2:34 PM</span>
//                     </div>
//                   </div>
//                   <div className="flex gap-4 flex-row-reverse">
//                     <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">F</div>
//                     <div className="flex-1 bg-indigo-600 rounded-lg p-3">
//                       <p className="text-white text-sm">Perfect! I'll have the mockups ready for review. Also uploaded the brand guidelines.</p>
//                       <span className="text-indigo-200 text-xs mt-2 block">2:36 PM</span>
//                     </div>
//                   </div>
//                   <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs">📁</div>
//                       <div>
//                         <p className="text-white text-sm font-medium">Brand_Guidelines_v2.pdf</p>
//                         <p className="text-gray-400 text-xs">2.4 MB • Shared 2h ago</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
//                     <input 
//                       type="text" 
//                       placeholder="Type a message..." 
//                       className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                     <button className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors">
//                       <Icons.ArrowRight />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="order-1 lg:order-2">
//               <h3 className="text-2xl font-bold text-gray-900 mb-6">Everything you need in one place</h3>
//               <div className="space-y-6">
//                 {[
//                   { icon: <Icons.Chat />, title: 'Real-Time Messaging', desc: 'Instant chat with file sharing, voice notes, and video calls' },
//                   { icon: '📋', title: 'Milestone Tracking', desc: 'Visual progress boards with deadlines and deliverables' },
//                   { icon: '🔐', title: 'Secure File Storage', desc: 'Encrypted storage for all project assets and documents' },
//                   { icon: '📊', title: 'Time & Activity Logs', desc: 'Transparent work tracking with optional screenshot verification' },
//                 ].map((feature, i) => (
//                   <div key={i} className="flex items-start gap-4">
//                     <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-xl">
//                       {feature.icon}
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
//                       <p className="text-gray-600">{feature.desc}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 8. Admin Analytics Preview */}
//       <section className="py-16 bg-gray-900 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 rounded-full text-indigo-300 text-sm mb-6">
//             <Icons.AI />
//             <span>For Platform Administrators</span>
//           </div>
//           <h2 className="text-3xl font-bold mb-4">Admin Dashboard – Empowering the freelance ecosystem</h2>
//           <p className="text-gray-400 max-w-2xl mx-auto mb-8">
//             Monitor platform health, freelancer performance, and business metrics with our comprehensive analytics suite.
//           </p>
          
//           <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
//             {[
//               { label: 'Active Projects', value: '1,247', change: '+12%' },
//               { label: 'Payment Volume', value: '$284K', change: '+28%' },
//               { label: 'New Signups', value: '342', change: '+15%' },
//             ].map((metric, i) => (
//               <div key={i} className="bg-gray-800 rounded-xl p-6">
//                 <p className="text-gray-400 text-sm mb-1">{metric.label}</p>
//                 <div className="flex items-end justify-between">
//                   <span className="text-3xl font-bold">{metric.value}</span>
//                   <span className="text-green-400 text-sm font-medium">{metric.change}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           <div className="mt-10">
//             <CTAButton variant="secondary" href="/admin/demo" className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
//               Request Demo Access
//             </CTAButton>
//           </div>
//         </div>
//       </section>

//       {/* 9. Milestone Payments */}
//       <section className="py-20 bg-white">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <SectionTitle 
//             title="Secure Milestone Payments" 
//             subtitle="Protecting both clients and freelancers with smart payment scheduling"
//           />
          
//           <div className="relative">
//             {/* Connection Line */}
//             <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200"></div>
            
//             <div className="grid md:grid-cols-3 gap-8">
//               {[
//                 { step: '1', title: 'Set Milestones', desc: 'Break project into phases with clear deliverables and payment amounts' },
//                 { step: '2', title: 'Secure Escrow', desc: 'Funds held safely until work is approved at each milestone' },
//                 { step: '3', title: 'Release & Rate', desc: 'Approve work, release payment, and leave feedback' },
//               ].map((item, i) => (
//                 <div key={i} className="relative">
//                   <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
//                     {item.step}
//                   </div>
//                   <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
//                   <p className="text-gray-600 text-sm">{item.desc}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="mt-12 p-6 bg-green-50 rounded-xl border border-green-100 inline-block">
//             <div className="flex items-center gap-3 text-green-800">
//               <Icons.Shield />
//               <span className="font-medium">100% Payment Protection • Dispute Resolution • Satisfaction Guaranteed</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 11. Trending Skills */}
//       <section className="py-16 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">🔥 Trending Skills & Categories</h3>
          
//           <div className="flex flex-wrap justify-center gap-3">
//             {trendingSkills.map((skill) => (
//               <a 
//                 key={skill.name}
//                 href={`/freelancers?skill=${encodeURIComponent(skill.name)}`}
//                 className="group flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-indigo-200"
//               >
//                 <span className="text-xl">{skill.icon}</span>
//                 <div className="text-left">
//                   <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{skill.name}</span>
//                   <span className="block text-xs text-gray-500">{skill.count} freelancers</span>
//                 </div>
//               </a>
//             ))}
//           </div>
          
//           <div className="text-center mt-8">
//             <a href="/skills" className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1">
//               Explore All Categories <Icons.ArrowRight />
//             </a>
//           </div>
//         </div>
//       </section>

//       {/* 12. Local Community Focus */}
//       <section className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <SectionTitle 
//             title="Find Talent Near You" 
//             subtitle="SkillSphere is active in communities across the region"
//           />

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {localAreas.map((area) => (
//               <a 
//                 key={area.city}
//                 href={`/locations/${encodeURIComponent(area.city)}`}
//                 className="group block bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-indigo-100"
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <h4 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
//                       {area.city}
//                     </h4>
//                     <p className="text-gray-500 text-sm">{area.region}</p>
//                   </div>
//                   <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
//                     <Icons.Location />
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <span className="block text-gray-500">Freelancers</span>
//                     <span className="font-semibold text-gray-900">{area.freelancerCount}+</span>
//                   </div>
//                   <div>
//                     <span className="block text-gray-500">Active Projects</span>
//                     <span className="font-semibold text-gray-900">{area.activeProjects}</span>
//                   </div>
//                 </div>
                
//                 <div className="mt-4 pt-4 border-t border-indigo-100">
//                   <span className="text-indigo-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
//                     Find Local Freelancers <Icons.ArrowRight />
//                   </span>
//                 </div>
//               </a>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* 13. Security & Privacy */}
//       <section className="py-12 bg-gray-900 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
//                 <Icons.Shield />
//               </div>
//               <div>
//                 <h4 className="font-semibold">Your Data, Protected</h4>
//                 <p className="text-gray-400 text-sm">End-to-end encryption • GDPR compliant • Secure payments</p>
//               </div>
//             </div>
            
//             <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
//               <span className="flex items-center gap-2">
//                 <Icons.Check /> SOC 2 Certified
//               </span>
//               <span className="flex items-center gap-2">
//                 <Icons.Check /> PCI DSS Compliant
//               </span>
//               <span className="flex items-center gap-2">
//                 <Icons.Check /> 256-bit SSL Encryption
//               </span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 15. Blog & Resources */}
//       <section id="resources" className="py-20 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <SectionTitle 
//             title="Resources & Insights" 
//             subtitle="Learn, grow, and succeed with our expert guides"
//           />

//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 title: 'How to Build Your Freelance Portfolio',
//                 excerpt: 'Stand out from the competition with these proven portfolio strategies...',
//                 category: 'For Freelancers',
//                 readTime: '5 min read',
//                 image: '🎨'
//               },
//               {
//                 title: 'Top 5 Tips for Hiring the Perfect Freelancer',
//                 excerpt: 'Avoid common pitfalls and find talent that delivers exceptional results...',
//                 category: 'For Clients',
//                 readTime: '4 min read',
//                 image: '🔍'
//               },
//               {
//                 title: 'How AI is Revolutionizing Freelance Work',
//                 excerpt: 'Discover how intelligent matching is changing the future of remote work...',
//                 category: 'Industry Insights',
//                 readTime: '7 min read',
//                 image: '🤖'
//               },
//             ].map((post, i) => (
//               <a 
//                 key={i}
//                 href={`/blog/post-${i + 1}`}
//                 className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
//               >
//                 <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl">
//                   {post.image}
//                 </div>
//                 <div className="p-6">
//                   <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium mb-3">
//                     {post.category}
//                   </span>
//                   <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
//                     {post.title}
//                   </h4>
//                   <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
//                   <div className="flex items-center justify-between text-xs text-gray-500">
//                     <span>{post.readTime}</span>
//                     <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
//                       Read More <Icons.ArrowRight />
//                     </span>
//                   </div>
//                 </div>
//               </a>
//             ))}
//           </div>

//           <div className="text-center mt-10">
//             <CTAButton variant="outline" href="/blog">View All Articles</CTAButton>
//           </div>
//         </div>
//       </section>

//       {/* Bonus: Freelancer of the Month */}
//       <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
//             🌟 Community Spotlight
//           </span>
//           <h3 className="text-2xl md:text-3xl font-bold mb-4">Freelancer of the Month: Marcus Chen</h3>
//           <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
//             Full-stack developer who completed 23 projects with a 100% satisfaction rate. 
//             "SkillSphere helped me build a sustainable freelance career right here in my hometown."
//           </p>
//           <div className="flex flex-wrap justify-center gap-4">
//             <CTAButton variant="secondary" href="/freelancers/marcus-chen" className="!bg-white !text-indigo-600">
//               View Marcus's Profile
//             </CTAButton>
//             <CTAButton variant="outline" href="/spotlight" className="!border-white/30 !text-white hover:!bg-white/10">
//               Nominate Someone
//             </CTAButton>
//           </div>
//         </div>
//       </section>

//       {/* 10. Final CTA Footer */}
//       <section className="py-20 bg-white">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
//             Ready to Transform Your Work?
//           </h2>
//           <p className="text-xl text-gray-600 mb-10">
//             Join thousands of businesses and freelancers thriving on SkillSphere
//           </p>
          
//           <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
//             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
//               <h4 className="font-bold text-gray-900 mb-3">For Clients</h4>
//               <p className="text-gray-600 mb-6">Find the best local freelancers for your next project</p>
//               <CTAButton variant="primary" href="/clients/post-project" className="w-full justify-center">
//                 Find Local Talent Today
//               </CTAButton>
//             </div>
            
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
//               <h4 className="font-bold text-gray-900 mb-3">For Freelancers</h4>
//               <p className="text-gray-600 mb-6">Get hired by local businesses near you</p>
//               <CTAButton variant="secondary" href="/freelancers/signup" className="w-full justify-center">
//                 Start Your Journey
//               </CTAButton>
//             </div>
//           </div>

//           {/* Social Links & Contact */}
//           <div className="pt-8 border-t">
//             <p className="text-gray-600 mb-4">Connect with us</p>
//             <div className="flex justify-center gap-4 mb-6">
//               {['Twitter', 'LinkedIn', 'Instagram', 'GitHub'].map((social) => (
//                 <a 
//                   key={social}
//                   href={`#${social.toLowerCase()}`}
//                   className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
//                 >
//                   {social[0]}
//                 </a>
//               ))}
//             </div>
//             <a href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1">
//               Contact Support <Icons.ArrowRight />
//             </a>
//           </div>
//         </div>
//       </section>

//       {/* Bonus: Live Chat Widget */}
//       <div className="fixed bottom-6 right-6 z-50">
//         <button 
//           onClick={() => showNotification('info', 'Chat widget would open here!')}
//           className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all hover:scale-105"
//         >
//           <Icons.Chat />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SkillSphereLanding;


























// pages/HomePage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { fetchData, postData } from '../services/api'; 
import { toast } from 'react-hot-toast';

// --- Types (imported from your types file or defined here) ---
interface Project {
  id: number | string;
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
  freelancer?: {
    id?: string;
    name?: string;
  };
}

interface Testimonial {
  id: number | string;
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

interface FreelancerPin {
  id: string;
  name: string;
  skill: string;
  rating: number;
  location: { x: number; y: number }; // percentage coordinates for animation
  avatar: string;
  bio: string;
}

interface SkillPiece {
  id: string;
  name: string;
  icon: string;
  matched: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  type: 'client' | 'freelancer';
}

interface ReputationBadge {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  level: number;
}

const normalizeProject = (raw: any): Project => {
  const budgetValue =
    typeof raw?.budget === 'number'
      ? `$${raw.budget.toLocaleString()}`
      : raw?.budget || 'Budget TBD';
  const numericBudget =
    typeof raw?.budget === 'number'
      ? raw.budget
      : typeof raw?.budgetRange?.max === 'number'
      ? raw.budgetRange.max
      : 0;

  const clientName =
    typeof raw?.client === 'object'
      ? raw.client?.name || 'Verified Client'
      : 'Verified Client';

  return {
    id: raw?.id || raw?._id || `project-${Math.random().toString(36).slice(2, 9)}`,
    title: raw?.title || 'Untitled Project',
    category: raw?.category || 'General',
    budget: budgetValue,
    budgetRange: raw?.budgetRange || { min: numericBudget, max: numericBudget },
    location: raw?.location || 'Remote',
    coordinates: raw?.coordinates,
    postedAt: raw?.postedAt || (raw?.createdAt ? new Date(raw.createdAt).toLocaleDateString() : 'Recently'),
    postedTimestamp: raw?.postedTimestamp || (raw?.createdAt ? new Date(raw.createdAt).getTime() : Date.now()),
    tags: Array.isArray(raw?.tags) ? raw.tags : Array.isArray(raw?.skillsRequired) ? raw.skillsRequired : [],
    description: raw?.description || 'No description provided yet.',
    client: {
      name: clientName,
      avatar:
        (typeof raw?.client === 'object' && raw.client?.avatar) ||
        'https://i.pravatar.cc/150?img=11',
      rating:
        typeof raw?.client === 'object' && typeof raw.client?.rating === 'number'
          ? raw.client.rating
          : 5,
      verified:
        typeof raw?.client === 'object' && typeof raw.client?.verified === 'boolean'
          ? raw.client.verified
          : true,
    },
    applications: typeof raw?.applications === 'number' ? raw.applications : 0,
    featured: Boolean(raw?.featured),
    freelancer: raw?.freelancer,
  };
};

const normalizeTestimonial = (raw: any, index: number): Testimonial => ({
  id: raw?.id || raw?._id || index + 1,
  name: raw?.name || 'Community Member',
  role: raw?.role || 'SkillSphere User',
  company: raw?.company || 'SkillSphere',
  avatar: raw?.avatar || 'https://i.pravatar.cc/150?img=9',
  content: raw?.content || 'SkillSphere helped me find the right opportunities quickly.',
  rating: typeof raw?.rating === 'number' ? raw.rating : 5,
});

const normalizeFaq = (raw: any): FAQ => ({
  question: raw?.question || 'How does SkillSphere work?',
  answer:
    raw?.answer ||
    'SkillSphere helps clients and freelancers connect, collaborate, and complete projects safely.',
});

const isValidMongoObjectId = (value: string) => /^[a-fA-F0-9]{24}$/.test(value);

// --- Color Theme: White-Cyan ---
// Primary: cyan-500/cyan-600 | Background: white/gray-50 | Text: gray-800/gray-900

const HomePage: React.FC = () => {
  // State Management
  const [, setUserType] = useState<'client' | 'freelancer' | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeHeroPin, setActiveHeroPin] = useState<FreelancerPin | null>(null);
  const [draggedSkills, setDraggedSkills] = useState<SkillPiece[]>([]);
  const [aiMatchResults, setAiMatchResults] = useState<Project[]>([]);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizType, setQuizType] = useState<'client' | 'freelancer' | null>(null);
  const [reputationScore] = useState(75);

   const [, setLoading] = useState(true);

  const [badges] = useState<ReputationBadge[]>([
    { id: '1', name: 'Rising Star', icon: '⭐', unlocked: true, level: 1 },
    { id: '2', name: 'Client\'s Choice', icon: '🏆', unlocked: false, level: 2 },
    { id: '3', name: 'Top Rated', icon: '💎', unlocked: false, level: 3 },
  ]);
  const [heatmapData, setHeatmapData] = useState<FreelancerPin[]>([]);
  const [activeRoom, setActiveRoom] = useState<'portfolio' | 'collab' | 'payment'>('portfolio');
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [quizRecommendations, setQuizRecommendations] = useState<Project[]>([]);

  const heroSectionRef = useRef<HTMLDivElement>(null);
  // const notificationTimeoutRef = useRef<NodeJS.Timeout>();
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sample data for demo (replace with API calls)
  const sampleFreelancerPins: FreelancerPin[] = [
    { id: '1', name: 'Alex Chen', skill: 'React Developer', rating: 4.9, location: { x: 25, y: 40 }, avatar: 'https://i.pravatar.cc/150?img=1', bio: 'Full-stack developer specializing in modern web apps' },
    { id: '2', name: 'Maria Garcia', skill: 'UI/UX Designer', rating: 4.8, location: { x: 65, y: 30 }, avatar: 'https://i.pravatar.cc/150?img=2', bio: 'Creating beautiful, user-centered digital experiences' },
    { id: '3', name: 'James Wilson', skill: 'Content Writer', rating: 4.7, location: { x: 45, y: 65 }, avatar: 'https://i.pravatar.cc/150?img=3', bio: 'Crafting compelling copy that converts' },
    { id: '4', name: 'Sophie Martin', skill: 'Data Scientist', rating: 5.0, location: { x: 80, y: 55 }, avatar: 'https://i.pravatar.cc/150?img=4', bio: 'Turning data into actionable business insights' },
  ];

  const availableSkills: SkillPiece[] = [
    { id: 's1', name: 'React', icon: '⚛️', matched: false },
    { id: 's2', name: 'Node.js', icon: '🟢', matched: false },
    { id: 's3', name: 'Python', icon: '🐍', matched: false },
    { id: 's4', name: 'UI Design', icon: '🎨', matched: false },
    { id: 's5', name: 'SEO', icon: '🔍', matched: false },
    { id: 's6', name: 'Copywriting', icon: '✍️', matched: false },
  ];

  const quizQuestions: QuizQuestion[] = [
    { id: 1, question: "What's the nature of your project?", options: ['Web Development', 'Graphic Design', 'Content Writing', 'Data Analysis'], type: 'client' },
    { id: 2, question: "What's your ideal budget range?", options: ['$500-$1,000', '$1,000-$5,000', '$5,000-$15,000', '$15,000+'], type: 'client' },
    { id: 3, question: 'How fast do you need it completed?', options: ['ASAP (1 week)', '2-4 weeks', '1-2 months', 'Flexible timeline'], type: 'client' },
    { id: 4, question: 'What are your top skills?', options: ['Frontend Development', 'Backend Development', 'Design', 'Writing & Content'], type: 'freelancer' },
    { id: 5, question: 'How many hours/week can you dedicate?', options: ['<10 hours', '10-20 hours', '20-40 hours', '40+ hours'], type: 'freelancer' },
  ];

  // --- API Integration Functions ---
  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetchData('/projects');
      const safeProjects = Array.isArray(response) ? response.map(normalizeProject) : [];
      setProjects(safeProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
      toast.error('Failed to load projects. Please try again.');
    }
  }, []);

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await fetchData('/testimonials');
      const safeTestimonials = Array.isArray(response)
        ? response.map((item, index) => normalizeTestimonial(item, index))
        : [];
      setTestimonials(safeTestimonials);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      setTestimonials([]);
      toast.error('Failed to load testimonials. Please try again.');
    }
  }, []);

  const fetchFaqs = useCallback(async () => {
    try {
      const response = await fetchData('/faqs');
      const safeFaqs = Array.isArray(response) ? response.map(normalizeFaq) : [];
      setFaqs(safeFaqs);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      setFaqs([]);
      toast.error('Failed to load FAQs. Please try again.');
    }
  }, []);

  const fetchHeatmapData = useCallback(async () => {
    try {
      // In production: api.get('/freelancers/heatmap')
      setHeatmapData(sampleFreelancerPins);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
    }
  }, []);

  const submitQuizAnswers = useCallback(async () => {
    try {
      const response = await api.post<Project[]>('/ai/match', {
        type: quizType,
        answers: quizAnswers,
      });
      setQuizRecommendations(response.data);
      setIsQuizComplete(true);
      addNotification('success', 'Perfect! Here are your AI-powered recommendations.');
    } catch (error) {
      console.error('Quiz submission failed:', error);
      addNotification('error', 'Could not generate recommendations. Please try again.');
    }
  }, [quizType, quizAnswers]);

  const applyToProject = useCallback(async (projectId: string | number) => {
    const safeProjectId = String(projectId);
    if (!isValidMongoObjectId(safeProjectId)) {
      toast.error('This project is preview-only and cannot accept applications yet.');
      return;
    }

    try {
      await postData(`/projects/${safeProjectId}/apply`, { projectId: safeProjectId });
      toast.success('Successfully applied to the project!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Application failed';
      toast.error(message);
    }
  }, []);

  // --- Notification System ---
  const addNotification = (type: Notification['type'], message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = { id, type, message, duration };
    setNotifications(prev => [...prev, newNotification]);
    
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    notificationTimeoutRef.current = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  // --- Drag & Drop for AI Matchmaking ---
  const handleDragStart = (e: React.DragEvent, skill: SkillPiece) => {
    e.dataTransfer.setData('skillId', skill.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const skillId = e.dataTransfer.getData('skillId');
    const skill = availableSkills.find(s => s.id === skillId);
    
    if (skill && !draggedSkills.some(s => s.id === skillId)) {
      const newSkill = { ...skill, matched: true };
      setDraggedSkills(prev => [...prev, newSkill]);
      
      // Simulate AI matching
      setTimeout(() => {
        const matchedProjects = projects.filter(p => 
          (p.tags || []).some(tag => tag.toLowerCase().includes(skill.name.toLowerCase()))
        ).slice(0, 3);
        setAiMatchResults(prev => [...prev, ...matchedProjects].slice(0, 6));
      }, 300);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // --- Quiz Navigation ---
  const handleQuizAnswer = (questionId: number, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (quizStep < quizQuestions.filter(q => q.type === quizType).length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      submitQuizAnswers();
    }
  };

  const startQuiz = (type: 'client' | 'freelancer') => {
    setQuizType(type);
    setQuizStep(0);
    setQuizAnswers({});
    setIsQuizComplete(false);
  };

  // --- Reputation Gamification ---
  const calculateNextLevel = (currentScore: number) => {
    const levels = [0, 25, 50, 75, 100];
    return levels.find(level => level > currentScore) || 100;
  };

  const progressToNextLevel = ((reputationScore / calculateNextLevel(reputationScore)) * 100).toFixed(0);

  // --- Effects ---
  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProjects(),
        fetchTestimonials(),
        fetchFaqs(),
        fetchHeatmapData(),
      ]);

      if (isMounted) {
        setLoading(false);
      }
    };

    loadHomeData();
    
    return () => {
      isMounted = false;
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [fetchProjects, fetchTestimonials, fetchFaqs, fetchHeatmapData]);

  // --- Render Helpers ---
  const renderNotification = (notification: Notification) => {
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };
    
    return (
      <div 
        key={notification.id}
        className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl border-2 shadow-lg animate-slide-in-right ${colors[notification.type]}`}
        role="alert"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '✕'}
            {notification.type === 'info' && 'ℹ'}
            {notification.type === 'warning' && '⚠'}
          </span>
          <p className="font-medium">{notification.message}</p>
        </div>
      </div>
    );
  };

  const renderHeroSection = () => (
    <section 
      ref={heroSectionRef}
      className="relative min-h-screen bg-gradient-to-br from-white via-cyan-50 to-white overflow-hidden"
    >
      {/* Animated Cityscape Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-cyan-100 to-transparent" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 bg-cyan-200 rounded-t-lg animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${Math.random() * 200 + 50}px`,
              width: `${Math.random() * 30 + 10}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Interactive Freelancer Pins */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Talent,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-cyan-700">
              Just Around the Corner
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with the best freelancers in your neighborhood. 
            Local expertise, global quality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setUserType('client')}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Find Your Local Expert
            </button>
            <button
              onClick={() => setUserType('freelancer')}
              className="px-8 py-4 bg-white border-2 border-cyan-600 text-cyan-700 font-semibold rounded-xl hover:bg-cyan-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              Launch Your Freelance Career Here
            </button>
          </div>
        </div>

        {/* Interactive Map Area */}
        <div className="relative h-96 md:h-[500px] bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-cyan-200 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-white">
            {/* Grid lines for map effect */}
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="absolute h-full w-px bg-cyan-100" style={{ left: `${i * 10}%` }} />
                <div className="absolute w-full h-px bg-cyan-100" style={{ top: `${i * 10}%` }} />
              </React.Fragment>
            ))}
            
            {/* Freelancer Pins */}
            {sampleFreelancerPins.map((pin) => (
              <button
                key={pin.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                style={{ left: `${pin.location.x}%`, top: `${pin.location.y}%` }}
                onMouseEnter={() => setActiveHeroPin(pin)}
                onMouseLeave={() => setActiveHeroPin(null)}
                onClick={() => setActiveHeroPin(activeHeroPin?.id === pin.id ? null : pin)}
                aria-label={`View profile of ${pin.name}, ${pin.skill}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg animate-bounce-slow">
                    {pin.avatar ? (
                      <img src={pin.avatar} alt={pin.name} className="w-full h-full rounded-full object-cover" />
                    ) : pin.name[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                
                {/* Pin Tooltip */}
                {(activeHeroPin?.id === pin.id) && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 p-4 bg-white rounded-2xl shadow-2xl border border-cyan-200 z-20 animate-fade-in-up">
                    <div className="flex items-start gap-3">
                      <img src={pin.avatar} alt={pin.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{pin.name}</h4>
                        <p className="text-cyan-600 text-sm font-medium">{pin.skill}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(pin.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{pin.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{pin.bio}</p>
                    <span className="mt-3 block text-center w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors">
                      View Profile
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 px-3 py-2 rounded-lg shadow-sm border border-cyan-100">
            <div className="w-3 h-3 bg-cyan-500 rounded-full" />
            <span className="text-xs text-gray-600">Available Freelancers</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-scroll-down" />
        </div>
      </div>
    </section>
  );

  const renderAIMatchmaking = () => (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Smart Matches,{' '}
            <span className="text-cyan-600">Instant Results</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by AI. Drag your skills, get perfect matches in real-time.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Skill Drag Zone */}
          <div className="mb-8 p-6 bg-gradient-to-r from-cyan-50 to-white rounded-2xl border-2 border-dashed border-cyan-300">
            <p className="text-center text-gray-600 mb-4 font-medium">
              Drag skills below to build your project profile →
            </p>
            <div 
              className="flex flex-wrap justify-center gap-3 min-h-[60px] p-4 bg-white rounded-xl border-2 border-cyan-200"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {draggedSkills.length === 0 ? (
                <span className="text-gray-400 italic">Drop skills here...</span>
              ) : (
                draggedSkills.map((skill) => (
                  <div 
                    key={skill.id}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full font-medium animate-scale-in"
                  >
                    <span>{skill.icon}</span>
                    <span>{skill.name}</span>
                    <button 
                      onClick={() => setDraggedSkills(prev => prev.filter(s => s.id !== skill.id))}
                      className="ml-1 text-cyan-600 hover:text-cyan-800 font-bold"
                      aria-label={`Remove ${skill.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Skills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {availableSkills
              .filter(skill => !draggedSkills.some(s => s.id === skill.id))
              .map((skill) => (
                <div
                  key={skill.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, skill)}
                  className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 hover:border-cyan-400 hover:shadow-lg rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{skill.icon}</span>
                  <span className="font-medium text-gray-700 group-hover:text-cyan-700">{skill.name}</span>
                </div>
              ))}
          </div>

          {/* AI Results */}
          {aiMatchResults.length > 0 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                🎯 Your AI-Powered Matches
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiMatchResults.map((project) => (
                  <div 
                    key={project.id}
                    className="p-6 bg-white rounded-2xl border border-cyan-100 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-sm font-medium rounded-full">
                        {project.category}
                      </span>
                      {project.featured && (
                        <span className="text-yellow-500">★ Featured</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-cyan-700 transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-cyan-600">{project.budget}</span>
                      <span className="text-gray-500">{project.location}</span>
                    </div>
                    <button
                      onClick={() => applyToProject(project.id)}
                      className="mt-4 w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 transform hover:-translate-y-0.5">
              Try the AI Match Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderVirtualOffice = () => (
    <section className="py-20 bg-gradient-to-b from-cyan-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our <span className="text-cyan-600">Virtual Workspace</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Click through rooms to discover how SkillSphere makes freelancing seamless.
          </p>
        </div>

        {/* Room Navigation */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {[
            { id: 'portfolio', label: '🎨 Portfolio Room', desc: 'Explore freelancer work' },
            { id: 'collab', label: '💬 Collaboration Room', desc: 'Real-time tools demo' },
            { id: 'payment', label: '💰 Payment Hub', desc: 'Secure milestone payments' },
          ].map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeRoom === room.id
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white text-gray-700 border-2 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50'
              }`}
            >
              <div className="text-lg mb-1">{room.label.split(' ')[0]}</div>
              <div className="text-sm opacity-90">{room.desc}</div>
            </button>
          ))}
        </div>

        {/* Room Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-cyan-100 overflow-hidden">
          <div className="p-8 md:p-12">
            {activeRoom === 'portfolio' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Freelancer Portfolio Gallery</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {testimonials.slice(0, 2).map((testimonial) => (
                    <div key={testimonial.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 hover:border-cyan-300 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                          <p className="text-cyan-600 text-sm">{testimonial.role} at {testimonial.company}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 italic mb-3">"{testimonial.content}"</p>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < testimonial.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeRoom === 'collab' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Real-Time Collaboration Tools</h3>
                <div className="space-y-4">
                  {[
                    { icon: '💬', title: 'Instant Messaging', desc: 'Chat with freelancers in real-time' },
                    { icon: '📋', title: 'Task Tracking', desc: 'Manage milestones and deadlines' },
                    { icon: '🎥', title: 'Video Meetings', desc: 'Built-in video calls with screen sharing' },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-cyan-50 rounded-xl">
                      <span className="text-3xl">{feature.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <p className="text-gray-600">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeRoom === 'payment' && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Secure Payment Hub</h3>
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Milestone Protection</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✓ Active</span>
                  </div>
                  <p className="opacity-90 mb-4">
                    Funds are held securely until you approve the work. 
                    Dispute resolution included.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>End-to-end encrypted transactions</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Escrow Protection', value: '100%' },
                    { label: 'Avg. Payment Time', value: '24h' },
                    { label: 'Dispute Resolution', value: '48h' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-cyan-600">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex justify-between px-8 pb-8">
            <button 
              onClick={() => {
                const rooms = ['portfolio', 'collab', 'payment'] as const;
                const currentIndex = rooms.indexOf(activeRoom);
                const prevIndex = (currentIndex - 1 + rooms.length) % rooms.length;
                setActiveRoom(rooms[prevIndex]);
              }}
              className="p-3 bg-gray-100 hover:bg-cyan-100 rounded-full transition-colors"
              aria-label="Previous room"
            >
              ←
            </button>
            <button 
              onClick={() => {
                const rooms = ['portfolio', 'collab', 'payment'] as const;
                const currentIndex = rooms.indexOf(activeRoom);
                const nextIndex = (currentIndex + 1) % rooms.length;
                setActiveRoom(rooms[nextIndex]);
              }}
              className="p-3 bg-gray-100 hover:bg-cyan-100 rounded-full transition-colors"
              aria-label="Next room"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderSuccessWall = () => (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Success Stories <span className="text-cyan-600">That Inspire</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real people, real results. Hover to explore their journeys.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div 
              key={index}
              className="group relative bg-gradient-to-br from-white to-cyan-50 rounded-2xl border border-cyan-100 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 cursor-pointer"
            >
              {/* Front: Preview */}
              <div className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
                  {index % 2 === 0 ? '👤' : '🏢'}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {index % 2 === 0 ? 'Sarah K.' : 'TechStart Inc.'}
                </h4>
                <p className="text-cyan-600 text-sm font-medium mb-3">
                  {index % 2 === 0 ? 'Freelance Designer' : 'Startup Founder'}
                </p>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {index % 2 === 0 
                    ? 'Went from 0 to 50+ clients in 6 months...' 
                    : 'Found the perfect developer for our MVP launch...'}
                </p>
              </div>
              
              {/* Back: Expanded Story (on hover) */}
              <div className="absolute inset-0 bg-white p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm text-gray-700">Completed 47 projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-700">4.9/5 average rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-500">💰</span>
                    <span className="text-sm text-gray-700">
                      {index % 2 === 0 ? '$85k+ earned' : '$120k saved on hiring'}
                    </span>
                  </div>
                  <button className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Read Full Story
                  </button>
                </div>
              </div>
              
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-200 to-transparent opacity-50" />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-white border-2 border-cyan-600 text-cyan-700 font-semibold rounded-xl hover:bg-cyan-50 transition-all duration-300">
            See More Success Stories
          </button>
        </div>
      </div>
    </section>
  );

  const renderMatchupQuiz = () => (
    <section className="py-20 bg-gradient-to-br from-cyan-600 to-cyan-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Perfect Match
          </h2>
          <p className="text-cyan-100 text-lg">
            Answer a few quick questions and let our AI connect you with ideal opportunities.
          </p>
        </div>

        {!quizType ? (
          <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-6">
            <button
              onClick={() => startQuiz('client')}
              className="p-8 bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-white/30 hover:border-white hover:bg-white/20 transition-all duration-300 group text-left"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
              <h3 className="text-xl font-bold mb-2">I'm a Client</h3>
              <p className="text-cyan-100">Find the perfect freelancer for your project</p>
            </button>
            <button
              onClick={() => startQuiz('freelancer')}
              className="p-8 bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-white/30 hover:border-white hover:bg-white/20 transition-all duration-300 group text-left"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">✨</div>
              <h3 className="text-xl font-bold mb-2">I'm a Freelancer</h3>
              <p className="text-cyan-100">Get matched with projects that fit your skills</p>
            </button>
          </div>
        ) : !isQuizComplete ? (
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/30">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span>Question {quizStep + 1}</span>
                <span>{quizType === 'client' ? 'Client' : 'Freelancer'} Quiz</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${((quizStep + 1) / quizQuestions.filter(q => q.type === quizType).length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            {quizQuestions.filter(q => q.type === quizType)[quizStep] && (
              <>
                <h3 className="text-2xl font-bold mb-6">
                  {quizQuestions.filter(q => q.type === quizType)[quizStep].question}
                </h3>
                <div className="space-y-3">
                  {quizQuestions.filter(q => q.type === quizType)[quizStep].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(quizQuestions.filter(q => q.type === quizType)[quizStep].id, option)}
                      className="w-full p-4 text-left bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition-all duration-200 hover:border-white"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 text-gray-900 animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Perfect Matches Found!</h3>
              <p className="text-gray-600">Based on your answers, here are your top recommendations:</p>
            </div>
            
            <div className="space-y-4 mb-8">
              {quizRecommendations.slice(0, 3).map((project) => (
                <div key={project.id} className="p-5 bg-gray-50 rounded-xl border border-cyan-100 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-600">{project.category} • {project.location}</p>
                  </div>
                  <button
                    onClick={() => applyToProject(project.id)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  setIsQuizComplete(false);
                  setQuizType(null);
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors"
              >
                Take Quiz Again
              </button>
              <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl transition-colors">
                Browse All Matches
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <button 
            onClick={() => { setIsQuizComplete(false); setQuizType(null); }}
            className="px-8 py-4 bg-white text-cyan-700 font-semibold rounded-xl hover:bg-cyan-50 transition-all duration-300 shadow-lg"
          >
            Take the SkillMatch Quiz and Find Your Perfect Match
          </button>
        </div>
      </div>
    </section>
  );

  const renderFreelancerSpotlight = () => (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Freelancer <span className="text-cyan-600">Spotlight</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Inspiring journeys from our community. Click to explore their stories.
          </p>
        </div>

        {/* Carousel Placeholder */}
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-cyan-50 to-white rounded-3xl p-8 md:p-12 border border-cyan-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-4xl font-bold mb-6 shadow-lg">
                  👩‍💻
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Maria Rodriguez</h3>
                <p className="text-cyan-600 font-medium mb-4">Full-Stack Developer • 3.5 years on SkillSphere</p>
                <p className="text-gray-600 mb-6">
                  "I was struggling to find consistent clients until I joined SkillSphere. 
                  The AI matching connected me with projects that perfectly fit my skills, 
                  and the milestone payment system gave me peace of mind."
                </p>
                
                {/* Progress Stats */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Projects Completed</span>
                      <span className="font-semibold text-cyan-700">87</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Income Growth</span>
                      <span className="font-semibold text-cyan-700">+340%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="aspect-video bg-gray-200 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-gray-500">Mini-documentary preview</p>
                    <button className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors">
                      Watch Story
                    </button>
                  </div>
                </div>
                
                {/* Before/After */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-sm font-medium text-red-700 mb-1">Before</p>
                    <p className="text-xs text-gray-600">Inconsistent income, hard to find clients</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-sm font-medium text-green-700 mb-1">After</p>
                    <p className="text-xs text-gray-600">Steady projects, 5-star reputation</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Carousel Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {[...Array(4)].map((_, i) => (
                <button
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === 0 ? 'bg-cyan-600 w-6' : 'bg-cyan-300 hover:bg-cyan-400'
                  }`}
                  aria-label={`View story ${i + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-white border-2 border-cyan-600 text-cyan-700 font-semibold rounded-xl hover:bg-cyan-50 transition-all duration-300">
              Read More Freelancer Stories
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderReputationTracker = () => (
    <section className="py-20 bg-gradient-to-b from-white to-cyan-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Level Up Your <span className="text-cyan-600">Reputation</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock achievements, earn badges, and build trust with every project.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Reputation Score Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-cyan-100 p-8 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <p className="text-gray-600 mb-2">Your Reputation Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">{reputationScore}</span>
                  <span className="text-xl text-gray-500">/ {calculateNextLevel(reputationScore)}</span>
                </div>
                <p className="text-cyan-600 font-medium mt-1">
                  {100 - parseInt(progressToNextLevel)}% to next level
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="flex-1 w-full md:max-w-md">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-700 animate-pulse-slow"
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Level {Math.floor(reputationScore / 25) + 1}</span>
                  <span>Level {Math.floor(reputationScore / 25) + 2}</span>
                </div>
              </div>
              
              <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl transition-colors whitespace-nowrap">
                Start Earning Today
              </button>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                  badge.unlocked 
                    ? 'bg-gradient-to-br from-cyan-50 to-white border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-3xl mb-3">{badge.icon}</div>
                <h4 className={`font-semibold mb-1 ${badge.unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                  {badge.name}
                </h4>
                <p className="text-xs text-gray-500">Level {badge.level}</p>
                {!badge.unlocked && (
                  <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: '40%' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 italic mb-4">
              "Unlock Achievements as You Go. Build Your Reputation with Every Project."
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 transform hover:-translate-y-0.5">
              Start Earning Your Reputation Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderLocalHeatmap = () => (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Local Talent <span className="text-cyan-600">Heatmap</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover top-rated freelancers in your neighborhood. Zoom, explore, connect.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Map Container */}
          <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl border-2 border-cyan-200 overflow-hidden shadow-xl">
            {/* Map Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-200"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Heatmap Overlays */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-cyan-400/20 blur-2xl animate-pulse"
                  style={{
                    width: `${Math.random() * 150 + 50}px`,
                    height: `${Math.random() * 150 + 50}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Freelancer Markers */}
            {heatmapData.map((freelancer) => (
              <button
                key={freelancer.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                style={{ left: `${freelancer.location.x}%`, top: `${freelancer.location.y}%` }}
                aria-label={`View ${freelancer.name}`}
              >
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-white shadow-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform">
                    {freelancer.avatar ? (
                      <img src={freelancer.avatar} alt={freelancer.name} className="w-full h-full rounded-full object-cover" />
                    ) : freelancer.name[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                </div>
                
                {/* Hover Card */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-3 bg-white rounded-xl shadow-xl border border-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={freelancer.avatar} alt={freelancer.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{freelancer.name}</p>
                      <p className="text-cyan-600 text-xs">{freelancer.skill}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center text-yellow-400">
                      ★ {freelancer.rating}
                    </span>
                    <span className="text-gray-500">Nearby</span>
                  </div>
                </div>
              </button>
            ))}
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="w-10 h-10 bg-white rounded-lg shadow-md border border-cyan-200 flex items-center justify-center text-cyan-600 hover:bg-cyan-50 transition-colors font-bold text-xl">
                +
              </button>
              <button className="w-10 h-10 bg-white rounded-lg shadow-md border border-cyan-200 flex items-center justify-center text-cyan-600 hover:bg-cyan-50 transition-colors font-bold text-xl">
                −
              </button>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-cyan-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-600">Online now</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-xs text-gray-600">Available</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all duration-300">
              Find Local Talent in Your Area
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderFeaturedProjects = () => (
    <section className="py-20 bg-gradient-to-b from-cyan-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Projects</h2>
            <p className="text-gray-600 mt-1">Hand-picked opportunities for top talent</p>
          </div>
          <button className="px-6 py-2.5 bg-white border-2 border-cyan-600 text-cyan-700 font-medium rounded-xl hover:bg-cyan-50 transition-colors">
            View All Projects →
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 6).map((project) => (
            <div 
              key={project.id}
              className="group bg-white rounded-2xl border border-cyan-100 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-medium rounded-full">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(project.client.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-cyan-700 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={project.client.avatar} 
                      alt={project.client.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{project.client.name}</p>
                      <p className="text-xs text-gray-500">{project.client.verified ? '✓ Verified' : 'Client'}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-cyan-600">{project.budget}</span>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">{project.applications} applications</span>
                <button
                  onClick={() => applyToProject(project.id)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderFAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about SkillSphere</p>
          </div>
          
          <div className="space-y-4">
            {faqs.slice(0, 5).map((faq, index) => (
              <div 
                key={index}
                className="border border-cyan-100 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-cyan-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <span className={`transform transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-600">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="text-cyan-600 hover:text-cyan-700 font-medium">
              View All FAQs →
            </button>
          </div>
        </div>
      </section>
    );
  };
   
  // );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Notifications */}
      {notifications.map(renderNotification)}

      {/* Main Content */}
      <main className="pt-16">
        {renderHeroSection()}
        {renderAIMatchmaking()}
        {renderVirtualOffice()}
        {renderSuccessWall()}
        {renderMatchupQuiz()}
        {renderFreelancerSpotlight()}
        {renderReputationTracker()}
        {renderFeaturedProjects()}
        {renderLocalHeatmap()}
        {renderFAQ()}
      </main>

      {/* {renderFooter()} */}

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        .animate-scroll-down { animation: scroll-down 1.5s infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s infinite; }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default HomePage;

