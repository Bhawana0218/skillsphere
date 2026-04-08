import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FreelancerDashboard from '../../components/freelancer/dashboard/FreelancerDashboard';
import ProgressGraph from '../../components/freelancer/dashboard/ProgressGraph';
import FreelancerProfile from '../../components/freelancer/profile/FreelancerProfile';
import PremiumButton from '../../components/freelancer/shared/PremiumButton';
import SectionCard from '../../components/freelancer/shared/SectionCard';
import type { ProgressData, FreelancerProfileData, ProfileCompletionStep } from '../../types/freelancer';
import { checkAuth } from '../../utils/auth';
import { Briefcase, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const emptyProfile: FreelancerProfileData = {
  name: '',
  title: '',
  hourlyRate: '',
  location: '',
  skills: [],
  experience: [],
  bio: '',
  profileComplete: false
};

const toProfileData = (raw: any): FreelancerProfileData => {
  if (!raw) return emptyProfile;

  const mapped: FreelancerProfileData = {
    id: raw?.id || undefined,
    name: raw?.name || '',
    title: raw?.title || '',
    hourlyRate:
      raw?.hourlyRate !== undefined && raw?.hourlyRate !== null
        ? String(raw.hourlyRate)
        : '',
    location: raw?.location || '',
    skills: Array.isArray(raw?.skills)
      ? raw.skills
          .filter((skill: any) => typeof skill?.name === 'string' && skill.name.trim())
          .map((skill: any) => ({
            id: skill?.id,
            name: skill.name.trim(),
            proficiency: Number(skill?.proficiency) || 50,
            endorsements: Number(skill?.endorsements) || 0,
            yearsExperience: Number(skill?.yearsExperience) || 0,
          }))
      : [],
    experience: Array.isArray(raw?.experience)
      ? raw.experience
          .filter((item: any) => typeof item?.title === 'string' && item.title.trim())
          .map((item: any) => ({
            id: item?.id,
            title: item.title?.trim() || '',
            company: item?.company?.trim?.() || '',
            duration: item?.duration?.trim?.() || '',
            description: item?.description || '',
            isCurrently: item?.isCurrently || false,
          }))
      : [],
    portfolio: Array.isArray(raw?.portfolio)
      ? raw.portfolio.map((item: any) => ({
          id: item?.id,
          title: item?.title || '',
          description: item?.description || '',
          imageUrl: item?.imageUrl || '',
          projectUrl: item?.projectUrl,
          technologies: item?.technologies || [],
        }))
      : [],
    certifications: Array.isArray(raw?.certifications)
      ? raw.certifications.map((cert: any) => ({
          id: cert?.id,
          title: cert?.title || '',
          issuer: cert?.issuer || '',
          issueDate: cert?.issueDate || '',
          expiryDate: cert?.expiryDate,
          credentialUrl: cert?.credentialUrl,
          credentialId: cert?.credentialId,
          verified: cert?.verified || false,
        }))
      : [],
    availability: Array.isArray(raw?.availability)
      ? raw.availability.map((slot: any) => ({
          day: slot?.day || '',
          startTime: slot?.startTime || '09:00',
          endTime: slot?.endTime || '17:00',
          available: slot?.available !== false,
        }))
      : [],
    pricing: raw?.pricing ? {
      hourlyRate: Number(raw.pricing.hourlyRate) || 0,
      minimumHours: Number(raw.pricing.minimumHours) || 0,
      fixedProjectRate: raw.pricing.fixedProjectRate || false,
      projectRateMin: Number(raw.pricing.projectRateMin) || 0,
      projectRateMax: Number(raw.pricing.projectRateMax) || 0,
      milestonePayment: raw.pricing.milestonePayment || false,
    } : { hourlyRate: 0 },
    bio: raw?.bio || '',
    resumeUrl: raw?.resumeUrl || '',
    profileComplete: false,
  };

  mapped.profileComplete = Boolean(
    mapped.name &&
      mapped.title &&
      mapped.bio &&
      mapped.hourlyRate &&
      mapped.skills.length > 0 &&
      mapped.experience.length > 0
  );

  return mapped;
};

const toProgressData = (raw: any): ProgressData | null => {
  if (!raw?.profileCompletion || !raw?.earningsProgress || !raw?.jobs || !raw?.skills) {
    return null;
  }

  return {
    profileCompletion: {
      current: Number(raw.profileCompletion.current) || 0,
      target: Number(raw.profileCompletion.target) || 100,
      steps: Array.isArray(raw.profileCompletion.steps)
        ? raw.profileCompletion.steps.map((step: any): ProfileCompletionStep => ({
            name: step?.name || 'Step',
            completed: Boolean(step?.completed),
          }))
        : [],
    },
    earningsProgress: {
      current: Number(raw.earningsProgress.current) || 0,
      goal: Number(raw.earningsProgress.goal) || 50000,
      monthly: Array.isArray(raw.earningsProgress.monthly)
        ? raw.earningsProgress.monthly.map((entry: any) => ({
            month: entry?.month || '',
            amount: Number(entry?.amount) || 0,
            projected: Number(entry?.projected) || 0,
          }))
        : [],
    },
    jobs: {
      completed: Number(raw.jobs.completed) || 0,
      inProgress: Number(raw.jobs.inProgress) || 0,
      total: Number(raw.jobs.total) || 0,
      successRate: Number(raw.jobs.successRate) || 0,
    },
    skills: {
      total: Number(raw.skills.total) || 0,
      avgProficiency: Number(raw.skills.avgProficiency) || 0,
      topSkills: Array.isArray(raw.skills.topSkills)
        ? raw.skills.topSkills.map((skill: any) => ({
            name: skill?.name || 'Skill',
            level: Number(skill?.level) || 0,
            trend: skill?.trend === 'up' || skill?.trend === 'down' ? skill.trend : 'stable',
          }))
        : [],
    },
  };
};

const buildFallbackProgress = (profile: FreelancerProfileData): ProgressData => {
  const totalSkills = profile.skills.length;
  const avgProficiency =
    totalSkills > 0
      ? Math.round(
          profile.skills.reduce((sum, skill) => sum + (Number(skill.proficiency) || 0), 0) /
            totalSkills
        )
      : 0;

  const profileSteps: ProfileCompletionStep[] = [
    { name: 'Bio & Title', completed: Boolean(profile.bio && profile.title) },
    { name: 'Skills', completed: totalSkills > 0 },
    { name: 'Experience', completed: profile.experience.length > 0 },
    { name: 'Portfolio', completed: (profile.portfolio?.length || 0) > 0 },
    { name: 'Rates', completed: Boolean(profile.hourlyRate) },
    { name: 'Ready to apply', completed: profile.profileComplete || false },
  ];

  const completedSteps = profileSteps.filter((step) => step.completed).length;
  const completionPct = Math.round((completedSteps / profileSteps.length) * 100);

  return {
    profileCompletion: {
      current: completionPct,
      target: 100,
      steps: profileSteps,
    },
    earningsProgress: {
      current: 0,
      goal: 50000,
      monthly: [],
    },
    jobs: {
      completed: 0,
      inProgress: 0,
      total: 0,
      successRate: 0,
    },
    skills: {
      total: totalSkills,
      avgProficiency,
      topSkills: profile.skills.slice(0, 5).map((skill) => ({
        name: skill.name,
        level: Number(skill.proficiency) || 0,
        trend: 'stable' as const,
      })),
    },
  };
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FreelancerProfileData>(emptyProfile);
  const [serverProgress, setServerProgress] = useState<ProgressData | null>(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => {
    if (!checkAuth()) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [profileResponse, progressResponse] = await Promise.all([
          api.get('/freelancer/profile', {
            validateStatus: (status) => status === 200 || status === 404,
          }),
          api.get('/freelancer/progress', {
            validateStatus: (status) => status === 200 || status === 404,
          }),
        ]);

        if (!isMounted) return;

        const mappedProfile = toProfileData(profileResponse.data?.freelancer);
        setProfile(mappedProfile);
        localStorage.setItem('freelancerProfile', JSON.stringify(mappedProfile));

        if (progressResponse.status === 200) {
          setServerProgress(toProgressData(progressResponse.data));
        } else {
          setServerProgress(null);
        }
      } catch (error) {
        const stored = localStorage.getItem('freelancerProfile');
        if (stored) {
          try {
            const savedProfile = JSON.parse(stored) as FreelancerProfileData;
            if (isMounted) setProfile(savedProfile);
          } catch {
            if (isMounted) setProfile(emptyProfile);
          }
        } else if (isMounted) {
          setProfile(emptyProfile);
        }

        if (isMounted) setServerProgress(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleBack = () => navigate('/home');
  const handleEditProfile = () => setShowProfileEditor(true);

  const handleProfileSaved = async (updatedProfile: FreelancerProfileData) => {
    setProfile(updatedProfile);
    localStorage.setItem('freelancerProfile', JSON.stringify(updatedProfile));
    setShowProfileEditor(false);
    setDashboardRefreshKey((prev) => prev + 1);

    try {
      await api.put('/freelancer/dashboard/refresh');
      const progressResponse = await api.get('/freelancer/progress', {
        validateStatus: (status) => status === 200 || status === 404,
      });
      if (progressResponse.status === 200) {
        setServerProgress(toProgressData(progressResponse.data));
      } else {
        setServerProgress(null);
      }
    } catch {
      setServerProgress(null);
    }
  };

  const progressData: ProgressData = useMemo(
    () => serverProgress || buildFallbackProgress(profile),
    [serverProgress, profile]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold">
              Professional Freelancer HQ
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              SkillSphere Freelancer Dashboard
            </h1>
            <p className="max-w-2xl text-slate-600 text-base sm:text-lg">
              Your next-level command center for projects, revenue, skills and profile growth — fully styled in a crisp white-cyan product aesthetic.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PremiumButton onClick={handleEditProfile}>Edit full profile</PremiumButton>
            <PremiumButton variant="outline" onClick={() => navigate('/freelancer/profile')}>
              Open profile page
            </PremiumButton>
          </div>
        </div>

        <SectionCard
          title="Core Dashboard"
          subtitle="Insights, actions, and performance at a glance"
          icon={<TrendingUp />}
          action={<PremiumButton onClick={handleBack} variant="ghost">Back to home</PremiumButton>}
        >
          <div>
            <FreelancerDashboard
              onBack={handleBack}
              onEditProfile={handleEditProfile}
              profileData={profile}
              refreshKey={dashboardRefreshKey}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Progress snapshot"
          subtitle="Live momentum metrics for your freelance growth"
          icon={<TrendingUp />}
        >
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
                <PremiumButton fullWidth variant="white">
                  Update slots
                </PremiumButton>
                <PremiumButton fullWidth variant="ghost">
                  Sync calendar
                </PremiumButton>
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
          <SectionCard
            title="Profile polish"
            subtitle="Keep your freelancer brand product-ready"
            variant="minimal"
            action={
              <PremiumButton onClick={handleEditProfile} variant="white">
                Open editor
              </PremiumButton>
            }
          >
            <div className="space-y-4 text-slate-600 text-sm">
              <p className="font-medium text-slate-800">Current profile</p>
              <p>
                <span className="font-semibold">Name:</span> {profile.name || 'Not set'}
              </p>
              <p>
                <span className="font-semibold">Role:</span> {profile.title || 'Not set'}
              </p>
              <p>
                <span className="font-semibold">Location:</span> {profile.location || 'Not set'}
              </p>
              <p>
                <span className="font-semibold">Hourly Rate:</span> ₹{profile.hourlyRate || 'Not set'}
              </p>
              <p>
                <span className="font-semibold">Skills:</span>{' '}
                {profile.skills.length > 0 ? profile.skills.map((skill) => skill.name).join(', ') : 'Not set'}
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Premium actions" subtitle="Fast workflow controls" variant="minimal">
            <div className="space-y-3">
              <PremiumButton fullWidth variant="primary">
                Create new proposal
              </PremiumButton>
              <PremiumButton fullWidth variant="outline">
                Review active contracts
              </PremiumButton>
              <PremiumButton fullWidth variant="ghost">
                Open support
              </PremiumButton>
            </div>
          </SectionCard>
        </div>

        {showProfileEditor && (
          <SectionCard
            title="Freelancer profile editor"
            subtitle="Update every detail with confidence"
            icon={<Briefcase />}
            action={
              <PremiumButton variant="ghost" onClick={() => setShowProfileEditor(false)}>
                Close editor
              </PremiumButton>
            }
          >
            <FreelancerProfile initialData={profile} onSave={handleProfileSaved} embedded />
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;