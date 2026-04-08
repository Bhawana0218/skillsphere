import React, { useEffect, useState } from 'react';
import { X, FileText, Send, Upload, Users, Plus, Trash2, CheckCircle, Circle, Calendar, Clock, Link as LinkIcon, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import toast from 'react-hot-toast';

// Allowed project statuses
type ProjectStatus = 'in-progress' | 'completed';

// Attachment type
interface Attachment {
  name: string;
  url: string;
  uploadedAt: string;
}

// Invite type
interface Invite {
  name: string;
  email: string;
  invitedAt: string;
  status: string;
}

// Progress item type
interface ProgressItem {
  _id?: string;
  milestone: string;
  description?: string;
  files?: string[];
  completed: boolean;
  completionDate?: string;
  createdAt?: string;
  logs?: string[];
  deadline?: string;
}

interface MilestoneForm {
  milestone: string;
  description: string;
  deadline: string;
}

// Project type
interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  budget: number;
  category?: string;
  attachments?: Attachment[];
  invitedFreelancers?: Invite[];
}

// Props type
interface ProjectDetailsModalProps {
  project: Project;
  onClose: () => void;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, onClose, onUpdateStatus }) => {
  const projectId = project._id || project.id || '';
  const [attachments, setAttachments] = useState<Attachment[]>(project.attachments || []);
  const [invites, setInvites] = useState<Invite[]>(project.invitedFreelancers || []);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  
  // Uncommented & utilized states
  const [newMilestone, setNewMilestone] = useState<MilestoneForm>({ milestone: '', description: '', deadline: '' });
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  
  const [completionPct, setCompletionPct] = useState(0);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [activeTab, setActiveTab] = useState<'attachments' | 'invites' | 'milestones'>('milestones');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setRole(user.role as 'client' | 'freelancer');
    }
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!projectId) return;
      setLoadingProgress(true);
      try {
        const response = await api.get(`/progress/${projectId}`);
        const items = response.data || [];
        setProgressItems(items);
        const pct = items.length 
          ? Math.round((items.filter((p: ProgressItem) => p.completed).length / items.length) * 100) 
          : 0;
        setCompletionPct(pct);
      } catch (error) {
        console.error('Failed to load progress', error);
        toast.error('Unable to load project progress.');
      } finally {
        setLoadingProgress(false);
      }
    };
    fetchProgress();
  }, [projectId]);

  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set';

  const handleAddAttachment = async () => {
    if (!attachmentName.trim() || !attachmentUrl.trim()) {
      toast.error('Please provide a document name and URL.');
      return;
    }
    try {
      const response = await api.put(`/client/projects/${projectId}/attachments`, {
        name: attachmentName,
        url: attachmentUrl,
      });
      setAttachments(response.data.attachments || []);
      setAttachmentName('');
      setAttachmentUrl('');
      toast.success('Document attached successfully.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to add attachment.');
    }
  };

  const handleDeleteAttachment = async (url: string) => {
    try {
      const response = await api.delete(`/client/projects/${projectId}/attachments`, { data: { url } });
      setAttachments(response.data.attachments || []);
      toast.success('Attachment removed.');
    } catch {
      toast.error('Failed to remove attachment.');
    }
  };

  const handleInviteFreelancer = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Please provide freelancer name and email.');
      return;
    }
    try {
      const response = await api.put(`/client/projects/${projectId}/invite`, {
        name: inviteName,
        email: inviteEmail,
      });
      setInvites(response.data.invitedFreelancers || []);
      setInviteName('');
      setInviteEmail('');
      toast.success('Freelancer invited successfully.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to invite freelancer.');
    }
  };

  const handleDeleteInvite = async (email: string) => {
    try {
      const response = await api.delete(`/client/projects/${projectId}/invite`, { data: { email } });
      setInvites(response.data.invitedFreelancers || []);
      toast.success('Invite withdrawn.');
    } catch {
      toast.error('Failed to withdraw invite.');
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.milestone.trim() || !newMilestone.deadline) {
      toast.error('Milestone title and deadline are required.');
      return;
    }
    try {
      const response = await api.post(`/progress/${projectId}`, {
        ...newMilestone,
        completed: false,
      });
      setProgressItems(prev => [...prev, response.data]);
      setNewMilestone({ milestone: '', description: '', deadline: '' });
      setIsAddingMilestone(false);
      toast.success('Milestone added.');
      // Recalculate progress
      const items = [...progressItems, response.data];
      const pct = Math.round((items.filter(p => p.completed).length / items.length) * 100);
      setCompletionPct(pct);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add milestone.');
    }
  };

  const handleToggleComplete = async (item: ProgressItem) => {
    try {
      const response = await api.patch(`/progress/${projectId}/${item._id}`, {
        completed: !item.completed,
        completionDate: !item.completed ? new Date().toISOString() : undefined,
      });
      setProgressItems(prev => prev.map(p => p._id === item._id ? response.data : p));
      const updated = progressItems.map(p => p._id === item._id ? { ...p, completed: !p.completed } : p);
      const pct = Math.round((updated.filter(p => p.completed).length / updated.length) * 100);
      setCompletionPct(pct);
      toast.success(item.completed ? 'Marked as pending' : 'Milestone completed! 🎉');
    } catch {
      toast.error('Failed to update milestone.');
    }
  };

  const handleDeleteMilestone = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/progress/${projectId}/${id}`);
      setProgressItems(prev => prev.filter(p => p._id !== id));
      const updated = progressItems.filter(p => p._id !== id);
      const pct = updated.length 
        ? Math.round((updated.filter(p => p.completed).length / updated.length) * 100) 
        : 0;
      setCompletionPct(pct);
      toast.success('Milestone deleted.');
    } catch {
      toast.error('Failed to delete milestone.');
    }
  };

  const handleFileUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      uploadFiles.forEach(file => formData.append('files', file));
      const response = await api.post(`/client/projects/${projectId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachments(prev => [...prev, ...response.data.attachments]);
      setUploadFiles([]);
      toast.success(`${uploadFiles.length} file(s) uploaded.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="fixed inset-0 bg-linear-to-br from-cyan-50/80 to-white/90 backdrop-blur-md text-gray-900 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl shadow-cyan-100/50 overflow-hidden border border-cyan-100"
      >
        {/* Header */}
        <div className="px-5 sm:px-7 pt-5 pb-4 border-b border-cyan-100/70 bg-linear-to-r from-white to-cyan-50/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-cyan-700 to-cyan-500 bg-clip-text text-transparent">
                  {project.title}
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-200">
                  {project.category || 'General'}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">{project.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="font-semibold text-cyan-600">₹{project.budget.toLocaleString('en-IN')}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">Budget</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    completionPct === 100 ? 'bg-emerald-100 text-emerald-700' : 
                    completionPct > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {completionPct}% Complete
                  </span>
                </div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose} 
              className="p-2.5 rounded-2xl bg-white border border-cyan-200 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300 transition-all shadow-sm"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 sm:px-7 py-3 bg-linear-to-r from-cyan-50 to-white border-b border-cyan-100/50">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full bg-linear-to-r from-cyan-400 to-cyan-600 rounded-full"
              />
            </div>
            <span className="text-sm font-bold text-cyan-700 min-w-13 text-right">{completionPct}%</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 sm:px-7 pt-4">
          <div className="flex gap-1.5 p-1 bg-slate-100/60 rounded-2xl w-fit">
            {(['milestones', 'attachments', 'invites'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-white text-cyan-700 shadow-sm border border-cyan-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'milestones' && (
              <motion.div
                key="milestones"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-4"
              >
                {/* Add Milestone Form */}
                <AnimatePresence>
                  {isAddingMilestone && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl border border-cyan-200 bg-linear-to-br from-cyan-50/50 to-white p-4 sm:p-5"
                    >
                      <p className="text-sm font-semibold text-cyan-700 mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add New Milestone
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          value={newMilestone.milestone}
                          onChange={e => setNewMilestone(prev => ({ ...prev, milestone: e.target.value }))}
                          placeholder="Milestone title *"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition"
                        />
                        <input
                          type="date"
                          value={newMilestone.deadline}
                          onChange={e => setNewMilestone(prev => ({ ...prev, deadline: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition"
                        />
                      </div>
                      <textarea
                        value={newMilestone.description}
                        onChange={e => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description (optional)"
                        rows={2}
                        className="w-full mt-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition resize-none"
                      />
                      <div className="flex gap-2 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleAddMilestone}
                          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition shadow-md shadow-cyan-200/50"
                        >
                          Add Milestone
                        </motion.button>
                        <button
                          onClick={() => { setIsAddingMilestone(false); setNewMilestone({ milestone: '', description: '', deadline: '' }); }}
                          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Milestones List */}
                {loadingProgress ? (
                  <div className="text-center py-10 text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent" />
                    <p className="mt-3 text-sm">Loading progress...</p>
                  </div>
                ) : progressItems.length ? (
                  <motion.div variants={containerVariants} className="space-y-3">
                    {progressItems.map((item, _) => (
                      <motion.div
                        key={item._id || item.milestone}
                        variants={itemVariants}
                        whileHover={{ y: -2, boxShadow: "0 8px 25px -5px rgba(6, 182, 212, 0.15)" }}
                        className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                          item.completed 
                            ? 'bg-linear-to-br from-emerald-50/40 to-white border-emerald-200/70' 
                            : 'bg-white border-slate-200 hover:border-cyan-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleToggleComplete(item)}
                                className={`p-1 rounded-full transition ${
                                  item.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-cyan-500'
                                }`}
                              >
                                {item.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </motion.button>
                              <h4 className={`font-semibold ${item.completed ? 'text-slate-700 line-through' : 'text-slate-900'}`}>
                                {item.milestone}
                              </h4>
                              {item.deadline && (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Due {formatDate(item.deadline)}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="mt-2 text-sm text-slate-500 pl-7">{item.description}</p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-3 pl-7 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Created {formatDate(item.createdAt)}
                              </span>
                              {item.completed && item.completionDate && (
                                <span className="flex items-center gap-1 text-emerald-600">
                                  ✓ Completed {formatDate(item.completionDate)}
                                </span>
                              )}
                              {item.files?.length ? (
                                <span className="flex items-center gap-1 text-cyan-600">
                                  <Paperclip className="w-3.5 h-3.5" />
                                  {item.files.length} file(s)
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteMilestone(item._id)}
                            className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                            aria-label="Delete milestone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-12 rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50/30">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 mb-4">
                      <Plus className="w-7 h-7" />
                    </div>
                    <p className="text-slate-600 font-medium">No milestones yet</p>
                    <p className="text-sm text-slate-400 mt-1">Start tracking your project progress</p>
                  </div>
                )}

                {/* Add Button */}
                {!isAddingMilestone && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setIsAddingMilestone(true)}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-cyan-300 text-cyan-600 font-medium text-sm hover:bg-cyan-50 hover:border-cyan-400 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Milestone
                  </motion.button>
                )}
              </motion.div>
            )}

            {activeTab === 'attachments' && (
              <motion.div
                key="attachments"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-5"
              >
                {/* Upload Section */}
                <div className="rounded-2xl border border-cyan-200 bg-linear-to-br from-cyan-50/40 to-white p-5">
                  <p className="text-sm font-semibold text-cyan-700 mb-3 flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload Files
                  </p>
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-cyan-300 rounded-xl bg-white hover:bg-cyan-50/50 hover:border-cyan-400 cursor-pointer transition group">
                      <div className="flex flex-col items-center justify-center pt-4 pb-3">
                        <Upload className="w-6 h-6 text-cyan-500 group-hover:scale-110 transition" />
                        <p className="mt-2 text-xs text-slate-500">
                          <span className="font-semibold text-cyan-600">Click to upload</span> or drag and drop
                        </p>
                      </div>
                      <input type="file" className="hidden" multiple onChange={handleFileChange} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                    </label>
                    
                    {uploadFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="w-4 h-4 text-cyan-500 shrink-0" />
                              <span className="text-sm text-slate-700 truncate">{file.name}</span>
                              <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button onClick={() => removeUploadFile(idx)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handleFileUpload}
                          disabled={isUploading}
                          className="w-full py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" /> Upload {uploadFiles.length} File(s)
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Link Section */}
                <div className="rounded-2xl border border-cyan-200 bg-white p-5">
                  <p className="text-sm font-semibold text-cyan-700 mb-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" /> Add Document Link
                  </p>
                  <div className="space-y-3">
                    <input
                      value={attachmentName}
                      onChange={e => setAttachmentName(e.target.value)}
                      placeholder="Document name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition"
                    />
                    <input
                      value={attachmentUrl}
                      onChange={e => setAttachmentUrl(e.target.value)}
                      placeholder="https://example.com/document.pdf"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition"
                    />
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleAddAttachment}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Attach Link
                    </motion.button>
                  </div>
                </div>

                {/* Attachments List */}
                <div className="space-y-2.5">
                  {attachments.length ? (
                    attachments.map((att, idx) => (
                      <motion.div
                        key={`${att.name}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-cyan-300 hover:shadow-sm transition group"
                      >
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 flex-1 min-w-0"
                        >
                          <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 group-hover:bg-cyan-200 transition">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{att.name}</p>
                            <p className="text-xs text-slate-400">{formatDate(att.uploadedAt)}</p>
                          </div>
                        </a>
                        <div className="flex items-center gap-1">
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                            aria-label="Open"
                          >
                            <Send className="w-4 h-4 rotate-90" />
                          </a>
                          <button
                            onClick={() => handleDeleteAttachment(att.url)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50/30">
                      <Paperclip className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No attachments yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'invites' && (
              <motion.div
                key="invites"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-5"
              >
                {/* Invite Form */}
                <div className="rounded-2xl border border-cyan-200 bg-linear-to-br from-cyan-50/40 to-white p-5">
                  <p className="text-sm font-semibold text-cyan-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Invite Freelancer
                  </p>
                  <div className="space-y-3">
                    <input
                      value={inviteName}
                      onChange={e => setInviteName(e.target.value)}
                      placeholder="Freelancer name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition"
                    />
                    <input
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      type="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition"
                    />
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleInviteFreelancer}
                      className="w-full py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-cyan-700 transition flex items-center justify-center gap-2 shadow-md shadow-cyan-200/40"
                    >
                      <Send className="w-4 h-4" /> Send Invitation
                    </motion.button>
                  </div>
                </div>

                {/* Invites List */}
                <div className="space-y-2.5">
                  {invites.length ? (
                    invites.map((inv, idx) => (
                      <motion.div
                        key={`${inv.email}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-cyan-300 transition group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-700 font-semibold text-sm">
                            {inv.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{inv.name}</p>
                            <p className="text-xs text-slate-500 truncate">{inv.email}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Invited {formatDate(inv.invitedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                            inv.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {inv.status}
                          </span>
                          <button
                            onClick={() => handleDeleteInvite(inv.email)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                            aria-label="Withdraw invite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50/30">
                      <Users className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No freelancers invited yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-7 py-4 bg-linear-to-r from-slate-50 to-cyan-50/40 border-t border-cyan-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Role: <span className="font-medium text-slate-600 capitalize">{role}</span>
          </p>
          <div className="flex gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUpdateStatus(projectId, 'in-progress')}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition shadow-md shadow-cyan-200/50"
            >
              Mark In Progress
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUpdateStatus(projectId, 'completed')}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-cyan-300 hover:bg-cyan-50 transition"
            >
              Mark Complete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetailsModal;