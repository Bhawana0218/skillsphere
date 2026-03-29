// import React from 'react';
// import { Clock, Trash2, Eye } from 'lucide-react';

// // Status color mapping
// const statusColors: Record<ProjectStatus, string> = {
//   completed: 'bg-emerald-100 text-emerald-700',
//   'in-progress': 'bg-cyan-100 text-cyan-700',
//   pending: 'bg-amber-100 text-amber-700',
// };

// // Allowed project statuses
// type ProjectStatus = 'completed' | 'in-progress' | 'pending';

// // Project type
// interface Project {
//   title: string;
//   description: string;
//   status: ProjectStatus;
//   deadline?: string;
//   budget: number;
// }

// // Props type
// interface ProjectCardProps {
//   project: Project;
//   onView: () => void;
//   onDelete: () => void;
// }

// const ProjectCard: React.FC<ProjectCardProps> = ({ project, onView, onDelete }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
//       <div className="p-6">
//         <div className="flex justify-between items-start mb-4">
//           <span
//             className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
//               statusColors[project.status] || 'bg-gray-100 text-gray-600'
//             }`}
//           >
//             {project.status}
//           </span>
//           <div className="flex gap-2">
//             <button
//               onClick={onView}
//               className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-cyan-600 transition-colors"
//             >
//               <Eye className="w-4 h-4" />
//             </button>
//             <button
//               onClick={onDelete}
//               className="p-2 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         <h3 className="text-lg font-bold text-navy-900 mb-2 line-clamp-1">{project.title}</h3>
//         <p className="text-slate-500 text-sm mb-4 line-clamp-2">{project.description}</p>

//         <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
//           <div className="flex items-center gap-1">
//             <Clock className="w-4 h-4" /> {project.deadline || 'No Deadline'}
//           </div>
//           <div className="font-bold text-navy-900">₹{project.budget}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectCard;











import React from 'react';
import { Trash2, Eye, Calendar, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

// Status color mapping with premium gradients
const statusConfig: Record<ProjectStatus, { bg: string; text: string; dot: string; label: string }> = {
  completed: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    dot: 'bg-emerald-500',
    label: 'Completed'
  },
  'in-progress': { 
    bg: 'bg-cyan-50', 
    text: 'text-cyan-700', 
    dot: 'bg-cyan-500',
    label: 'In Progress'
  },
  pending: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    dot: 'bg-amber-500',
    label: 'Pending'
  },
};

// Allowed project statuses
type ProjectStatus = 'completed' | 'in-progress' | 'pending';

// Project type
interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  status: ProjectStatus;
  deadline?: string;
  budget: number;
  category?: string;
}

// Props type
interface ProjectCardProps {
  project: Project;
  onView: () => void;
  onDelete: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onView, onDelete }) => {
  const status = statusConfig[project.status] || statusConfig.pending;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden"
    >
      {/* Card Header with Status */}
      <div className={`px-6 py-4 border-b border-slate-100 ${status.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status.dot} animate-pulse`} />
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${status.text}`}>
              {status.label}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onView}
              className="p-2.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all duration-200"
              aria-label="View project details"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
              aria-label="Delete project"
              title="Delete Project"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-2 leading-tight">
          {project.title}
        </h3>
        
        {/* Description */}
        <p className="text-slate-600 text-base leading-relaxed line-clamp-3">
          {project.description}
        </p>
        
        {/* Category Tag */}
        {project.category && (
          <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
            {project.category}
          </span>
        )}
      </div>

      {/* Card Footer - Meta Info */}
      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100">
        <div className="flex items-center justify-between">
          {/* Budget */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-100 rounded-xl">
              <IndianRupee className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Budget</p>
              <p className="text-lg font-bold text-slate-900">
                ₹{project.budget.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          
          {/* Deadline */}
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-xs text-slate-500 font-medium">Deadline</p>
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(project.deadline)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Action Bar */}
      <div className="px-6 py-3 bg-linear-to-r from-cyan-500/5 to-blue-500/5 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={onView}
          className="w-full py-2.5 bg-white border-2 border-cyan-200 hover:border-cyan-400 text-cyan-700 hover:text-cyan-800 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
        >
          <Eye className="w-4 h-4" /> View Full Details
        </button>
      </div>
    </motion.div>
  );
};

export default ProjectCard;