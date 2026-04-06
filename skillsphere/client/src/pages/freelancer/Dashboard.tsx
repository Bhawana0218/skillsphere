import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FreelancerDashboard from '../../components/freelancer/dashboard/FreelancerDashboard';
import ProgressGraph from '../../components/freelancer/dashboard/ProgressGraph';
import FreelancerProfile from '../../components/freelancer/profile/FreelancerProfile';
import PremiumButton from '../../components/freelancer/shared/PremiumButton';
import SectionCard from '../../components/freelancer/shared/SectionCard';
import type { ProgressData } from '../../components/freelancer/dashboard/ProgressGraph';
import type { FreelancerProfileData } from '../../components/freelancer/dashboard/FreelancerDashboard';
import { checkAuth } from '../../utils/auth';
import { Briefcase, TrendingUp } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FreelancerProfileData>({
    name: '',
    title: '',
    hourlyRate: '',
    location: '',
    skills: [],
    bio: '',
    profileComplete: false
  });
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => {
    if (!checkAuth()) {
      navigate('/login');
      return;
    }

    const stored = localStorage.getItem('freelancerProfile');
    if (stored) {
      try {
        const savedProfile = JSON.parse(stored) as FreelancerProfileData;
        setProfile(savedProfile);
      } catch {
        // Keep empty profile
      }
    }

    setLoading(false);
  }, [navigate]);

  const handleBack = () => navigate('/home');
  const handleEditProfile = () => setShowProfileEditor(true);

  const handleProfileSaved = (updatedProfile: FreelancerProfileData) => {
    setProfile(updatedProfile);
    localStorage.setItem('freelancerProfile', JSON.stringify(updatedProfile));
    setShowProfileEditor(false);
  };

  const progressData: ProgressData = useMemo(
    () => ({
      profileCompletion: {
        current: profile.profileComplete ? 92 : 68,
        target: 100,
        steps: [
          { name: 'Bio & Title', completed: !!profile.bio },
          { name: 'Skills', completed: profile.skills.length > 0 },
          { name: 'Portfolio', completed: true },
          { name: 'Rates', completed: !!profile.hourlyRate },
          { name: 'Ready to apply', completed: profile.profileComplete }
        ]
      },
      earningsProgress: {
        current: 0,
        goal: 0,
        monthly: []
      },
      jobs: {
        completed: 26,
        inProgress: 4,
        total: 31,
        successRate: 93
      },
      skills: {
        total: 0,
        avgProficiency: 0,
        topSkills: []
      }
    }),
    [profile]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold">Professional Freelancer HQ</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">SkillSphere Freelancer Dashboard</h1>
            <p className="max-w-2xl text-slate-600 text-base sm:text-lg">Your next-level command center for projects, revenue, skills and profile growth — fully styled in a crisp white-cyan product aesthetic.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PremiumButton onClick={handleEditProfile}>Edit full profile</PremiumButton>
            <PremiumButton variant="outline" onClick={() => navigate('/freelancer/profile')}>Open profile page</PremiumButton>
          </div>
        </div>

        <SectionCard title="Core Dashboard" subtitle="Insights, actions and performance at a glance" icon={<TrendingUp />} action={<PremiumButton onClick={handleBack} variant="ghost">Back to home</PremiumButton>}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div>
              <FreelancerDashboard onBack={handleBack} onEditProfile={handleEditProfile} profileData={profile} />
            </div>
            <div className="space-y-6">
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Progress snapshot" subtitle="Live momentum metrics for your freelance growth" icon={<TrendingUp />}>
          <ProgressGraph data={progressData} />
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="Availability scheduler" subtitle="Keep clients updated on your schedule" variant="minimal">
            <div className="space-y-4">
              <div className="rounded-3xl bg-cyan-50 p-4 border border-cyan-100">
                <p className="text-sm text-slate-500">Weekly availability</p>
                <p className="font-semibold text-slate-900 text-xl">Mon - Fri · 10am - 6pm</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PremiumButton fullWidth variant="white">Update slots</PremiumButton>
                <PremiumButton fullWidth variant="ghost">Sync calendar</PremiumButton>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Milestone payments" subtitle="Track escrow and payouts" variant="minimal">
            <div className="space-y-3 text-slate-600 text-sm">
              <div className="flex items-center justify-between">
                <span>Escrow active</span>
                <span className="font-semibold text-slate-900">₹54,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Upcoming payout</span>
                <span className="font-semibold text-slate-900">₹12,500</span>
              </div>
              <p>Milestone payments keep your project secure while you build trust with clients.</p>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="Profile polish" subtitle="Keep your freelancer brand product-ready" variant="minimal" action={<PremiumButton onClick={handleEditProfile} variant="white">Open editor</PremiumButton>}>
            <div className="space-y-4 text-slate-600 text-sm">
              <p className="font-medium text-slate-800">Current profile</p>
              <p><span className="font-semibold">Name:</span> {profile.name}</p>
              <p><span className="font-semibold">Role:</span> {profile.title}</p>
              <p><span className="font-semibold">Location:</span> {profile.location}</p>
              <p><span className="font-semibold">Hourly Rate:</span> {profile.hourlyRate}</p>
              <p><span className="font-semibold">Skills:</span> {profile.skills.map((skill) => skill.name).join(', ')}</p>
            </div>
          </SectionCard>

          <SectionCard title="Premium actions" subtitle="Fast workflow controls" variant="minimal">
            <div className="space-y-3">
              <PremiumButton fullWidth variant="primary">Create new proposal</PremiumButton>
              <PremiumButton fullWidth variant="outline">Review active contracts</PremiumButton>
              <PremiumButton fullWidth variant="ghost">Open support</PremiumButton>
            </div>
          </SectionCard>
        </div>

        {showProfileEditor && (
          <SectionCard title="Freelancer profile editor" subtitle="Update every detail with confidence" icon={<Briefcase />} action={<PremiumButton variant="ghost" onClick={() => setShowProfileEditor(false)}>Close editor</PremiumButton>}>
            <FreelancerProfile initialData={profile} onSave={handleProfileSaved} embedded />
          </SectionCard>
        )}
      </div>
   </div>
  );
};

export default DashboardPage;
