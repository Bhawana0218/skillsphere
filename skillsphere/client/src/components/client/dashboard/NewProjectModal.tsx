// import React, { useState,type  ChangeEvent, type  FormEvent } from 'react';
// import { X } from 'lucide-react';
// import { motion } from 'framer-motion';

// // Form data type
// interface ProjectFormData {
//   title: string;
//   description: string;
//   budget: string; // Keep as string to match input value
//   deadline?: string;
//   category: string;
// }

// // Props type
// interface NewProjectModalProps {
//   onClose: () => void;
//   onSubmit: (data: ProjectFormData) => void;
// }

// const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onSubmit }) => {
//   const [formData, setFormData] = useState<ProjectFormData>({
//     title: '',
//     description: '',
//     budget: '', 
//     deadline: '',
//     category: 'Development',
//   });

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   const handleChange = (field: keyof ProjectFormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({ ...formData, [field]: e.target.value });
//   };

//   return (
//     <div className="fixed inset-0 text-black bg-navy-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
//       >
//         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
//           <h3 className="text-xl font-bold text-navy-900">Post New Gig</h3>
//           <button onClick={onClose} className="text-slate-400 hover:text-red-500">
//             <X />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
//             <input
//               required
//               type="text"
//               className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
//               placeholder="e.g. React Developer Needed"
//               value={formData.title}
//               onChange={handleChange('title')}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Budget (₹)</label>
//               <input
//                 required
//                 type="number"
//                 className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
//                 placeholder="5000"
//                 value={formData.budget}
//                 onChange={handleChange('budget')}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
//               <input
//                 required
//                 type="date"
//                 className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
//                 value={formData.deadline}
//                 onChange={handleChange('deadline')}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
//             <textarea
//               required
//               rows={4}
//               className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
//               placeholder="Describe requirements..."
//               value={formData.description}
//               onChange={handleChange('description')}
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-cyan-500/30"
//           >
//             Post Project
//           </button>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default NewProjectModal;








import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { X, IndianRupee, Calendar, Tag, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Form data type
interface ProjectFormData {
  title: string;
  description: string;
  budget: string;
  deadline?: string;
  category: string;
}

// Props type
interface NewProjectModalProps {
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    budget: '', 
    deadline: '',
    category: 'Development',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || !formData.budget || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      onSubmit(formData);
      toast.success('✨ Project created successfully!');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProjectFormData) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const categories = [
    'Development',
    'Design',
    'Marketing',
    'Writing',
    'Data Science',
    'Mobile App',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-200/60"
      >
        {/* Modal Header */}
        <div className="relative px-8 py-4 border-b border-slate-100 bg-linear-to-r from-cyan-50 to-blue-50">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-xl transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/25">
              {/* <Sparkles className="w-5 h-5 text-white" /> */}
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Post New Gig</h3>
          </div>
          <p className="text-slate-600 text-base ml-14">Fill in the details to attract top talent</p>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-2">
          
          {/* Project Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 font-semibold text-lg">
              <FileText className="w-5 h-5 text-cyan-600" />
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              className="w-full px-5 py-2 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-200 text-lg text-slate-900 placeholder:text-slate-400 bg-white hover:border-slate-300"
              placeholder="e.g., React Developer for E-commerce Platform"
              value={formData.title}
              onChange={handleChange('title')}
            />
          </div>

          {/* Budget & Deadline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 font-semibold text-lg">
                <IndianRupee className="w-5 h-5 text-cyan-600" />
                Budget (₹) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                className="w-full px-5 py-2 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-200 text-lg text-slate-900 placeholder:text-slate-400 bg-white hover:border-slate-300"
                placeholder="10000"
                value={formData.budget}
                onChange={handleChange('budget')}
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 font-semibold text-lg">
                <Calendar className="w-5 h-5 text-cyan-600" />
                Deadline
              </label>
              <input
                type="date"
                className="w-full px-5 py-2 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-200 text-lg text-slate-900 bg-white hover:border-slate-300"
                value={formData.deadline}
                onChange={handleChange('deadline')}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 font-semibold text-lg">
              <Tag className="w-5 h-5 text-cyan-600" />
              Category
            </label>
            <select
              className="w-full px-5 py-2 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-200 text-lg text-slate-900 bg-white hover:border-slate-300 appearance-none cursor-pointer"
              value={formData.category}
              onChange={handleChange('category')}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 font-semibold text-lg">
              <FileText className="w-5 h-5 text-cyan-600" />
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-200 text-lg text-slate-900 placeholder:text-slate-400 bg-white hover:border-slate-300 resize-none leading-relaxed"
              placeholder="Describe your project requirements, deliverables, timeline expectations, and any specific skills needed..."
              value={formData.description}
              onChange={handleChange('description')}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold text-lg py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting...
              </>
            ) : (
              <>
                {/* <Sparkles className="w-5 h-5" /> */}
                Post Project Now
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default NewProjectModal;