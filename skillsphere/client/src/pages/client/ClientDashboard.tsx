

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle,
  Clock,
  FileText, 
  IndianRupee, 
  Plus, 
  RefreshCcw,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

//  Using your imported components
import StatCard from '../../components/client/dashboard/StatCard';
import ProjectCard from '../../components/client/dashboard/ProjectCard';
import NewProjectModal from '../../components/client/dashboard/NewProjectModal';
import ProjectDetailsModal from '../../components/client/dashboard/ProjectDetailsModal';

// Project Status Type
type ProjectStatus = 'completed' | 'in-progress' | 'pending';

// Project Type
interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  budget: number;
  status: ProjectStatus;
  category?: string;
  deadline?: string;
}

// Props for ClientDashboard
interface ClientDashboardProps {
  onBack: () => void;
}

// Form data coming from NewProjectModal
interface ProjectFormData {
  title: string;
  description: string;
  budget: string;
  deadline?: string;
  category?: string;
}

// Define User Type
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const navigate = useNavigate();

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/client/projects');
      setProjects(response.data.projects || response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects. Please check your connection.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  // Create Project
  const handleCreateProject = async (formData: ProjectFormData) => {
    try {
      const newProject: Omit<Project, '_id' | 'id'> = {
        ...formData,
        budget: parseFloat(formData.budget),
        status: 'pending'
      };
      
      await api.post('/client/projects', newProject);
      toast.success('✨ Project posted successfully!');
      setShowForm(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const storedUser = localStorage.getItem("user");
    const user: User | null = storedUser ? JSON.parse(storedUser) : null;
  
     useEffect(() => {
      if (!user) {
        navigate("/");
      }
    }, [user, navigate]);

  // Delete Project
  const handleDeleteProject = async (id?: string) => {
    if (!id || !window.confirm('⚠️ Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await api.delete(`/client/projects/${id}`);
      toast.success('🗑️ Project deleted successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch {
      toast.error('Failed to delete project');
    }
  };

  // Update Project Status
  const handleUpdateStatus = async (id: string, status: ProjectStatus) => {
    try {
      await api.put(`/client/projects/${id}`, { status });
      toast.success(`✅ Project marked as ${status.replace('-', ' ')}`);
      setRefreshTrigger(prev => prev + 1);
      if (selectedProject) setSelectedProject(null);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Calculate Stats
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    budget: projects.reduce((sum, p) => sum + (parseFloat(String(p.budget)) || 0), 0),
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-cyan-50/30 font-sans">
      {/* Premium Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
         

          {/* User Profile Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
             
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Welcome, {user?.name}!
              </h1>
              <p className="text-sm text-slate-500 font-medium">Manage your projects & gigs</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ✅ Stats Section using StatCard component */}
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard 
              title="Total Projects" 
              value={stats.total.toString()} 
              icon={<FileText className="w-7 h-7" />} 
              color="blue"
              trend={`${stats.total} active`}
            />
            <StatCard 
              title="Completed" 
              value={stats.completed.toString()} 
              icon={<CheckCircle className="w-7 h-7" />} 
              color="green"
              trend={stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% done` : '0%'}
            />
            <StatCard 
              title="In Progress" 
              value={stats.inProgress.toString()} 
              icon={<Clock className="w-7 h-7" />} 
              color="cyan"
              trend={stats.inProgress > 0 ? 'Active now' : 'None'}
            />
            <StatCard 
              title="Total Budget" 
              value={`₹${stats.budget.toLocaleString('en-IN')}`} 
              icon={<IndianRupee className="w-7 h-7" />} 
              color="purple"
              isCurrency={true}
              trend={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            />
          </div>
        </section>

        {/* Action Bar */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Your Projects
            </h2>
            {loading && (
              <RefreshCcw className="w-6 h-6 text-cyan-600 animate-spin" aria-label="Loading" />
            )}
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
              {projects.length} total
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="group relative bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-7 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus className="w-6 h-6 relative z-10" /> 
            <span className="relative z-10">Post New Gig</span>
          </motion.button>
        </section>

        {/* ✅ Projects Grid using ProjectCard component */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white h-72 rounded-3xl animate-pulse border border-slate-200/60 shadow-lg shadow-slate-200/30"
              >
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                  <div className="flex gap-2 pt-4">
                    <div className="h-8 bg-slate-200 rounded-xl w-20" />
                    <div className="h-8 bg-slate-200 rounded-xl w-16" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200/60 shadow-lg"
          >
            <div className="w-20 h-20 bg-linear-to-br from-cyan-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-cyan-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Projects Yet</h3>
            <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
              Start by posting your first gig requirement and connect with talented freelancers.
            </p>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)} 
              className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl"
            >
              Create Your First Project
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => (
                <motion.div
                  key={project._id || project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard
                    project={project}
                    onView={() => setSelectedProject(project)}
                    onDelete={() => handleDeleteProject(project._id || project.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ✅ Modals with Premium Backdrop - Using your components */}
      <AnimatePresence>
        {showForm && (
          <NewProjectModal 
            onClose={() => setShowForm(false)} 
            onSubmit={handleCreateProject} 
          />
        )}
        
        {selectedProject && (
          <ProjectDetailsModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;