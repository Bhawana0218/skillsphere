import React, { useState } from 'react';
import { FileUp, CheckCircle } from 'lucide-react';
import PremiumButton from '../shared/PremiumButton';
import SectionCard from '../shared/SectionCard';
import SkillsManager from './SkillsManager';
import WorkExperienceManager from './WorkExperienceManager';
import PortfolioGallery from './PortfolioGallery';
import CertificationsManager from './CertificationsManager';
import AvailabilityCalendar from './AvailabilityCalendar';
import PricingManager from './PricingManager';
import type { FreelancerProfileData } from '../../../types/freelancer';
import api from '../../../services/api';
import AvailabilityManager from '../../../features/availability/AvailabilityManager';

interface FreelancerProfileProps {
  initialData?: FreelancerProfileData;
  onSave?: (data: FreelancerProfileData) => void;
  embedded?: boolean;
}

const FreelancerProfile: React.FC<FreelancerProfileProps> = ({
  initialData,
  onSave,
  embedded = false,
}) => {
  const [profile, setProfile] = useState<FreelancerProfileData>({
    name: initialData?.name || '',
    title: initialData?.title || '',
    bio: initialData?.bio || '',
    location: initialData?.location || '',
    hourlyRate: initialData?.hourlyRate || '',
    skills: initialData?.skills || [],
    experience: initialData?.experience || [],
    portfolio: initialData?.portfolio || [],
    certifications: initialData?.certifications || [],
    availability: initialData?.availability || [],
    pricing: initialData?.pricing || { hourlyRate: 0 },
    resumeUrl: initialData?.resumeUrl || '',
  });

  const [saving, setSaving] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        location: profile.location,
        hourlyRate: Number(profile.hourlyRate) || 0,
        skills: profile.skills,
        experience: profile.experience,
        portfolio: profile.portfolio,
        certifications: profile.certifications,
        availability: profile.availability,
        pricing: profile.pricing,
        resumeUrl: profile.resumeUrl,
      };
      
      console.log('Saving profile to:', "/freelancer/profile");
      console.log('Payload', payload);
      
      await api.post('/freelancer/profile', payload);

      setNotification({ type: 'success', message: 'Profile updated successfully!' });
      if (onSave) onSave(profile);

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save profile. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSkillsSave = async (skills: any[]) => {
    try {
      await api.post('/freelancer/profile/skills', { skills });
      setProfile((prev) => ({ ...prev, skills }));
    } catch (error) {
      console.error('Error saving skills:', error);
    }
  };

  const handleExperienceSave = async (experience: any[]) => {
    try {
      await api.post('/freelancer/profile/experience', { experience });
      setProfile((prev) => ({ ...prev, experience }));
    } catch (error) {
      console.error('Error saving experience:', error);
    }
  };

  const handlePortfolioSave = async (items: any[]) => {
    try {
      await api.post('/freelancer/profile/portfolio', { portfolio: items });
      setProfile((prev) => ({ ...prev, portfolio: items }));
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  const handleCertificationsSave = async (certifications: any[]) => {
    try {
      await api.post('/freelancer/profile/certifications', { certifications });
      setProfile((prev) => ({ ...prev, certifications }));
    } catch (error) {
      console.error('Error saving certifications:', error);
    }
  };

  const handleAvailabilitySave = async (availability: any[]) => {
    try {
      await api.post('/freelancer/profile/availability', { availability });
      setProfile((prev) => ({ ...prev, availability }));
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  const handlePricingSave = async (pricing: any) => {
    try {
      await api.post('/freelancer/profile/pricing', { pricing });
      setProfile((prev) => ({ ...prev, pricing }));
    } catch (error) {
      console.error('Error saving pricing:', error);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
      // Reset input to allow re-selection of same file
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    console.log('File selected:', file.name, file.size);
    setSelectedFileName(file.name);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      console.log('Uploading file...');
      const response = await api.post("/freelancer/profile/upload-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log('Upload response:', response.data);

      setProfile((prev) => ({ ...prev, resumeUrl: response.data.resumeUrl }));
      setNotification({ type: 'success', message: 'Resume uploaded successfully!' });
      setTimeout(() => setNotification(null), 2000);
      setSelectedFileName(null); // Clear after successful upload
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      console.error("Error response:", error.response?.data);
      setNotification({ type: 'error', message: 'Failed to upload resume. Please try again.' });
      setTimeout(() => setNotification(null), 2000);
      setSelectedFileName(null); // Clear on error
    }
  };

  const containerClass = embedded ? 'space-y-6' : '';

  return (
    <div className='bg-blue-50 min-h-screen '>
    <div className= {containerClass}>
      {notification && (
        <div
          className={`p-4 rounded-lg border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      <SectionCard title="Basic Information" subtitle="Your professional identity" variant="minimal">
        <div className="space-y-4 bg-green-50 rounded-lg p-6 border border-cyan-600">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg placeholder:text-gray-700 text-black text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Your full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Professional Title</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm placeholder:text-gray-700 text-black focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Full Stack Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300  placeholder:text-gray-700 text-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Your location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Professional Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 placeholder:text-gray-700 text-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Tell clients about yourself..."
            />
          </div>
        </div>
        </div>
      </SectionCard>

      <SectionCard title="Skills & Proficiency" subtitle="Add your technical skills with proficiency levels" variant="minimal">
        <SkillsManager
          skills={profile.skills}
          onChange={(skills) => setProfile({ ...profile, skills })}
          onSave={handleSkillsSave}
        />
      </SectionCard>

      <SectionCard title="Work Experience" subtitle="Build your professional timeline" variant="minimal">
        <WorkExperienceManager
          experiences={profile.experience}
          onChange={(experience) => setProfile({ ...profile, experience })}
          onSave={handleExperienceSave}
        />
      </SectionCard>

      <SectionCard title="Portfolio Gallery" subtitle="Showcase your best projects" variant="minimal">
        <PortfolioGallery
          items={profile.portfolio || []}
          onChange={(portfolio) => setProfile({ ...profile, portfolio })}
          onSave={handlePortfolioSave}
        />
      </SectionCard>

      <SectionCard title="Certifications & Credentials" subtitle="Display your professional certifications" variant="minimal">
        <CertificationsManager
          certifications={profile.certifications || []}
          onChange={(certifications) => setProfile({ ...profile, certifications })}
          onSave={handleCertificationsSave}
        />
      </SectionCard>

      <SectionCard title="Availability & Schedule" subtitle="Manage your working hours" variant="minimal">
        <AvailabilityCalendar
          slots={profile.availability || []}
          onChange={(availability) => setProfile({ ...profile, availability })}
          onSave={handleAvailabilitySave}
        />
      </SectionCard>

      <SectionCard title="Availability Slot Scheduler" subtitle="Create bookable calendar slots and automate scheduling" variant="minimal">
        <AvailabilityManager />
      </SectionCard>

      <SectionCard title="Pricing & Payment" subtitle="Set your rates and payment preferences" variant="minimal">
        <PricingManager
          pricing={profile.pricing || { hourlyRate: 0 }}
          onChange={(pricing) => setProfile({ ...profile, pricing })}
          onSave={handlePricingSave}
        />
      </SectionCard>

      <SectionCard title="Resume Upload" subtitle="Upload your professional resume (PDF, DOC, DOCX)" variant="minimal">
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              selectedFileName 
                ? 'border-green-400 bg-green-50' 
                : 'border-slate-300 hover:border-cyan-400'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleResumeUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <FileUp size={32} className="text-slate-400" />
              <div>
                {selectedFileName ? (
                  <p className="text-sm font-medium text-cyan-600">Selected: {selectedFileName}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-600">PDF, DOC or DOCX (Max 10MB)</p>
                  </>
                )}
              </div>
            </label>
          </div>
          {profile.resumeUrl && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-sm text-green-700">Resume uploaded</span>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="flex gap-3">
        <PremiumButton fullWidth variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving profile...' : 'Save complete profile'}
        </PremiumButton>
      </div>
    </div>
    </div>
  );
};

export default FreelancerProfile;
