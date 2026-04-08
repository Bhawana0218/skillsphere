import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { X, Plus, Edit2, Trash2, ExternalLink, Upload, Image as ImageIcon } from "lucide-react";

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number | string;
  duration: string;
  status: "Open" | "In Progress" | "Completed";
}

interface ClientProfile {
  companyName: string;
  tagline: string;
  description: string;
  website: string;
  logo?: string;
  industry: string;
  companySize: string;
  location: string;
  hiringPreferences: {
    roles: string[];
    projectTypes: string[];
    budgetRange: string;
  };
  projects: Project[];
}

const DEFAULT_PROFILE: ClientProfile = {
  companyName: "",
  tagline: "",
  description: "",
  website: "",
  logo: "",
  industry: "",
  companySize: "1-10",
  location: "",
  hiringPreferences: { roles: [], projectTypes: [], budgetRange: "" },
  projects: [],
};

const normalizeProfile = (data: Partial<ClientProfile> | null | undefined): ClientProfile => ({
  ...DEFAULT_PROFILE,
  ...data,
  hiringPreferences: {
    ...DEFAULT_PROFILE.hiringPreferences,
    ...(data?.hiringPreferences || {}),
    roles: Array.isArray(data?.hiringPreferences?.roles) ? data.hiringPreferences.roles : [],
    projectTypes: Array.isArray(data?.hiringPreferences?.projectTypes)
      ? data.hiringPreferences.projectTypes
      : [],
  },
  projects: Array.isArray(data?.projects) ? data.projects : [],
});

interface ProjectDraft {
  title: string;
  description: string;
  budget: string;
  duration: string;
}

const EMPTY_PROJECT_DRAFT: ProjectDraft = {
  title: "",
  description: "",
  budget: "",
  duration: "",
};

const PROJECT_STATUS_ORDER: Project["status"][] = ["Open", "In Progress", "Completed"];

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const ensureProtocol = (url: string) => {
  if (!url.trim()) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<ClientProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [newRole, setNewRole] = useState("");
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(EMPTY_PROJECT_DRAFT);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectBusyId, setProjectBusyId] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // ───────── UI UTILS ─────────
  const inputBase = "w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none";
  const inputNormal = `${inputBase} border-gray-200 hover:border-cyan-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100/50`;
  const btnBase = "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary = `${btnBase} bg-linear-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-700 hover:to-cyan-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0`;
  const btnSecondary = `${btnBase} border-2 border-gray-200 text-gray-700 hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50`;
  // const btnDanger = `${btnBase} border-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50`;

  const markDirty = () => {
    setIsDirty(true);
    setLastSaved(null);
  };

  const fetchProfile = async () => {
    try {
      const response = await API.get<ClientProfile>("/client/me", {
        validateStatus: (status) => status === 200 || status === 404,
      });

      if (response.status === 404) {
        setProfile(DEFAULT_PROFILE);
      } else {
        setProfile(normalizeProfile(response.data));
        setIsDirty(false);
      }
    } catch (error) {
      toast.error("Failed to load profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    markDirty();
  };

  const handleHiringChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      hiringPreferences: { ...prev.hiringPreferences, [name]: value },
    }));
    markDirty();
  };

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    try {
      setLogoUploading(true);
      const logo = await fileToDataUrl(file);
      setProfile((prev) => ({ ...prev, logo }));
      markDirty();
    } catch (error) {
      console.error(error);
      toast.error("Could not process image");
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  };

  const removeLogo = () => {
    setProfile((prev) => ({ ...prev, logo: "" }));
    markDirty();
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const { data } = await API.post<ClientProfile>("/client", profile);
      setProfile(normalizeProfile(data));
      setIsDirty(false);
      setLastSaved(new Date());
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addRole = (role: string) => {
    const trimmed = role.trim();
    if (!trimmed) return;
    const exists = profile.hiringPreferences.roles.some(
      (entry) => entry.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      toast.error("Role already added");
      return;
    }
    setProfile((prev) => ({
      ...prev,
      hiringPreferences: {
        ...prev.hiringPreferences,
        roles: [...prev.hiringPreferences.roles, trimmed],
      },
    }));
    setNewRole("");
    markDirty();
  };

  const removeRole = (role: string) => {
    setProfile((prev) => ({
      ...prev,
      hiringPreferences: {
        ...prev.hiringPreferences,
        roles: prev.hiringPreferences.roles.filter((entry) => entry !== role),
      },
    }));
    markDirty();
  };

  const handleProjectDraftChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectDraft((prev) => ({ ...prev, [name]: value }));
  };

  const createProject = async () => {
    const title = projectDraft.title.trim();
    const description = projectDraft.description.trim();
    const budget = projectDraft.budget.trim();
    const duration = projectDraft.duration.trim();

    if (!title || !description || !budget) {
      toast.error("Title, description and budget are required");
      return;
    }

    try {
      setProjectBusyId("new");
      const { data } = await API.post<Project[]>("/client/project", {
        title,
        description,
        budget,
        duration,
      });
      setProfile((prev) => ({
        ...prev,
        projects: Array.isArray(data) ? data : prev.projects,
      }));
      setProjectDraft(EMPTY_PROJECT_DRAFT);
      setShowProjectForm(false);
      toast.success("Project created");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not create project");
      console.error(error);
    } finally {
      setProjectBusyId(null);
    }
  };

  const cycleStatus = async (project: Project) => {
    const currentIndex = PROJECT_STATUS_ORDER.indexOf(project.status);
    const nextStatus = PROJECT_STATUS_ORDER[(currentIndex + 1) % PROJECT_STATUS_ORDER.length];
    try {
      setProjectBusyId(project._id);
      const { data } = await API.patch<Project>(`/client/project/${project._id}`, { status: nextStatus });
      setProfile((prev) => ({
        ...prev,
        projects: prev.projects.map((entry) =>
          entry._id === project._id ? { ...entry, status: data.status || nextStatus } : entry
        ),
      }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not update status");
      console.error(error);
    } finally {
      setProjectBusyId(null);
    }
  };

  const editProject = async (project: Project) => {
    const title = window.prompt("Project title", project.title);
    if (title === null) return;
    const description = window.prompt("Project description", project.description);
    if (description === null) return;
    const budget = window.prompt("Project budget", String(project.budget));
    if (budget === null) return;
    const duration = window.prompt("Project duration", project.duration);
    if (duration === null) return;

    try {
      setProjectBusyId(project._id);
      const { data } = await API.patch<Project>(`/client/project/${project._id}`, {
        title,
        description,
        budget,
        duration,
      });
      setProfile((prev) => ({
        ...prev,
        projects: prev.projects.map((entry) =>
          entry._id === project._id ? { ...entry, ...data } : entry
        ),
      }));
      toast.success("Project updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not update project");
      console.error(error);
    } finally {
      setProjectBusyId(null);
    }
  };

  const deleteProject = async (projectId: string) => {
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) return;

    try {
      setProjectBusyId(projectId);
      const { data } = await API.delete<{ projects?: Project[] }>(`/client/project/${projectId}`);
      setProfile((prev) => ({
        ...prev,
        projects: Array.isArray(data?.projects)
          ? data.projects
          : prev.projects.filter((entry) => entry._id !== projectId),
      }));
      toast.success("Project deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not delete project");
      console.error(error);
    } finally {
      setProjectBusyId(null);
    }
  };

  const openCompanyWebsite = () => {
    if (!profile.website.trim()) {
      toast.error("Add website first");
      return;
    }
    window.open(ensureProtocol(profile.website), "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-cyan-50/30 p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-100 rounded" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-10 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-cyan-50/30">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-linear-to-r from-cyan-500 via-cyan-400 to-cyan-500" />
          <div className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Client Profile</h1>
                <p className="text-gray-500 mt-1">Manage your company presence</p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                isDirty 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : lastSaved 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-50 text-gray-500 border-gray-200"
              }`}>
                {isDirty ? "● Unsaved changes" : lastSaved ? `✓ Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Up to date"}
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-cyan-500" />
            Company Info
          </h2>
          
          {/* Logo Section */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="relative group w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden hover:border-cyan-400 hover:bg-cyan-50/50 transition-all duration-200"
            >
              {profile.logo ? (
                <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={24} className="text-gray-400 group-hover:text-cyan-500 transition-colors" />
              )}
              {logoUploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { void handleLogoChange(e); }}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => logoInputRef.current?.click()} className={btnSecondary} disabled={logoUploading}>
                <Upload size={14} /> {logoUploading ? "Uploading..." : "Upload"}
              </button>
              {profile.logo && (
                <button type="button" onClick={removeLogo} className={`${btnSecondary} text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50`}>
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="companyName" placeholder="Company Name *" value={profile.companyName} onChange={handleChange} className={inputNormal} />
            <input name="tagline" placeholder="Tagline" value={profile.tagline} onChange={handleChange} className={inputNormal} />
            <div className="md:col-span-2">
              <textarea name="description" placeholder="Describe your company..." value={profile.description} onChange={handleChange} rows={3} className={`${inputNormal} resize-none`} />
            </div>
            <input name="website" placeholder="Website (https://...)" value={profile.website} onChange={handleChange} className={inputNormal} />
            <input name="industry" placeholder="Industry" value={profile.industry} onChange={handleChange} className={inputNormal} />
            <input name="companySize" placeholder="Company Size" value={profile.companySize} onChange={handleChange} className={inputNormal} />
            <input name="location" placeholder="Location" value={profile.location} onChange={handleChange} className={inputNormal} />
          </div>
        </div>

        {/* Hiring Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-cyan-500" />
            Hiring Preferences
          </h2>
          
          {/* Add Role */}
          <div className="flex gap-2">
            <input
              placeholder="Add role (e.g. React Dev) + Enter"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addRole(newRole); }}
              className={`${inputNormal} flex-1`}
            />
            <button type="button" onClick={() => addRole(newRole)} className={btnPrimary}>
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Role Chips */}
          <div className="flex flex-wrap gap-2 min-h-10">
            {profile.hiringPreferences.roles.length === 0 ? (
              <span className="text-sm text-gray-400 italic">No roles added yet</span>
            ) : (
              profile.hiringPreferences.roles.map((role, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800 border border-cyan-200 hover:bg-cyan-200 transition-colors cursor-default">
                  {role}
                  <button type="button" onClick={() => removeRole(role)} className="hover:bg-white/50 rounded-full p-0.5 transition-colors -mr-1">
                    <X size={13} />
                  </button>
                </span>
              ))
            )}
          </div>

          <input name="budgetRange" placeholder="Budget Range (e.g. $5k-$10k)" value={profile.hiringPreferences.budgetRange} onChange={handleHiringChange} className={inputNormal} />
        </div>

        {/* Projects */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-cyan-500" />
              Projects
            </h2>
            <button type="button" onClick={() => setShowProjectForm((prev) => !prev)} className={btnPrimary}>
              <Plus size={16} /> {showProjectForm ? "Close" : "New Project"}
            </button>
          </div>

          {/* Create Project Form */}
          {showProjectForm && (
            <div className="mb-5 p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50/30 space-y-3 animate-in fade-in slide-in-from-top-2">
              <input name="title" placeholder="Project title *" value={projectDraft.title} onChange={handleProjectDraftChange} className={inputNormal} />
              <textarea name="description" placeholder="Project description *" value={projectDraft.description} onChange={handleProjectDraftChange} rows={2} className={`${inputNormal} resize-none`} />
              <div className="grid grid-cols-2 gap-3">
                <input name="budget" placeholder="Budget *" value={projectDraft.budget} onChange={handleProjectDraftChange} className={inputNormal} />
                <input name="duration" placeholder="Duration" value={projectDraft.duration} onChange={handleProjectDraftChange} className={inputNormal} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { void createProject(); }} disabled={projectBusyId === "new"} className={btnPrimary}>
                  {projectBusyId === "new" ? "Creating..." : "Create Project"}
                </button>
                <button type="button" onClick={() => { setShowProjectForm(false); setProjectDraft(EMPTY_PROJECT_DRAFT); }} className={btnSecondary}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Projects List */}
          {profile.projects.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-cyan-100 flex items-center justify-center">
                <Plus size={24} className="text-cyan-600" />
              </div>
              <p className="text-gray-500">No projects yet — create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.projects.map(p => (
                <div key={p._id} className="group p-4 rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-100/30 transition-all duration-200 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                        <button
                          type="button"
                          onClick={() => { void cycleStatus(p); }}
                          disabled={projectBusyId === p._id}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                            p.status === "Open" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" :
                            p.status === "In Progress" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" :
                            "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                          title="Click to cycle status"
                        >
                          {projectBusyId === p._id ? "..." : p.status}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{p.budget}</span>
                        <span>•</span>
                        <span>{p.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => { void editProject(p); }} disabled={projectBusyId === p._id} className={`p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-cyan-600 transition-colors ${btnBase}`}>
                        <Edit2 size={14} />
                      </button>
                      <button type="button" onClick={() => { void deleteProject(p._id); }} disabled={projectBusyId === p._id} className={`p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors ${btnBase}`}>
                        <Trash2 size={14} />
                      </button>
                      <button type="button" onClick={openCompanyWebsite} className={`p-2 rounded-lg hover:bg-cyan-50 text-gray-500 hover:text-cyan-600 transition-colors ${btnBase}`} title="Open company website">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={saveProfile}
          disabled={saving || !isDirty}
          className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2
            ${saving || !isDirty 
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0"
            }`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : !isDirty && lastSaved ? (
            "✓ Profile Saved"
          ) : (
            "Save Profile Changes"
          )}
        </button>
      </div>
    </div>
  );
}