import React, { useEffect, useState } from 'react';
import { X, FileText, Send, Upload, Users } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [newMilestone, setNewMilestone] = useState<MilestoneForm>({ milestone: '', description: '', deadline: '' });
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [completionPct, setCompletionPct] = useState(0);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(false);

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
        setProgressItems(response.data || []);
        const pct = response.data ? Math.round((response.data.filter((p: ProgressItem) => p.completed).length / response.data.length) * 100) : 0;
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

  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set';

  return (
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm text-gray-900 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-navy-900">Project Details</h3>
            <p className="mt-1 text-sm text-slate-500">Manage documents, freelancer invites, and progress timeline.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 p-2 rounded-full transition-colors">
            <X />
          </button>
        </div>

        <div className="p-6 mt-20 py-10 space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Project</p>
              <h4 className="mt-4 text-xl font-bold text-slate-900">{project.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{project.description}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Budget</span>
                  <span>₹{project.budget.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Category</span>
                  <span>{project.category || 'General'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Attachments</p>
              <p className="mt-4 text-slate-600 text-sm">Add document links for freelancers and keep everything in one place.</p>
              <div className="mt-5 space-y-3">
                {attachments.length ? (
                  attachments.map(att => (
                    <a
                      key={`${att.name}-${att.url}`}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 text-sm hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-cyan-600" />
                        <div>
                          <p className="font-medium text-slate-900">{att.name}</p>
                          <p className="text-xs text-slate-500">{formatDate(att.uploadedAt)}</p>
                        </div>
                      </div>
                      <span className="text-cyan-600 font-medium">Open</span>
                    </a>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No documents attached yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Invited Freelancers</p>
              <p className="mt-4 text-slate-600 text-sm">Keep track of freelancer invitations and their current status.</p>
              <div className="mt-5 space-y-3">
                {invites.length ? (
                  invites.map(inv => (
                    <div key={`${inv.email}-${inv.name}`} className="rounded-2xl border border-slate-200 p-3 text-sm bg-white">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{inv.name}</p>
                          <p className="text-xs text-slate-500">{inv.email}</p>
                        </div>
                        <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-700 bg-slate-100">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No freelancers invited yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Add Document</p>
                  <p className="mt-2 text-sm text-slate-600">Share a document URL with your project team.</p>
                </div>
                <Upload className="w-5 h-5 text-cyan-600" />
              </div>

              <div className="mt-5 space-y-3">
                <label className="block text-sm text-slate-700">Document name</label>
                <input
                  value={attachmentName}
                  onChange={e => setAttachmentName(e.target.value)}
                  placeholder="Requirement brief"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-300"
                />
                <label className="block text-sm text-slate-700">URL</label>
                <input
                  value={attachmentUrl}
                  onChange={e => setAttachmentUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-300"
                />
                <button
                  onClick={handleAddAttachment}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700 transition"
                >
                  <Send className="w-4 h-4" /> Attach Document
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">Invite Freelancer</p>
                  <p className="mt-2 text-sm text-slate-600">Send collaboration requests directly from the dashboard.</p>
                </div>
                <Users className="w-5 h-5 text-blue-600" />
              </div>

              <div className="mt-5 space-y-3">
                <label className="block text-sm text-slate-700">Freelancer name</label>
                <input
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="Riya Sharma"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-300"
                />
                <label className="block text-sm text-slate-700">Freelancer email</label>
                <input
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="riya@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-300"
                />
                <button
                  onClick={handleInviteFreelancer}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  <Send className="w-4 h-4" /> Send Invite
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">PROJECT PROGRESS TRACKER</p>
                <h4 className="mt-2 text-lg font-bold text-slate-900">{completionPct}% Complete</h4>
                <p className="text-sm text-slate-600">{progressItems.filter((p: ProgressItem) => p.completed).length}/{progressItems.length} Milestones Done</p>
              </div>
              <div className="w-full md:w-auto">
                <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-full p-3 border border-cyan-100">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{width: `${completionPct}%`}}></div>
                  </div>
                  <span className="text-sm font-semibold text-cyan-700">{completionPct}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {progressItems.length ? (
                progressItems.map(item => (
                  <div key={item._id || item.milestone} className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-slate-900">{item.milestone}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.description || 'No additional details provided.'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${item.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>{formatDate(item.createdAt)}</span>
                      {item.completed && <span>Done {formatDate(item.completionDate)}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                  No progress updates have been added yet for this project.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => onUpdateStatus(projectId, 'in-progress')}
            className="w-full sm:w-auto rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-700 transition"
          >
            Mark In Progress
          </button>
          <button
            onClick={() => onUpdateStatus(projectId, 'completed')}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 transition"
          >
            Mark Complete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetailsModal;