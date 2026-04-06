import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FreelancerProfile from '../../components/freelancer/profile/FreelancerProfile';
import { checkAuth } from '../../utils/auth';
import api from '../../services/api';
import type { FreelancerProfileData } from '../../components/freelancer/dashboard/FreelancerDashboard';

const defaultProfileValues: FreelancerProfileData = {
  name: '',
  title: '',
  hourlyRate: '',
  location: '',
  skills: [],
  bio: '',
  profileComplete: false,
};

const toProfileData = (raw: any): FreelancerProfileData => {
  if (!raw) return defaultProfileValues;

  const normalized: FreelancerProfileData = {
    name: raw?.name || '',
    title: raw?.title || '',
    hourlyRate:
      raw?.hourlyRate !== undefined && raw?.hourlyRate !== null
        ? String(raw.hourlyRate)
        : '',
    location: raw?.location || '',
    skills: Array.isArray(raw?.skills)
      ? raw.skills.map((skill: any) => ({
          name: skill?.name || '',
          proficiency: Number(skill?.proficiency) || 50,
        }))
      : [],
    bio: raw?.bio || '',
    profileComplete: false,
  };

  normalized.profileComplete = Boolean(
    normalized.name &&
      normalized.title &&
      normalized.bio &&
      normalized.hourlyRate &&
      normalized.skills.length > 0
  );

  return normalized;
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<FreelancerProfileData>(defaultProfileValues);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const routeProfile = (location.state as { profile?: FreelancerProfileData } | null)?.profile;
        if (routeProfile) {
          setProfile(routeProfile);
          setProfileComplete(routeProfile.profileComplete);
        }

        const response = await api.get('/freelancer/profile', {
          validateStatus: (status) => status === 200 || status === 404,
        });

        const backendProfile = toProfileData(response.data?.freelancer);
        setProfile(backendProfile);
        setProfileComplete(backendProfile.profileComplete);
        localStorage.setItem('freelancerProfile', JSON.stringify(backendProfile));
      } catch (error) {
        const stored = localStorage.getItem('freelancerProfile');
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as FreelancerProfileData;
            setProfile(parsed);
            setProfileComplete(parsed.profileComplete);
          } catch {
            setProfile(defaultProfileValues);
            setProfileComplete(false);
          }
        } else {
          setProfile(defaultProfileValues);
          setProfileComplete(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate, location.state]);

  const handleBack = () => {
    navigate('/freelancer/dashboard');
  };

  const handleProfileSaved = (updatedProfile: FreelancerProfileData) => {
    setProfile(updatedProfile);
    setProfileComplete(updatedProfile.profileComplete);
    localStorage.setItem('freelancerProfile', JSON.stringify(updatedProfile));
    navigate('/freelancer/dashboard', { state: { profile: updatedProfile } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-cyan-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading profile editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Back Button Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 transition-colors font-semibold text-lg"
          >
            <span className="hover:-translate-x-1 transition-transform">←</span>
            Back to Dashboard
          </button>
        </div>
      </div>
      
      {/* Profile Form */}
      <FreelancerProfile
        initialData={profile}
        onSave={handleProfileSaved}
      />
      
      {/* Profile Completion Banner */}
      {!profileComplete && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className="bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-xl shadow-amber-500/25 flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">Complete Your Profile</p>
              <p className="text-amber-100 text-sm">Get 3x more project invitations</p>
            </div>
            <button 
              onClick={() => document.querySelector('button[type="submit"]')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 bg-white text-amber-600 rounded-xl font-semibold hover:bg-amber-50 transition-colors"
            >
              Finish Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
