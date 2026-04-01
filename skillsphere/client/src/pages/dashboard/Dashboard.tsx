
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
   XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  LayoutDashboard, Briefcase, DollarSign, Users, MessageSquare, 
  Search, Settings, Plus, MapPin, TrendingUp, Clock, Award
} from "lucide-react";

// --- MOCK DATA ---
const chartData = [
  { name: "Jan", amount: 4000 },
  { name: "Feb", amount: 3000 },
  { name: "Mar", amount: 2000 },
  { name: "Apr", amount: 2780 },
  { name: "May", amount: 1890 },
  { name: "Jun", amount: 2390 },
  { name: "Jul", amount: 3490 },
];

// --- Sidebar Props ---
interface SidebarProps {
  role: string; // role will be a string like "Client" or "Creator"
}

// --- StatCard Props ---
interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>; // Icon component from lucide-react
  colorClass?: string;
}


// Define User Type
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

const recentActivity = [
  { id: 1, title: "Logo Design Project", status: "In Progress", date: "2 hours ago", type: "project" },
  { id: 2, title: "Payment Received", status: "$500 Milestone", date: "5 hours ago", type: "money" },
  { id: 3, title: "New Proposal: Website", status: "Pending Review", date: "1 day ago", type: "proposal" },
  { id: 4, title: "Profile Optimized", status: "AI Suggestion Applied", date: "2 days ago", type: "ai" },
];

// --- COMPONENTS ---

// 1. Sidebar Component
const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
    { icon: MapPin, label: "Local Talent", path: "/talent" }, // Highlights hyperlocal aspect
    { icon: Briefcase, label: "Projects", path: "/projects" },
    { icon: DollarSign, label: "Payments", path: "/payments" },
    { icon: Users, label: "Team & Hiring", path: "/team" },

  ];

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 border-r border-slate-800 flex flex-col justify-between">
      <div>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <h1 className="text-white text-xl font-bold tracking-wide">SKILLSPHERE</h1>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300 group"
            >
              <item.icon size={20} className="group-hover:text-cyan-400 transition-colors" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          {/* Hyperlocal Feature Badge */}
          <div className="mt-8 px-4">
             <div className="bg-linear-to-r from-cyan-900 to-blue-900 p-4 rounded-xl border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-cyan-400 w-4 h-4" />
                  <span className="text-xs font-bold text-cyan-100 uppercase tracking-wider">Hyperlocal</span>
                </div>
                <p className="text-slate-300 text-xs leading-tight mb-3">
                  You are matching with professionals within a 5km radius.
                </p>
                <button className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold rounded-lg transition-colors">
                  Explore Locals
                </button>
             </div>
          </div>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
        <div className="mt-4 px-4 flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold border-2 border-white/10">
             {role ? role.charAt(0).toUpperCase() : 'U'}
           </div>
           <div className="flex-1 overflow-hidden">
             <p className="text-sm font-bold text-white truncate">{user?.name}</p>
             <p className="text-xs text-slate-400 truncate">{role} Mode</p>
           </div>
        </div>
      </div>
    </div>
  );
};

// 2. Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        <p className={`text-xs font-semibold mt-2 ${colorClass}`}>{subtext}</p>
      </div>
       <div className={`p-3 rounded-xl ${colorClass? colorClass.replace('text-', 'bg-').replace('600', '50') : ''}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

   useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);


  useEffect(() => {
    // Simulating an initial load or checking auth
    const timer = setTimeout(() => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/");
      } else {
        const userData = JSON.parse(storedUser);
        setUserRole(userData.role);
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Dynamic content based on role
  const welcomeMessage = userRole === "client" 
    ? `Welcome Back ${user?.name} [${user?.role}]! Here's what's happening in your projects.` 
    : `Hello ${user?.name} [${user?.role}]! Your portfolio is performing well.`;

  const primaryActionText = userRole === "client" ? "Post a Job" : "Find Jobs";
  const highlightTitle = userRole === "freelancer" ? "Hiring Needs" : "Earnings Growth";

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar */}
      <Sidebar role={userRole} />

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{welcomeMessage}</h2>
            <p className="text-slate-500 mt-1">AI Analysis: High probability of matches in {new Date().toLocaleDateString()}.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clients, skills, or jobs..." 
                className="pl-10 pr-4 py-2.5 rounded-full bg-white border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none w-64 transition-all"
              />
            </div>

            <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-cyan-500/20">
              <Plus size={18} />
              {primaryActionText}
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title={userRole === 'client' ? "Active Projects" : "Total Earnings"} 
            value="$12,450" 
            subtext="+18% from last month" 
            icon={DollarSign} 
            colorClass="text-emerald-600" 
          />
          <StatCard 
            title={userRole === 'client' ? "Proposals Sent" : "Active Gigs"} 
            value="14" 
            subtext="Pending client response" 
            icon={Briefcase} 
            colorClass="text-indigo-600" 
          />
           <StatCard 
            title="AI Match Score" 
            value="88/100" 
            subtext="Excellent local presence" 
            icon={TrendingUp} 
            colorClass="text-cyan-600" 
          />
          <StatCard 
            title="Messages" 
            value="6 Pending" 
            subtext="Reply within 24hrs" 
            icon={MessageSquare} 
            colorClass="text-orange-500" 
          />
        </div>

        {/* Main Dashboard Area: Chart & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <Award className="text-cyan-500" size={20}/> 
                   {highlightTitle}
                 </h3>
                 <p className="text-sm text-slate-500">Real-time performance analytics</p>
              </div>
              <select className="bg-slate-50 border-none text-sm rounded-lg px-3 py-1 cursor-pointer text-slate-600">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
            
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-91.5">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Real-time Updates</h3>
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex gap-4 items-start group cursor-pointer">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 
                    ${item.type === 'money' ? 'bg-emerald-500' : 
                      item.type === 'project' ? 'bg-cyan-500' : 
                      item.type === 'ai' ? 'bg-purple-500' : 'bg-slate-300'}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                       <p className="text-xs text-slate-500 flex items-center gap-1">
                         <Clock size={12} /> {item.date}
                       </p>
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium 
                         ${item.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 
                           item.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                         {item.status}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-2 text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors">
                View All Activity
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommendation Bar */}
        <div className="mt-8">
          <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="max-w-lg">
                 <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                   <span className="bg-white/20 p-1.5 rounded-lg">🚀</span> 
                   SkillSphere Smart Suggestions
                 </h3>
                 <p className="text-blue-100 text-sm opacity-90">
                   Based on your recent project history, we found <strong>3 High-value Freelancers</strong> in your city specializing in {userRole === 'client' ? 'Full Stack Dev' : 'React.js Development'}.
                 </p>
               </div>
               <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg">
                 View Matches
               </button>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}