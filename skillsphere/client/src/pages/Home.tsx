import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Code, ShieldCheck, Zap, MessageSquare, MapPin, Star, 
  Clock, CheckCircle,
} from 'lucide-react';
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
      ? `₹${raw.budget.toLocaleString()}`
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

// My Home pAge


const HomePage: React.FC = () => {
  // State Management
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
  const [, setHeatmapData] = useState<FreelancerPin[]>([]);
  const [activeRoom, setActiveRoom] = useState<'portfolio' | 'collab' | 'payment'>('portfolio');
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [quizRecommendations, setQuizRecommendations] = useState<Project[]>([]);

  const heroSectionRef = useRef<HTMLDivElement>(null);
  // const notificationTimeoutRef = useRef<NodeJS.Timeout>();
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [selectedCategory] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  const [, setFilteredProjects] = useState<Project[]>([]);
  
  const [, setIsPostProjectModalOpen] = useState(false);

  const [sortBy] = useState<"newest" | "budget-high" | "budget-low" | "applications">("newest");


  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isFreelancer = user?.role === "freelancer";

  // Sample data for demo (replace with API calls)
  const sampleFreelancerPins: FreelancerPin[] = [
    { id: '1', name: 'Alex Chen', skill: 'React Developer', rating: 4.9, location: { x: 25, y: 40 }, avatar: 'https://i.pravatar.cc/150?img=1', bio: 'Full-stack developer specializing in modern web apps' },
    { id: '2', name: 'Maria Garcia', skill: 'UI/UX Designer', rating: 4.8, location: { x: 65, y: 30 }, avatar: 'https://i.pravatar.cc/150?img=2', bio: 'Creating beautiful, user-centered digital experiences' },
    { id: '3', name: 'James Wilson', skill: 'Content Writer', rating: 4.7, location: { x: 45, y: 65 }, avatar: 'https://i.pravatar.cc/150?img=3', bio: 'Crafting compelling copy that converts' },
    { id: '4', name: 'Sophie Martin', skill: 'Data Scientist', rating: 5.0, location: { x: 80, y: 55 }, avatar: 'https://i.pravatar.cc/150?img=4', bio: 'Turning data into actionable business insights' },
  ];

   const mapBackendJobs = (jobs: any[]): Project[] =>
    jobs.map((job) => ({
      id: job._id || job.id || Math.random().toString(36).slice(2),
      title: job.title || 'New Project',
      category: job.skillsRequired?.[0] || 'Web Development',
      budget: typeof job.budget === 'number' ? `₹${job.budget.toLocaleString()}` : job.budget || '₹500',
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
      freelancer: {
    id: job.freelancer?._id,
    name: job.freelancer?.name
  },
      applications: job.proposalCount || 0,
    }));

  const availableSkills: SkillPiece[] = [
    { id: 's1', name: 'React', icon: '⚛️', matched: false },
    { id: 's2', name: 'Node.js', icon: '🟢', matched: false },
    { id: 's3', name: 'Python', icon: '🐍', matched: false },
    { id: 's4', name: 'UI Design', icon: '🎨', matched: false },
    { id: 's5', name: 'SEO', icon: '🔍', matched: false },
    { id: 's6', name: 'Copywriting', icon: '✍️', matched: false },
    { id: 's7', name: 'JavaScript', icon: '🟨', matched: false },
{ id: 's8', name: 'TypeScript', icon: '🔷', matched: false },
{ id: 's9', name: 'Angular', icon: '🅰️', matched: false },
{ id: 's10', name: 'Vue.js', icon: '🖖', matched: false },
{ id: 's11', name: 'Django', icon: '🌿', matched: false },
{ id: 's12', name: 'Flask', icon: '🍶', matched: false },
{ id: 's13', name: 'MongoDB', icon: '🍃', matched: false },
{ id: 's14', name: 'SQL', icon: '🗄️', matched: false },
{ id: 's15', name: 'Git', icon: '🔧', matched: false },
{ id: 's16', name: 'Docker', icon: '🐳', matched: false },
{ id: 's17', name: 'Kubernetes', icon: '☸️', matched: false },
{ id: 's18', name: 'AWS', icon: '☁️', matched: false },
{ id: 's19', name: 'Figma', icon: '🖌️', matched: false },
{ id: 's20', name: 'Illustrator', icon: '🎨', matched: false },
{ id: 's21', name: 'Photoshop', icon: '🖼️', matched: false },
{ id: 's22', name: 'C++', icon: '💻', matched: false },
{ id: 's23', name: 'Java', icon: '☕', matched: false },
{ id: 's24', name: 'Linux', icon: '🐧', matched: false },
{ id: 's25', name: 'Cybersecurity', icon: '🛡️', matched: false },
{ id: 's26', name: 'Blockchain', icon: '⛓️', matched: false },
{ id: 's27', name: 'Data Analysis', icon: '📊', matched: false },
{ id: 's28', name: 'Machine Learning', icon: '🤖', matched: false }
  ];

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

const stats = useMemo(() => [
    { label: "Active Freelancers", value: 50000, suffix: "+" },
    { label: "Projects Completed", value: 125000, suffix: "+" },
    { label: "Client Satisfaction", value: 98, suffix: "%" },
    { label: "Cities Covered", value: 250, suffix: "+" }
  ], []);

  const quizQuestions: QuizQuestion[] = [
    { id: 1, question: "What's the nature of your project?", options: ['Web Development', 'Graphic Design', 'Content Writing', 'Data Analysis'], type: 'client' },
    { id: 2, question: "What's your ideal budget range?", options: ['₹500-₹1,000', '₹1,000-₹5,000', '₹5,000-₹15,000', '₹15,000+'], type: 'client' },
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
      >
      {/* Animated Cityscape Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 max-w-full left-0 right-0 h-64 bg-linear-to-t from-cyan-100 to-transparent" />
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
      <div className="relative w-full z-10 container mx-auto px-4 -mt-54 pb-16">


      <section className="relative  pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
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
                {/* <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> */}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                Browse Talent 
                <Code className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              </motion.button>
              <Link
                to="/client/finance"
                className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group"
              >
                Secure Payment & Reputation
                {/* <ArrowRight className="w-5 h-5" /> */}
              </Link>
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
      </section>

      {/* --- Stats Section --- */}
<section className="w-full bg-gray-400/50 backdrop-blur-sm border-y border-slate-200/50 py-12">
  <div className="w-full grid grid-cols-2 md:grid-cols-4">
    {stats.map((stat, index) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="text-center flex-1"
      >
        <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-600 to-blue-600 mb-1">
          <AnimatedCounter end={stat.value} suffix={stat.suffix} />
        </div>
        <div className="text-slate-600 font-medium">{stat.label}</div>
      </motion.div>
    ))}
  </div>
</section>
      

      {/* --- Features Section --- */}
      <section className="py-20 mt-10 bg-cyan-50">
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
          <div className="mb-8 p-6 bg-linear-to-r from-cyan-50 to-white rounded-2xl border-2 border-dashed border-cyan-300">
            <p className="text-center text-gray-600 mb-4 font-medium">
              Drag skills below to build your project profile →
            </p>
            <div 
              className="flex flex-wrap justify-center gap-3 min-h-15 p-4 bg-white rounded-xl border-2 border-cyan-200"
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
            <button className="px-8 py-4 bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 transform hover:-translate-y-0.5">
              Try the AI Match Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderVirtualOffice = () => (
    <section className="py-20 bg-linear-to-b from-cyan-50 to-white">
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
                <div className="bg-linear-to-r from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white mb-6">
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
              className="group relative bg-linear-to-br from-white to-cyan-50 rounded-2xl border border-cyan-100 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 cursor-pointer"
            >
              {/* Front: Preview */}
              <div className="p-6">
                <div className="w-16 h-16 bg-linear-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
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
              <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-cyan-200 to-transparent opacity-50" />
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
    <section className="py-20 bg-linear-to-br from-cyan-600 to-cyan-800 text-white">
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
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👩‍💻</div>
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
          <div className="relative bg-linear-to-br from-cyan-50 to-white rounded-3xl p-8 md:p-12 border border-cyan-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-4xl font-bold mb-6 shadow-lg">
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
                      <div className="h-full bg-linear-to-r from-cyan-400 to-cyan-600 rounded-full" style={{ width: '95%' }} />
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
    <section className="py-20 bg-linear-to-b from-white to-cyan-50">
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
                    className="h-full bg-linear-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-700 animate-pulse-slow"
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
                    ? 'bg-linear-to-br from-cyan-50 to-white border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20' 
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
            <button className="px-8 py-4 bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 transform hover:-translate-y-0.5">
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



         <div className="relative h-96 md:h-125 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-cyan-200 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-50/50 to-white">
             {/* Grid lines for map effect  */}
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="absolute h-full w-px bg-cyan-100" style={{ left: `${i * 10}%` }} />
                <div className="absolute w-full h-px bg-cyan-100" style={{ top: `${i * 10}%` }} />
              </React.Fragment>
            ))}
            
             {/* Freelancer Pins  */}
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
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white shadow-lg bg-linear-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg animate-bounce-slow">
                    {pin.avatar ? (
                      <img src={pin.avatar} alt={pin.name} className="w-full h-full rounded-full object-cover" />
                    ) : pin.name[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                
                 {/* Pin Tooltip  */}
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
    <section className="py-20 bg-linear-to-b from-cyan-50 to-white">
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
            {isFreelancer ? (
                <button
                  onClick={() => applyToProject(project.id)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Apply Now
                </button>
                ) : (
                <span className="text-xs text-gray-400">
                   Only freelancers can apply!
                </span>
                )}
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

