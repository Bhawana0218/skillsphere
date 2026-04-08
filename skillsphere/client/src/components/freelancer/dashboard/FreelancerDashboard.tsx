import React from 'react';
import { TrendingUp, Target, Award } from 'lucide-react';
import type { FreelancerProfileData } from '../../../types/freelancer';

interface FreelancerDashboardProps {
  profileData: FreelancerProfileData;
  onBack: () => void;
  onEditProfile: () => void;
  refreshKey?: number;
}

const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({
  profileData,
  refreshKey = 0,
}) => {
  return (
    <div key={refreshKey} className="space-y-6">
      {/* Dashboard content using profileData from centralized types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} className="text-blue-600" />
            <h3 className="font-semibold text-slate-900">Profile Status</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">
            {profileData.profileComplete ? '100%' : '0%'}
          </p>
          <p className="text-sm text-slate-600">
            {profileData.profileComplete ? 'Profile complete and ready!' : 'Complete your profile to get started'}
          </p>
        </div>

        <div className="bg-linear-to-br from-emerald-50 to-cyan-50 rounded-lg p-6 border border-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <Award size={20} className="text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Skills Added</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{profileData.skills.length}</p>
          <p className="text-sm text-slate-600">Technical expertise on display</p>
        </div>

        <div className="bg-linear-to-br from-amber-50 to-cyan-50 rounded-lg p-6 border border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-amber-600" />
            <h3 className="font-semibold text-slate-900">Hourly Rate</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">₹{profileData.hourlyRate || '—'}</p>
          <p className="text-sm text-slate-600">Your competitive pricing</p>
        </div>
      </div>

      {/* Skills preview */}
      {profileData.skills.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Top Skills</h4>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.slice(0, 5).map((skill) => (
              <div key={skill.id || skill.name} className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm">
                <span>{skill.name}</span>
                <span className="text-xs font-semibold">{skill.proficiency}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience preview */}
      {profileData.experience.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Recent Experience</h4>
          <div className="space-y-2">
            {profileData.experience.slice(0, 2).map((exp) => (
              <div key={exp.id || exp.title} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-slate-900">{exp.title}</p>
                <p className="text-sm text-slate-600">{exp.company}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;





