import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FreelancerDashboard from '../../components/freelancer/dashboard/FreelancerDashboard';
import { checkAuth } from '../../utils/auth';
import ProgressGraph, { type ProgressData } from '../../components/freelancer/dashboard/ProgressGraph';

export interface FreelancerProfileData {
  name: string;
  title: string;
  hourlyRate: string;
  location: string;
  skills: { name: string; proficiency: number }[];
  bio: string;
  profileComplete: boolean;
}

const defaultProfile: FreelancerProfileData = {
  name: 'Your Name',
  title: 'Freelance Professional',
  hourlyRate: '₹500',
  location: 'Unknown',
  skills: [],
  bio: '',
  profileComplete: false,
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<FreelancerProfileData>(defaultProfile);

  useEffect(() => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const persisted = localStorage.getItem('freelancerProfile');
    if (persisted) {
      try {
        setProfile(JSON.parse(persisted));
      } catch (error) {
        console.error('Failed to parse stored profile', error);
      }
    }

    const routeState = (location.state as { profile?: FreelancerProfileData } | null)?.profile;
    if (routeState) {
      setProfile(routeState);
      localStorage.setItem('freelancerProfile', JSON.stringify(routeState));
    }

    setIsLoading(false);
  }, [navigate, location.state]);

  const handleBack = () => {
    navigate('/home');
  };

  const handleEditProfile = () => {
    navigate('/freelancer/profile', { state: { profile } });
  };

  const progressData: ProgressData = {
    profileCompletion: {
      current: profile.profileComplete ? 95 : 45,
      target: 100,
      steps: [
        { name: 'Basic info', completed: !!profile.name },
        { name: 'Skills', completed: profile.skills.length > 0 },
        { name: 'Portfolio', completed: !!profile.bio },
        { name: 'Rates', completed: !!profile.hourlyRate },
        { name: 'Ready to apply', completed: profile.profileComplete },
      ],
    },
    earningsProgress: {
      current: 84000,
      goal: 150000,
      monthly: [
        { month: 'Jan', amount: 12000, projected: 14000 },
        { month: 'Feb', amount: 18000, projected: 17000 },
        { month: 'Mar', amount: 22500, projected: 23000 },
        { month: 'Apr', amount: 21500, projected: 22000 },
        { month: 'May', amount: 10000, projected: 13000 }
      ]
    },
    jobs: {
      completed: 16,
      inProgress: 3,
      total: 24,
      successRate: 91
    },
    skills: {
      total: profile.skills.length,
      avgProficiency: profile.skills.length > 0 ? Math.round(profile.skills.reduce((acc, s) => acc + s.proficiency, 0) / profile.skills.length) : 0,
      topSkills: profile.skills.length > 0 ? profile.skills.slice(0, 3).map(s => ({ name: s.name || 'Skill', level: s.proficiency, trend: (s.proficiency > 70 ? 'up' : 'stable') as 'up' | 'stable' | 'down' })) : [
        { name: 'React', level: 60, trend: 'up' },
        { name: 'Node.js', level: 55, trend: 'up' },
        { name: 'UI/UX', level: 50, trend: 'stable' }
      ]
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-cyan-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <FreelancerDashboard
        onBack={handleBack}
        onEditProfile={handleEditProfile}
        profileData={profile}
      />

      <ProgressGraph data={progressData} />
    </div>
  );
};

export default DashboardPage;