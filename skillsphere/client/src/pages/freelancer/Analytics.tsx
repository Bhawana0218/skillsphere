import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Eye, Briefcase, DollarSign, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface AnalyticsData {
  profileViews: { date: string; views: number; uniqueVisitors: number }[];
  gigApplications: { month: string; applied: number; accepted: number }[];
  earnings: { month: string; amount: number; projected: number }[];
  feedback: { rating: number; count: number; avgRating: number };
  totalEarnings: number;
  totalGigs: number;
  avgResponseTime: number;
}

const dummyData: AnalyticsData = {
  profileViews: [
    { date: 'Jan 1', views: 25, uniqueVisitors: 12 },
    { date: 'Jan 2', views: 42, uniqueVisitors: 18 },
    { date: 'Jan 3', views: 58, uniqueVisitors: 24 },
    { date: 'Jan 4', views: 73, uniqueVisitors: 29 },
    { date: 'Jan 5', views: 91, uniqueVisitors: 35 },
    { date: 'Jan 6', views: 105, uniqueVisitors: 41 },
    { date: 'Jan 7', views: 120, uniqueVisitors: 47 }
  ],
  gigApplications: [
    { month: 'Jan', applied: 12, accepted: 3 },
    { month: 'Feb', applied: 18, accepted: 5 },
    { month: 'Mar', applied: 25, accepted: 8 },
    { month: 'Apr', applied: 32, accepted: 12 }
  ],
  earnings: [
    { month: 'Jan', amount: 25000, projected: 30000 },
    { month: 'Feb', amount: 38000, projected: 42000 },
    { month: 'Mar', amount: 52000, projected: 58000 },
    { month: 'Apr', amount: 68000, projected: 75000 },
    { month: 'May', amount: 85000, projected: 92000 }
  ],
  feedback: { rating: 4.8, count: 27, avgRating: 4.8 },
  totalEarnings: 185000,
  totalGigs: 45,
  avgResponseTime: 2.3
};

const COLORS = ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'];

const FreelancerAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>(dummyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/freelancer/analytics');
        setData(res.data || dummyData);
      } catch (err) {
        toast.error('Using demo data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-14 h-14 border-4 border-cyan-200 border-t-cyan-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 bg-linear-to-br from-slate-50 via-white to-blue-50 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-100 px-5 py-2 rounded-full text-cyan-700 font-semibold mb-4">
            <TrendingUp className="w-4 h-4" />
            Analytics Hub
          </div>
          <h1 className="text-4xl font-bold mb-2 text-slate-900">
            Your Performance Intelligence
          </h1>
          <p className="text-slate-600">
            Track growth, revenue, and success insights in one place
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard icon={<Eye />} title="Views" value={data.profileViews.at(-1)?.views || 0} />
          <StatCard icon={<Briefcase />} title="Gigs" value={data.totalGigs} />
          <StatCard icon={<DollarSign />} title="Earnings" value={`₹${data.totalEarnings.toLocaleString()}`} />
          <StatCard icon={<Star />} title="Rating" value={data.feedback.avgRating.toFixed(1)} />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8">

          <ChartCard title="Profile Views">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.profileViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="views" stroke="#06b6d4" strokeWidth={2} />
                <Line dataKey="uniqueVisitors" stroke="#0891b2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Applications">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.gigApplications}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applied" fill="#10b981" />
                <Bar dataKey="accepted" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.earnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area dataKey="amount" stroke="#f59e0b" fill="#fde68a" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Feedback">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: '5★', value: 18 },
                    { name: '4★', value: 6 },
                    { name: '3★', value: 2 },
                    { name: '2★', value: 1 },
                    { name: '1★', value: 0 }
                  ]}
                  dataKey="value"
                  outerRadius={90}
                  label
                >
                  {COLORS.map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="text-center mt-4">
              <h3 className="text-2xl font-bold text-slate-900">
                {data.feedback.avgRating.toFixed(1)}/5
              </h3>
              <p className="text-slate-500 text-sm">
                {data.feedback.count} reviews
              </p>
            </div>
          </ChartCard>

        </div>

        {/* CTA */}
        <div className="text-center bg-white shadow rounded-2xl p-10 border">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Ready to grow faster?
          </h2>
          <p className="text-slate-600 mb-6">
            Optimize your gigs and increase client conversions
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700">
              Upgrade
            </button>
            <button className="px-6 py-3 border rounded-xl">
              Share
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* Reusable Components */

const StatCard = ({ icon, title, value }: any) => (
  <div className="bg-white p-5 rounded-xl shadow border flex justify-between items-center">
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="text-xl font-bold text-slate-900">{value}</h2>
    </div>
    <div className="text-cyan-600">{icon}</div>
  </div>
);

const ChartCard = ({ title, children }: any) => (
  <div className="bg-white p-6 rounded-xl shadow border">
    <h3 className="font-semibold mb-4 text-slate-800">{title}</h3>
    {children}
  </div>
);

export default FreelancerAnalytics;