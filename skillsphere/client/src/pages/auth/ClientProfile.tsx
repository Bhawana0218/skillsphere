// import { useState, useEffect, useCallback } from "react";
// import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
// import API from "../../services/api";
// import { Link } from "react-router-dom";
// import toast from "react-hot-toast";

// // Skill Type
// interface Skill {
//   name: string;
//   level: "Beginner" | "Intermediate" | "Expert";
// }

// // Profile Type
// interface ProfileType {
//   bio: string;
//   skills: Skill[];
//   hourlyRate: string;
//   experience: ExperienceItem[];
// }

// // Experience Item Type
// interface ExperienceItem {
//   id: string;
//   title: string;
//   company: string;
//   duration: string;
// }

// function Profile() {
//   const [profile, setProfile] = useState<ProfileType>({
//     bio: "",
//     skills: [],
//     hourlyRate: "",
//     experience: [],
//   });

//   // Skill input states
//   const [skillName, setSkillName] = useState("");
//   const [skillLevel, setSkillLevel] = useState<Skill["level"]>("Beginner");
  
//   // Experience states
//   const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>([]);
//   const [newExperience, setNewExperience] = useState<Partial<ExperienceItem>>({});
  
//   // UI States
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState<"overview" | "skills" | "experience">("overview");
//   const [charCount, setCharCount] = useState(0);
//   const MAX_BIO_LENGTH = 500;

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   useEffect(() => {
//     setCharCount(profile.bio.length);
//   }, [profile.bio]);

//   // Fetch Profile
//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const { data } = await API.get<ProfileType>("/profile/me");
//       if (data) {
//         setProfile(data);
//         // Convert experience strings to objects if needed
//         if (Array.isArray(data.experience)) {
//           setExperienceItems(
//           data.experience.map((exp: any, idx: number) => ({
//           id: `exp-${idx}`,
//           title: exp.title || "",
//           company: exp.company || "",
//           duration: exp.duration || "",
//     }))
//   );
// }
//       }
//     } catch (error) {
//       console.error("Failed to fetch profile:", error);
//       toast.error("Could not load your profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Submit Handler
//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
    
//     // Validation
//     if (!profile.bio.trim()) {
//       toast.error("Please add a brief bio");
//       return;
//     }
    
//     if (!profile.hourlyRate || isNaN(Number(profile.hourlyRate))) {
//       toast.error("Please enter a valid hourly rate");
//       return;
//     }

//     try {
//       setSaving(true);
      
//       // Format experience for backend
//       const profileToSubmit = {
//         ...profile,
//         experience: experienceItems.map(exp => ({
//          title: exp.title,
//          company: exp.company,
//          duration: exp.duration,
//       })),
//       };
      
//       await API.post("/profile", profileToSubmit);
//       toast.success("✨ Profile updated successfully!");
//     } catch (error: any) {
//       console.error("Save error:", error);
//       toast.error(error.response?.data?.message || "Failed to save profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Input Handler
//   const handleChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setProfile(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Add Skill with Enter key support
//   const addSkill = useCallback(() => {
//     if (!skillName.trim()) {
//       toast.error("Please enter a skill name");
//       return;
//     }

//     if (profile.skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
//       toast.error("This skill already exists");
//       return;
//     }

//     setProfile(prev => ({
//       ...prev,
//       skills: [
//         ...prev.skills,
//         { name: skillName.trim(), level: skillLevel },
//       ],
//     }));

//     setSkillName("");
//     setSkillLevel("Beginner");
//     toast.success("Skill added!");
//   }, [skillName, skillLevel, profile.skills]);

//   const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       addSkill();
//     }
//   };

//   // Remove Skill with animation trigger
//   const removeSkill = (index: number) => {
//     setProfile(prev => {
//       const updatedSkills = prev.skills.filter((_, i) => i !== index);
//       return { ...prev, skills: updatedSkills };
//     });
//     toast("Skill removed", { icon: "🗑️" });
//   };

//   // Experience Management
//   const addExperience = () => {
//     if (!newExperience.title?.trim()) {
//       toast.error("Please enter a job title");
//       return;
//     }

//     const newItem: ExperienceItem = {
//       id: `exp-${Date.now()}`,
//       title: newExperience.title || "",
//       company: newExperience.company || "",
//       duration: newExperience.duration || "",
//     };

//     setExperienceItems(prev => [...prev, newItem]);
//     setNewExperience({});
//     toast.success("Experience added!");
//   };

//   const removeExperience = (id: string) => {
//     setExperienceItems(prev => prev.filter(item => item.id !== id));
//     toast("Experience removed", { icon: "🗑️" });
//   };

//   // Get level badge color
//   const getLevelColor = (level: Skill["level"]) => {
//     switch (level) {
//       case "Expert": return "from-emerald-500 to-teal-500";
//       case "Intermediate": return "from-cyan-500 to-cyan-600";
//       case "Beginner": return "from-gray-600 to-gray-600";
//       default: return "from-gray-400 to-gray-500";
//     }
//   };

//   // Loading Skeleton
//   const renderSkeleton = () => (
//     <div className="animate-pulse space-y-6">
//       <div className="h-8 bg-gray-200 rounded w-1/3" />
//       <div className="grid gap-4 md:grid-cols-2">
//         {[1, 2].map(i => (
//           <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
//         ))}
//       </div>
//       <div className="space-y-4">
//         <div className="h-24 bg-gray-200 rounded-xl" />
//         <div className="h-12 bg-gray-200 rounded-xl" />
//         <div className="h-10 bg-gray-200 rounded-xl w-32" />
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-cyan-50/20">
//         <div className="max-w-5xl mx-auto px-4 py-8">
//           {renderSkeleton()}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-cyan-50/20">
//       {/* Sticky Header */}
//       <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
//         <div className="max-w-5xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
//                 {profile.bio?.charAt(0).toUpperCase() || "👤"}
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
//                 <p className="text-sm text-gray-500">Craft your professional presence</p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2">
//               <button
//                 type="submit"
//                 form="profile-form"
//                 disabled={saving}
//                 className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl transition-all duration-200 shadow-md ${
//                   saving
//                     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                     : "bg-linear-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95"
//                 }`}
//               >
//                 {saving ? (
//                   <>
//                     <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                     </svg>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     Save Changes
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-5xl mx-auto px-4 py-8">
//         <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
          
//           {/* Quick Stats Cards */}
//           <div className="grid gap-4 md:grid-cols-3">
//             <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-cyan-200 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
//                   <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-gray-900">{profile.skills.length}</p>
//                   <p className="text-sm text-gray-500">Skills Added</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-cyan-200 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
//                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {profile.hourlyRate ? `₹${profile.hourlyRate}/hr` : "—"}
//                   </p>
//                   <p className="text-sm text-gray-500">Hourly Rate</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-cyan-200 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
//                   <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-gray-900">{experienceItems.length}</p>
//                   <p className="text-sm text-gray-500">Experiences</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Tab Navigation */}
//           <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
//             {[
//               { id: "overview", label: "Overview", icon: "📋" },
//               { id: "skills", label: "Skills", icon: "⚡" },
//               { id: "experience", label: "Experience", icon: "💼" },
//             ].map(tab => (
//               <button
//                 key={tab.id}
//                 type="button"
//                 onClick={() => setActiveTab(tab.id as typeof activeTab)}
//                 className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
//                   activeTab === tab.id
//                     ? "bg-white text-cyan-600 shadow-sm"
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 <span>{tab.icon}</span>
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           {/* Tab Content */}
//           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            
//             {/* Overview Tab */}
//             {activeTab === "overview" && (
//               <div className="p-6 space-y-6">
//                 {/* Bio Section */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Professional Bio
//                   </label>
//                   <textarea
//                     name="bio"
//                     placeholder="Tell clients about your expertise, experience, and what makes you unique..."
//                     className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all duration-200 resize-none text-gray-700 placeholder-gray-400"
//                     value={profile.bio}
//                     onChange={(e) => {
//                       if (e.target.value.length <= MAX_BIO_LENGTH) {
//                         handleChange(e);
//                       }
//                     }}
//                     rows={5}
//                   />
//                   <div className="flex justify-between items-center mt-2">
//                     <p className="text-xs text-gray-400">
//                       Share your story to attract the right clients
//                     </p>
//                     <span className={`text-xs font-medium ${
//                       charCount > MAX_BIO_LENGTH * 0.9 ? "text-orange-500" : "text-gray-400"
//                     }`}>
//                       {charCount}/{MAX_BIO_LENGTH}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Hourly Rate Section */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Hourly Rate (₹)
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
//                     <input
//                       type="number"
//                       name="hourlyRate"
//                       placeholder="e.g., 1500"
//                       min="0"
//                       className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all duration-200 text-gray-700 placeholder-gray-400"
//                       value={profile.hourlyRate}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400 mt-2">
//                     Set your expected rate. You can negotiate per project.
//                   </p>
//                 </div>

//                 {/* Profile Completion */}
//                 <div className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 border border-cyan-100">
//                   <div className="flex items-center justify-between mb-3">
//                     <span className="text-sm font-semibold text-gray-700">Profile Strength</span>
//                     <span className="text-sm font-bold text-cyan-600">
//                       {Math.round((
//                         (profile.bio ? 25 : 0) +
//                         (profile.hourlyRate ? 25 : 0) +
//                         (profile.skills.length > 0 ? 25 : 0) +
//                         (experienceItems.length > 0 ? 25 : 0)
//                       ) * 100) / 100}%
//                     </span>
//                   </div>
//                   <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                     <div 
//                       className="h-full bg-linear-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
//                       style={{ 
//                         width: `${(
//                           (profile.bio ? 25 : 0) +
//                           (profile.hourlyRate ? 25 : 0) +
//                           (profile.skills.length > 0 ? 25 : 0) +
//                           (experienceItems.length > 0 ? 25 : 0)
//                         )}%` 
//                       }}
//                     />
//                   </div>
//                   <p className="text-xs text-gray-500 mt-3">
//                     Complete all sections to increase your visibility to clients
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Skills Tab */}
//             {activeTab === "skills" && (
//               <div className="p-6 space-y-6">
//                 {/* Add Skill Form */}
//                 <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     Add New Skill
//                   </label>
//                   <div className="flex flex-col sm:flex-row gap-3">
//                     <input
//                       type="text"
//                       placeholder="e.g., React, UI Design, Python..."
//                       className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all duration-200 text-gray-700 placeholder-gray-400"
//                       value={skillName}
//                       onChange={(e) => setSkillName(e.target.value)}
//                       onKeyDown={handleSkillKeyDown}
//                     />
//                     <select
//                       className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all duration-200 text-gray-700"
//                       value={skillLevel}
//                       onChange={(e) => setSkillLevel(e.target.value as Skill["level"])}
//                     >
//                       <option value="Beginner">Beginner</option>
//                       <option value="Intermediate">Intermediate</option>
//                       <option value="Expert">Expert</option>
//                     </select>
//                     <button
//                       type="button"
//                       onClick={addSkill}
//                       className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
//                     >
//                       Add Skill
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-400 mt-2">
//                     Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Enter</kbd> to quickly add skills
//                   </p>
//                 </div>

//                 {/* Skills Grid */}
//                 {profile.skills.length > 0 ? (
//                   <div>
//                     <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Skills</h3>
//                     <div className="flex flex-wrap gap-2">
//                       {profile.skills.map((skill, index) => (
//                         <div
//                           key={`${skill.name}-${index}`}
//                           className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-cyan-300 hover:shadow-md transition-all duration-200"
//                         >
//                           <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-linear-to-r ${getLevelColor(skill.level)}`}>
//                             {skill.level}
//                           </span>
//                           <span className="font-medium text-gray-700">{skill.name}</span>
//                           <button
//                             type="button"
//                             onClick={() => removeSkill(index)}
//                             className="ml-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
//                             aria-label={`Remove ${skill.name}`}
//                           >
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                             </svg>
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-12">
//                     <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-50 mb-4">
//                       <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                       </svg>
//                     </div>
//                     <p className="text-gray-500">No skills added yet</p>
//                     <p className="text-sm text-gray-400 mt-1">Add your first skill to showcase your expertise</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Experience Tab */}
//             {activeTab === "experience" && (
//               <div className="p-6 space-y-6">
//                 {/* Add Experience Form */}
//                 <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     Add Work Experience
//                   </label>
//                   <div className="grid sm:grid-cols-2 gap-3 mb-3">
//                     <input
//                       type="text"
//                       placeholder="Job Title *"
//                       className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all duration-200 text-gray-700 placeholder-gray-400"
//                       value={newExperience.title || ""}
//                       onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
//                     />
//                     <input
//                       type="text"
//                       placeholder="Company"
//                       className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all duration-200 text-gray-700 placeholder-gray-400"
//                       value={newExperience.company || ""}
//                       onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
//                     />
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <input
//                       type="text"
//                       placeholder="Duration (e.g., 2022-Present)"
//                       className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all duration-200 text-gray-700 placeholder-gray-400"
//                       value={newExperience.duration || ""}
//                       onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
//                     />
//                     <button
//                       type="button"
//                       onClick={addExperience}
//                       className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
//                     >
//                       Add
//                     </button>
//                   </div>
//                 </div>

//                 {/* Experience List */}
//                 {experienceItems.length > 0 ? (
//                   <div className="space-y-3">
//                     {experienceItems.map((exp) => (
//                       <div
//                         key={exp.id}
//                         className="group flex items-start justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-cyan-200 hover:shadow-md transition-all duration-200"
//                       >
//                         <div className="flex items-start gap-4">
//                           <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center shrink-0">
//                             <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                             </svg>
//                           </div>
//                           <div>
//                             <h4 className="font-semibold text-gray-900">{exp.title}</h4>
//                             {exp.company && (
//                               <p className="text-sm text-gray-500">at {exp.company}</p>
//                             )}
//                             {exp.duration && (
//                               <p className="text-xs text-gray-400 mt-1">{exp.duration}</p>
//                             )}
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => removeExperience(exp.id)}
//                           className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
//                           aria-label="Remove experience"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-12">
//                     <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
//                       <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                       </svg>
//                     </div>
//                     <p className="text-gray-500">No experience added yet</p>
//                     <p className="text-sm text-gray-400 mt-1">Share your work history to build credibility</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Security Tips Card */}
//           <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
//             <div className="flex items-start gap-3">
//               <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
//                 <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <div>
//                 <h4 className="font-semibold text-gray-800">Pro Tip</h4>
//                 <p className="text-sm text-gray-600 mt-1">
//                   A complete profile with skills and experience gets <span className="font-semibold text-amber-700">3x more invitations</span> from clients. 
//                   <Link to="/settings/security" className="text-cyan-600 hover:text-cyan-700 font-medium ml-1">
//                     Enable 2FA →
//                   </Link>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </form>
//       </main>

//       {/* Mobile Save Bar */}
//       <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 sm:hidden z-30">
//         <button
//           type="submit"
//           form="profile-form"
//           disabled={saving}
//           className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-2xl transition-all duration-200 shadow-lg ${
//             saving
//               ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//               : "bg-linear-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 active:scale-98"
//           }`}
//         >
//           {saving ? (
//             <>
//               <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//               </svg>
//               Saving...
//             </>
//           ) : (
//             <>
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//               Save Changes
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Profile;






// import { useState, useEffect } from "react";
// import API from "../../services/api";
// import toast from "react-hot-toast";

// interface Project {
//   id: string;
//   title: string;
//   description: string;
//   budget: string;
//   duration: string;
//   status: "Open" | "In Progress" | "Completed";
// }

// interface ClientProfile {
//   companyName: string;
//   tagline: string;
//   description: string;
//   website: string;
//   industry: string;
//   companySize: string;
//   location: string;
//   hiringPreferences: {
//     roles: string[];
//     projectTypes: string[];
//     budgetRange: string;
//   };
//   projects: Project[];
// }

// export default function ClientProfilePage() {
//   const [profile, setProfile] = useState<ClientProfile>({
//     companyName: "",
//     tagline: "",
//     description: "",
//     website: "",
//     industry: "",
//     companySize: "1-10",
//     location: "",
//     hiringPreferences: {
//       roles: [],
//       projectTypes: [],
//       budgetRange: "",
//     },
//     projects: [],
//   });

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       // const { data } = await API.get("/client/profile");
//       const { data } = await API.get<ClientProfile>("/client/me");
//       setProfile(data);
//     } catch {
//       toast.error("Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: any) => {
//     const { name, value } = e.target;
//     setProfile(prev => ({ ...prev, [name]: value }));
//   };

//   const saveProfile = async () => {
//   try {
//     setSaving(true);
//     // Tell Axios the expected response type
//     const { data } = await API.post<ClientProfile>("/client", profile);
//     setProfile(data);
//     toast.success("Profile updated Successfully!");
//   } catch (error) {
//     toast.error("Failed to save");
//   } finally {
//     setSaving(false);
//   }
// };

//   const addRole = (role: string) => {
//     if (!role.trim()) return;
//     setProfile(prev => ({
//       ...prev,
//       hiringPreferences: {
//         ...prev.hiringPreferences,
//         roles: [...prev.hiringPreferences.roles, role],
//       },
//     }));
//   };

//   if (loading) return <div className="p-10">Loading...</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-5xl mx-auto space-y-6">

//         {/* HEADER */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border">
//           <h1 className="text-2xl font-bold">🏢 Client Profile</h1>
//           <p className="text-gray-500">Manage your company presence</p>
//         </div>

//         {/* COMPANY INFO */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
//           <h2 className="font-semibold text-lg">Company Info</h2>

//           <input
//             name="companyName"
//             placeholder="Company Name"
//             value={profile.companyName}
//             onChange={handleChange}
//             className="input"
//           />

//           <input
//             name="tagline"
//             placeholder="Tagline (e.g. Building the future of AI)"
//             value={profile.tagline}
//             onChange={handleChange}
//             className="input"
//           />

//           <textarea
//             name="description"
//             placeholder="Describe your company..."
//             value={profile.description}
//             onChange={handleChange}
//             className="input"
//           />

//           <input
//             name="website"
//             placeholder="Website"
//             value={profile.website}
//             onChange={handleChange}
//             className="input"
//           />
//         </div>

//         {/* HIRING SECTION */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
//           <h2 className="font-semibold text-lg">Hiring Preferences</h2>

//           <input
//             placeholder="Add role (e.g. React Dev)"
//             onKeyDown={(e: any) => {
//               if (e.key === "Enter") {
//                 addRole(e.target.value);
//                 e.target.value = "";
//               }
//             }}
//             className="input"
//           />

//           <div className="flex gap-2 flex-wrap">
//             {profile.hiringPreferences.roles.map((role, i) => (
//               <span key={i} className="tag">
//                 {role}
//               </span>
//             ))}
//           </div>

//           <input
//             name="budgetRange"
//             placeholder="Budget Range"
//             value={profile.hiringPreferences.budgetRange}
//             onChange={(e) =>
//               setProfile(prev => ({
//                 ...prev,
//                 hiringPreferences: {
//                   ...prev.hiringPreferences,
//                   budgetRange: e.target.value,
//                 },
//               }))
//             }
//             className="input"
//           />
//         </div>

//         {/* PROJECTS */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border">
//           <h2 className="font-semibold text-lg mb-4">Projects</h2>

//           {profile.projects.length === 0 ? (
//             <p className="text-gray-400">No projects yet</p>
//           ) : (
//             <div className="space-y-3">
//               {profile.projects.map(p => (
//                 <div key={p.id} className="border p-4 rounded-xl">
//                   <h3 className="font-semibold">{p.title}</h3>
//                   <p className="text-sm text-gray-500">{p.description}</p>
//                   <div className="text-xs text-gray-400 mt-2">
//                     {p.budget} • {p.duration} • {p.status}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* SAVE */}
//         <button
//           onClick={saveProfile}
//           disabled={saving}
//           className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
//         >
//           {saving ? "Saving..." : "Save Profile"}
//         </button>
//       </div>
//     </div>
//   );
// }





















import { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

interface Project {
  _id: string; // MongoDB _id
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

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<ClientProfile>(DEFAULT_PROFILE);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  //  Fix: GET does not take profile as argument
  const fetchProfile = async () => {
    try {
      const response = await API.get<ClientProfile>("/client/me", {
        validateStatus: (status) => status === 200 || status === 404,
      });

      if (response.status === 404) {
        setProfile(DEFAULT_PROFILE);
      } else {
        setProfile(normalizeProfile(response.data));
      }
    } catch (error) {
      toast.error("Failed to load profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle generic input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      // POST expects data as body
      const { data } = await API.post<ClientProfile>("/client", profile);
      setProfile(data);
      toast.success("Profile updated Successfully!");
    } catch (error) {
      toast.error("Failed to save");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addRole = (role: string) => {
    if (!role.trim()) return;
    setProfile(prev => ({
      ...prev,
      hiringPreferences: {
        ...prev.hiringPreferences,
        roles: [...prev.hiringPreferences.roles, role],
      },
    }));
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h1 className="text-2xl font-bold">🏢 Client Profile</h1>
          <p className="text-gray-500">Manage your company presence</p>
        </div>

        {/* Company Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          <h2 className="font-semibold text-lg">Company Info</h2>
          <input
            name="companyName"
            placeholder="Company Name"
            value={profile.companyName}
            onChange={handleChange}
            className="input"
          />
          <input
            name="tagline"
            placeholder="Tagline"
            value={profile.tagline}
            onChange={handleChange}
            className="input"
          />
          <textarea
            name="description"
            placeholder="Describe your company..."
            value={profile.description}
            onChange={handleChange}
            className="input"
          />
          <input
            name="website"
            placeholder="Website"
            value={profile.website}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Hiring Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          <h2 className="font-semibold text-lg">Hiring Preferences</h2>
          <input
            placeholder="Add role (e.g. React Dev)"
            onKeyDown={e => {
              if (e.key === "Enter") {
                addRole(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
            className="input"
          />
          <div className="flex gap-2 flex-wrap">
            {profile.hiringPreferences.roles.map((role, i) => (
              <span key={i} className="tag">{role}</span>
            ))}
          </div>
          <input
            name="budgetRange"
            placeholder="Budget Range"
            value={profile.hiringPreferences.budgetRange}
            onChange={e =>
              setProfile(prev => ({
                ...prev,
                hiringPreferences: { ...prev.hiringPreferences, budgetRange: e.target.value },
              }))
            }
            className="input"
          />
        </div>

        {/* Projects */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="font-semibold text-lg mb-4">Projects</h2>
          {profile.projects.length === 0 ? (
            <p className="text-gray-400">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {profile.projects.map(p => (
                <div key={p._id} className="border p-4 rounded-xl">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-500">{p.description}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    ₹{p.budget} • {p.duration} • {p.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
