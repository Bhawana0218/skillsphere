import React, { useState, useEffect } from 'react';
import PremiumButton from '../shared/PremiumButton';
import { 
  DollarSign, Briefcase, Star, User, FileText,
  Edit3, TrendingUp, Clock, Award, ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  Tooltip, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import toast from 'react-hot-toast';

// Components
import StatCard from './StatCard';
// import PremiumButton from '../../components/freelancer/shared/PremiumButton';

// --- Type Definitions ---
interface Stats {
  earnings: number;
  jobs: number;
  rating: number;
  proposals: number;
  completionRate: number;
  responseTime: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DashboardResponse {
  earnings: number;
  completedJobs: number;
  rating: number;
  activeProposals: number;
  completionRate: number;
  responseTime: string;
  revenueDistribution: ChartDataItem[];
  monthlyEarnings: { month: string; amount: number }[];
}

export interface FreelancerProfileData {
  name: string;
  title: string;
  hourlyRate: string;
  location: string;
  skills: { name: string; proficiency: number }[];
  bio: string;
  profileComplete: boolean;
}

interface FreelancerDashboardProps {
  onBack: () => void;
  onEditProfile: () => void; // ✅ New prop for navigation
  profileData?: FreelancerProfileData;
}

// --- Component ---
const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({ onBack, onEditProfile, profileData }) => {
  const [stats, setStats] = useState<Stats>({
    earnings: 0, jobs: 0, rating: 0, proposals: 0,
    completionRate: 0, responseTime: '0h'
  });
  const [revenueData, setRevenueData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // (optional) place for loading state
  if (loading) {
    // intentionally minimal fallback while data loads
  }

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get<DashboardResponse>('/freelancer/dashboard');
      
      const data = response.data;
      
      setStats({
        earnings: data.earnings,
        jobs: data.completedJobs,
        rating: data.rating,
        proposals: data.activeProposals,
        completionRate: data.completionRate,
        responseTime: data.responseTime
      });
      setRevenueData(data.revenueDistribution);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      // Fallback demo data
      setStats({
        earnings: 125000,
        jobs: 12,
        rating: 4.8,
        proposals: 5,
        completionRate: 92,
        responseTime: '2.4h'
      });
      setRevenueData([
        { name: 'Web Dev', value: 45, color: '#06B6D4' },
        { name: 'Mobile', value: 25, color: '#3B82F6' },
        { name: 'Design', value: 18, color: '#8B5CF6' },
        { name: 'Other', value: 12, color: '#64748B' },
      ]);
      toast.error("Using demo data - connect backend for live stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Donut Chart Config
  const chartConfig = {
    width: '100%',
    height: 280,
    innerRadius: 60,
    outerRadius: 90,
    paddingAngle: 2,
  };

  interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-cyan-50/20 font-sans">
      {/* Premium Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 text-slate-700 hover:text-cyan-600 transition-all duration-300 font-semibold text-lg px-4 py-2 rounded-xl hover:bg-cyan-50/50"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <h1 className="text-xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
               
        Welcome {user?.name} ({user?.role})
      
                {/* {profileData?.name ? `Hi, ${profileData.name}` : 'Freelancer Dashboard'} */}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                {profileData?.title ? `${profileData.title} • ${profileData.location}` : 'Track your success'}
              </p>
              <p className="text-xs text-slate-400">
                Hourly rate: {profileData?.hourlyRate ?? '₹0'} • Profile {(profileData?.profileComplete ? 'complete' : 'incomplete')}
              </p>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                <User className="w-7 h-7" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ✅ Stats Grid with StatCard */}
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard 
              title="Total Earnings" 
              value={`₹${stats.earnings.toLocaleString('en-IN')}`} 
              icon={<DollarSign className="w-7 h-7" />} 
              color="green"
              trend="+12.5% this month"
              isCurrency
            />
            <StatCard 
              title="Jobs Completed" 
              value={stats.jobs.toString()} 
              icon={<Briefcase className="w-7 h-7" />} 
              color="blue"
              trend={`${stats.completionRate}% success`}
            />
            <StatCard 
              title="Average Rating" 
              value={stats.rating.toFixed(1)} 
              icon={<Star className="w-7 h-7" />} 
              color="purple"
              trend="Top 10% freelancer"
            />
            <StatCard 
              title="Active Proposals" 
              value={stats.proposals.toString()} 
              icon={<FileText className="w-7 h-7" />} 
              color="cyan"
              trend={`Avg response: ${stats.responseTime}`}
            />
          </div>
        </section>

        {/* ✅ Main Content: Charts + Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Revenue Donut Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Revenue Distribution</h3>
                <p className="text-slate-500 text-base">Breakdown by service category</p>
              </div>
              <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none">
                <option>Last 6 Months</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Donut Chart */}
              <div className="w-full md:w-1/2 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={chartConfig.innerRadius}
                      outerRadius={chartConfig.outerRadius}
                      paddingAngle={chartConfig.paddingAngle}
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        border: 'none', 
                        borderRadius: '12px', 
                        color: '#fff',
                        fontSize: '14px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={40}
                      formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Stats Summary */}
              <div className="w-full md:w-1/2 space-y-4">
                {revenueData.map((item, idx) => (
                  <motion.div 
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-cyan-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-800 text-lg">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 text-lg">{item.value}%</span>
                      <p className="text-xs text-slate-500">of revenue</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Quick Actions & Profile */}
          <div className="space-y-6">
            {/* Profile Completeness Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-linear-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-cyan-500/25"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Profile Strength</h3>
                <Award className="w-6 h-6 text-cyan-100" />
              </div>
              
              <div className="relative w-full h-3 bg-white/20 rounded-full overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-white rounded-full"
                />
              </div>
              
              <p className="text-cyan-100 text-base mb-6">Add portfolio items to reach 100%</p>
              
              <PremiumButton
                onClick={onEditProfile} // ✅ Functional Edit Profile
                variant="white"
                className="w-full"
                icon={<Edit3 className="w-5 h-5" />}
              >
                Edit Profile
              </PremiumButton>
            </motion.div>

            {/* Availability Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl border border-slate-200/60 shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-600" />
                Availability
              </h3>
              
              <div className="flex items-center gap-3 mb-5 p-4 bg-green-50 rounded-2xl">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-slate-700 font-medium text-lg">Available for New Projects</span>
              </div>
              
              <PremiumButton
                variant="outline"
                className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50"
              >
                Update Calendar
              </PremiumButton>
            </motion.div>

            {/* Performance Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl border border-slate-200/60 shadow-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Top Performer</h4>
              <p className="text-slate-500 text-base">You're in the top 5% of freelancers</p>
              <div className="mt-4 flex items-center justify-center gap-1 text-amber-600 font-bold">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-xl">4.8</span>
                <span className="text-slate-400">/ 5.0</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ✅ Recent Proposals Table - Premium Design */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Recent Proposals</h3>
            <PremiumButton variant="ghost" icon={<ArrowUpRight className="w-4 h-4" />}>
              View All
            </PremiumButton>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-cyan-50 to-blue-50 border-b border-slate-200/60">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Bid Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { project: 'React E-commerce Platform', bid: 45000, status: 'pending', date: '2 hrs ago' },
                    { project: 'Mobile App UI Design', bid: 28000, status: 'accepted', date: '1 day ago' },
                    { project: 'API Integration Service', bid: 32000, status: 'rejected', date: '3 days ago' },
                  ].map((item, idx) => (
                    <motion.tr 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-cyan-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 text-lg">{item.project}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 text-lg">₹{item.bid.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          item.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-base">{item.date}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-cyan-600 hover:text-cyan-800 font-semibold text-base hover:underline transition-colors">
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* <RevenueDonutChart/> */}
        </section>
      </main>
    </div>
  );
};

export default FreelancerDashboard;