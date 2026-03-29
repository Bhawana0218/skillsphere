import React from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Allowed project statuses
type ProjectStatus = 'in-progress' | 'completed';

// Project type
interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  budget: number;
  category?: string;
}

// Props type
interface ProjectDetailsModalProps {
  project: Project;
  onClose: () => void;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, onClose, onUpdateStatus }) => {
  const projectId = project._id || project.id || '';

  return (
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm text-gray-900 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-navy-900">Project Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            <X />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-2xl font-bold text-navy-900">{project.title}</h4>
            <div className="flex gap-3 mt-2">
              <span className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium">
                {project.category || 'General'}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                ₹{project.budget}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl">
            <h5 className="font-bold text-slate-700 mb-2">Description</h5>
            <p className="text-slate-600 leading-relaxed">{project.description}</p>
          </div>

          <div>
            <h5 className="font-bold text-slate-700 mb-3">Update Status</h5>
            <div className="flex gap-3">
              <button
                onClick={() => onUpdateStatus(projectId, 'in-progress')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50 transition-colors"
              >
                <Clock className="w-4 h-4" /> In Progress
              </button>
              <button
                onClick={() => onUpdateStatus(projectId, 'completed')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Complete
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetailsModal;