import React, { useState, type ChangeEvent } from 'react';
import { 
  User, CheckCircle, Plus, X, Upload, Sparkles,
  Briefcase, Code, Palette, FileText, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import type { FreelancerProfileData } from '../dashboard/FreelancerDashboard';
import PortfolioUploader, { type PortfolioItem } from './PortfolioUploader';

interface Skill {
  id: string;
  name: string;
  proficiency: number;
}

interface ProfileFormData {
  name: string;
  title: string;
  bio: string;
  hourlyRate: string;
  location: string;
  skills: Skill[];
  portfolio: PortfolioItem[];
  resume: File | null;
  availability: 'full-time' | 'part-time' | 'contract';
  photo?: File | null;
  photoPreview?: string;
}

interface FreelancerProfileProps {
  initialData?: FreelancerProfileData;
  onSave?: (profile: FreelancerProfileData) => void;
  embedded?: boolean;
}


const FreelancerProfile: React.FC<FreelancerProfileProps> = ({ initialData, onSave, embedded = false }) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData?.name ?? '',
    title: initialData?.title ?? '',
    bio: initialData?.bio ?? '',
    hourlyRate: initialData?.hourlyRate ?? '',
    location: initialData?.location ?? '',
    skills: initialData?.skills ? initialData.skills.map((skill) => ({ id: crypto.randomUUID(), name: skill.name, proficiency: skill.proficiency })) : [],
    portfolio: [],
    resume: null,
    availability: 'full-time',
    photo: undefined,
    photoPreview: undefined,
  });

  

  // Handle text inputs
  const handleChange = (field: keyof ProfileFormData) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Handle photo upload
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      // In real app: upload to cloud storage
      const preview = URL.createObjectURL(e.target.files[0]);
      setFormData(prev => ({ ...prev, photo: e.target.files![0], photoPreview: preview }));
    }
  };

  // Handle skills
  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { id: crypto.randomUUID(), name: '', proficiency: 50 }]
    }));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeSkill = (id: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
  };

  // Handle portfolio
  const handlePortfolioChange = (items: PortfolioItem[]) => {
    setFormData(prev => ({ ...prev, portfolio: items }));
  };

  // Handle resume
  const handleResumeUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  // Navigation
  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // Submit to API
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.title.trim() || !formData.bio.trim()) {
      toast.error('Name, title, and bio are required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare payload - ensure skills have proficiency
      const validSkills = formData.skills.filter(s => s.name.trim()).map(s => ({
        name: s.name.trim(),
        proficiency: Math.max(0, Math.min(100, parseInt(String(s.proficiency)) || 50))
      }));

      // Prepare portfolio - only include necessary fields
      const validPortfolio = formData.portfolio.filter(p => p.title.trim()).map(p => ({
        title: p.title.trim(),
        description: p.description.trim(),
        imageUrl: p.preview, // Keep as is for now (DataURL)
        projectUrl: p.projectUrl?.trim() || ''
      }));

      const payload = {
        name: formData.name.trim(),
        title: formData.title.trim(),
        bio: formData.bio.trim(),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0,
        location: formData.location.trim(),
        skills: validSkills,
        portfolio: validPortfolio,
        availability: formData.availability
      };

      await api.put('/freelancer/profile', payload);
      toast.success('🎉 Profile updated successfully!');
      onSave?.({
        name: formData.name.trim(),
        title: formData.title.trim(),
        hourlyRate: formData.hourlyRate,
        location: formData.location.trim(),
        skills: validSkills,
        bio: formData.bio.trim(),
        profileComplete: Boolean(
          formData.name.trim() &&
            formData.title.trim() &&
            formData.bio.trim() &&
            String(formData.hourlyRate).trim() &&
            validSkills.length > 0
        ),
      });
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step indicators
  const steps = [
    { num: 1, title: 'Basic Info', icon: <User className="w-4 h-4" /> },
    { num: 2, title: 'Skills & Rates', icon: <Briefcase className="w-4 h-4" /> },
    { num: 3, title: 'Portfolio', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className={`${embedded ? '' : 'min-h-screen bg-linear-to-br from-slate-50 via-white to-cyan-50/20 py-8 px-4'}`}>
      <div className={`${embedded ? '' : 'max-w-4xl mx-auto'}`}>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Build Your Professional Profile
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Stand Out to Clients</h1>
          <p className="text-slate-600 text-lg">Complete your profile to increase visibility and win more projects</p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl border border-slate-200/60 shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step === s.num 
                      ? 'bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25' 
                      : step > s.num 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${
                    step >= s.num ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${
                    step > s.num ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Form Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden"
          >
            <form onSubmit={(e) => { e.preventDefault(); step < 3 ? nextStep() : handleSubmit(); }} className="p-8 space-y-6">
              
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                        {formData.photoPreview ? (
                          <img src={formData.photoPreview} alt="Preview" className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-cyan-600" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 hover:bg-cyan-600 rounded-xl flex items-center justify-center text-white cursor-pointer shadow-lg transition-colors">
                        <Upload className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                    <p className="text-slate-500 text-base">Upload a professional photo</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-semibold text-lg">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={handleChange('name')}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all text-lg text-slate-900"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-semibold text-lg">Professional Title *</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={handleChange('title')}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all text-lg text-slate-900"
                        placeholder="Senior React Developer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold text-lg">Bio *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange('bio')}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all text-lg text-slate-900 resize-none leading-relaxed"
                      placeholder="Tell clients about your experience, expertise, and what makes you unique..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-semibold text-lg">Hourly Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.hourlyRate}
                        onChange={handleChange('hourlyRate')}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all text-lg text-slate-900"
                        placeholder="1500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-semibold text-lg">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={handleChange('location')}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all text-lg text-slate-900"
                        placeholder="Mumbai, India"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Skills & Rates */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold text-lg items-center gap-2">
                      <Code className="w-5 h-5 text-cyan-600" />
                      Skills & Expertise
                    </label>
                    <p className="text-slate-500 text-base">Add your top skills to attract relevant projects</p>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-4">
                    <AnimatePresence>
                      {formData.skills.map((skill, ) => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl"
                        >
                          <input
                            type="text"
                            placeholder="Skill name (e.g., React, Node.js)"
                            value={skill.name}
                            onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none text-lg"
                          />
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={skill.proficiency}
                              onChange={(e) => updateSkill(skill.id, 'proficiency', Number(e.target.value))}
                              className="flex-1 sm:w-32 accent-cyan-500"
                            />
                            <span className="text-slate-700 font-bold w-12 text-center">{skill.proficiency}%</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={addSkill}
                      className="flex items-center gap-2 px-5 py-3 bg-cyan-50 text-cyan-700 rounded-xl font-semibold hover:bg-cyan-100 transition-colors"
                    >
                      <Plus className="w-5 h-5" /> Add Skill
                    </motion.button>
                  </div>

                  {/* Availability */}
                  <div className="pt-6 border-t border-slate-100">
                    <label className="block text-slate-700 font-semibold text-lg mb-4">Availability</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {(['full-time', 'part-time', 'contract'] as const).map((type) => (
                        <label
                          key={type}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.availability === type
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="availability"
                            value={type}
                            checked={formData.availability === type}
                            onChange={handleChange('availability')}
                            className="hidden"
                          />
                          <div className="text-center">
                            <span className="font-bold text-slate-900 text-lg capitalize">{type.replace('-', ' ')}</span>
                            <p className="text-slate-500 text-sm mt-1">
                              {type === 'full-time' ? '40 hrs/week' : type === 'part-time' ? '20 hrs/week' : 'Project-based'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Portfolio & Resume */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold text-lg items-center gap-2">
                      <Palette className="w-5 h-5 text-cyan-600" />
                      Portfolio Showcase
                    </label>
                    <p className="text-slate-500 text-base">Upload your best work to impress clients</p>
                  </div>

                  <PortfolioUploader
                    items={formData.portfolio}
                    onChange={handlePortfolioChange}
                  />

                  {/* Resume Upload */}
                  <div className="pt-6 border-t border-slate-100">
                    <label className="block text-slate-700 font-semibold text-lg mb-4 items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-600" />
                      Resume / CV
                    </label>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="flex-1">
                        {formData.resume ? (
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-cyan-600" />
                            <span className="font-medium text-slate-900">{formData.resume.name}</span>
                            <span className="text-slate-500 text-sm">({(formData.resume.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        ) : (
                          <p className="text-slate-500">Upload your resume (PDF, DOC, DOCX)</p>
                        )}
                      </div>
                      <label className="px-4 py-2 bg-white border-2 border-cyan-200 text-cyan-700 rounded-xl font-medium cursor-pointer hover:bg-cyan-50 transition-colors">
                        {formData.resume ? 'Change' : 'Upload'}
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Verification Badge */}
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">Verified Profile</p>
                      <p className="text-green-700 text-sm">Your identity has been confirmed</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-colors text-lg"
                  >
                    ← Previous
                  </motion.button>
                ) : <div />}
                
                {step < 3 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-cyan-500/30 transition-all text-lg flex items-center gap-2"
                  >
                    Next Step →
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold shadow-lg shadow-green-500/30 transition-all text-lg flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Profile
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FreelancerProfile;
