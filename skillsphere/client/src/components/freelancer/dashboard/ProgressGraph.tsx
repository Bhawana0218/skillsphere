import React, { useMemo, useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Clock, Star, RefreshCw } from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import API from '../../../services/api';
import toast from 'react-hot-toast';

// Types
export interface ProgressData {
  profileCompletion: {
    current: number; // 0-100
    target: number;
    steps: Array<{ name: string; completed: boolean }>;
  };
  
  earningsProgress: {
    current: number;
    goal: number;
    monthly: Array<{ month: string; amount: number; projected: number }>;
  };
  
  jobs: {
    completed: number;
    inProgress: number;
    total: number;
    successRate: number;
  };
  
  skills: {
    total: number;
    avgProficiency: number;
    topSkills: Array<{ name: string; level: number; trend: 'up' | 'stable' | 'down' }>;
  };
}

interface ProgressGraphProps {
  data?: ProgressData;  // Data can be optional since we might fetch it
  title?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
  onPeriodChange?: (period: string) => void;
}

const ProgressGraph: React.FC<ProgressGraphProps> = ({
  title = 'Your Progress',
  period = 'month',
  onPeriodChange
}) => {
  const [data, setData] = useState<ProgressData | null>(null); // State to store fetched data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch data on component mount
  useEffect(() => {
    fetchProgressData();
  }, []);

  // Function to fetch progress data
  const fetchProgressData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await API.get('/freelancer/progress');
      setData(result.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast.error('Failed to load progress data');
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh dashboard data
  const refreshDashboardData = async () => {
    try {
      await API.put('/freelancer/dashboard/refresh');
      toast.success('Dashboard data refreshed!');
      // Refetch the data
      await fetchProgressData();
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      toast.error('Failed to refresh dashboard data');
    }
  };

  // Calculate derived metrics using useMemo to optimize performance
  const metrics = useMemo(() => {
    if (!data) return { profilePct: 0, earningsPct: 0, jobsPct: 0 };
    
    const profilePct = data.profileCompletion.current;
    const earningsPct = Math.min(
      (data.earningsProgress.current / data.earningsProgress.goal) * 100, 
      100
    );
    const jobsPct = data.jobs.total > 0 
      ? (data.jobs.completed / data.jobs.total) * 100 
      : 0;
    
    return { profilePct, earningsPct, jobsPct };
  }, [data]); // Recalculate when `data` changes

  // Prepare chart data for earnings
  const earningsChartData = useMemo(() => {
    if (!data) return [];
    
    return data.earningsProgress.monthly.map(m => ({
      month: m.month,
      actual: m.amount,
      projected: m.projected,
      pv: m.amount, // For Recharts
      uv: m.projected
    }));
  }, [data]);

  // Radial progress data
  const radialData = useMemo(() => [
    { name: 'Profile', value: metrics.profilePct, fill: '#06B6D4' },
    { name: 'Earnings', value: metrics.earningsPct, fill: '#3B82F6' },
    { name: 'Jobs', value: metrics.jobsPct, fill: '#8B5CF6' },
  ], [metrics]);

  // If data is still loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there is an error fetching data
  if (error) {
    return <div>Error: {error}</div>;
  }

  // If no data is available
  if (!data) {
    return <div>No data available</div>;
  }

  // Custom tooltip for earnings chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700">
          <p className="font-bold text-lg mb-2">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="flex items-center gap-2 text-sm" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <SectionCard 
      title={title}
      subtitle="Track your growth across all metrics"
      icon={<TrendingUp className="w-6 h-6" />}
      variant="default"
      className="col-span-1 lg:col-span-2"
    >
      {/* Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-600" />
          <span className="text-slate-700 font-medium">Viewing:</span>
          <select 
            value={period}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none cursor-pointer"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:bg-cyan-400 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="font-medium">Refresh</span>
        </button>

        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500">Avg. Rating</p>
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="font-bold text-slate-900">4.8</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Response Time</p>
            <span className="font-bold text-slate-900">2.4h</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Earnings Trend Chart */}
        <div className="bg-slate-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 text-lg">Earnings Trend</h4>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              +{((metrics.earningsPct - 50)).toFixed(1)}% vs goal
            </span>
          </div>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <AreaChart data={earningsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => <span className="text-slate-700 text-sm">{value}</span>}
                />
                <Area 
                  type="monotone" 
                  dataKey="pv" 
                  name="Actual" 
                  stroke="#06B6D4" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPv)" 
                  dot={{ r: 4, fill: '#06B6D4', stroke: 'white', strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="uv" 
                  name="Projected" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorUv)" 
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Radial Chart */}
        <div className="bg-slate-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 text-lg">Progress Overview</h4>
            <Award className="w-5 h-5 text-cyan-600" />
          </div>
          
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="80%" 
                barSize={12} 
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background={{ fill: '#e2e8f0' }}
                  dataKey="value"
                  cornerRadius={10}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#0F172A', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '14px'
                  }}
                  formatter={(value: any) => {
                    if (value === undefined || value === null) return ['0%', 'Progress'];
                    return [`${(+value).toFixed(1)}%`, 'Progress'];
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {radialData.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-slate-700 text-sm font-medium">{item.name}</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{item.value.toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completion Steps */}
        <div className="xl:col-span-2 bg-linear-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 border border-cyan-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-cyan-600" />
              <h4 className="font-bold text-slate-900 text-lg">Profile Completion</h4>
            </div>
            <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full font-bold">
              {data.profileCompletion.current}% Complete
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${data.profileCompletion.current}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-linear-to-r from-cyan-500 to-blue-600 rounded-full"
            />
            {/* Target Marker */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-red-500"
              style={{ left: `${data.profileCompletion.target}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-red-500 text-white text-xs rounded font-medium whitespace-nowrap">
                Goal: {data.profileCompletion.target}%
              </div>
            </div>
          </div>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {data.profileCompletion.steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  step.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-slate-200 hover:border-cyan-300'
                }`}
              >
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {step.completed ? '✓' : idx + 1}
                </div>
                <p className={`text-sm font-medium ${
                  step.completed ? 'text-green-700' : 'text-slate-600'
                }`}>
                  {step.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Skills Progress */}
        <div className="xl:col-span-2">
          <div className="bg-slate-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 text-lg">Top Skills Progress</h4>
              <span className="text-slate-500 text-sm">
                Avg. Proficiency: <span className="font-bold text-cyan-600">{data.skills.avgProficiency}%</span>
              </span>
            </div>
            
            <div className="space-y-4">
              {data.skills.topSkills.map((skill, idx) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4"
                >
                  {/* Skill Name */}
                  <div className="w-32 shrink-0">
                    <span className="font-medium text-slate-900 text-base">{skill.name}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flex-1">
                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${
                          skill.level > 80 ? 'bg-linear-to-r from-cyan-400 to-cyan-600' :
                          skill.level > 50 ? 'bg-linear-to-r from-blue-400 to-blue-600' :
                          'bg-linear-to-r from-slate-400 to-slate-600'
                        }`}
                      />
                    </div>
                  </div>
                  
                  {/* Level & Trend */}
                  <div className="flex items-center gap-3 w-24 justify-end">
                    <span className="font-bold text-slate-900 w-10 text-right">{skill.level}%</span>
                    {skill.trend === 'up' && (
                      <span className="text-green-600 text-sm">↑</span>
                    )}
                    {skill.trend === 'down' && (
                      <span className="text-red-600 text-sm">↓</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-500">Jobs Completed</p>
            <p className="text-2xl font-bold text-slate-900">{data.jobs.completed}/{data.jobs.total}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">{data.jobs.successRate}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Skills Mastered</p>
            <p className="text-2xl font-bold text-cyan-600">{data.skills.total}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          View Detailed Analytics
        </motion.button>
      </div>
    </SectionCard>
  );
};

export default ProgressGraph;