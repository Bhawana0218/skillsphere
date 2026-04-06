import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Menu, 
  X, 
  Users,
  Home,
  FileText,
  LayoutDashboard,
  Briefcase,
  MessageSquare
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";


interface Proposal {
  _id: string;

  job: {
    _id: string;
    title: string;
  };

  freelancer: {
    name: string;
    email: string;
  };
  status: "pending" | "accepted" | "rejected" | "in_progress";
  createdAt?: string;
}

interface UserData {
  _id: string;
  role: "client" | "freelancer";
  name?: string;
  email?: string;
  avatar?: string;
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const navbarRef = useRef<HTMLDivElement>(null);

  // Safe user parser with useCallback to prevent re-renders
  const getUser = useCallback((): UserData | null => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }, []);

  const currentUser = getUser();
  const role = currentUser?.role;

  // State management
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [proposalsDropdownOpen, setProposalsDropdownOpen] = useState(false);

  // Fetch navbar data efficiently
  useEffect(() => {
    // let isMounted = true;

    const fetchData = async () => {
      if (!token || !currentUser?._id) {
        return;
      }

      try {
        const res = await API.get(`/proposals/client/${currentUser._id}`);
        setProposals(res.data || []);
      } catch (err) {
        console.error("Navbar fetch error:", err);
        toast.error("Failed to load Data!");
      } 
    };

    fetchData();
  }, [token, currentUser?._id, role]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!navbarRef.current?.contains(target)) {
        setUserDropdownOpen(false);
        setProposalsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setProposalsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Reusable NavLink component
  const NavLink = ({ 
    to, 
    children, 
    mobile = false,
    onClick,
    active 
  }: { 
    to: string; 
    children: React.ReactNode; 
    mobile?: boolean;
    onClick?: () => void;
    active?: boolean;
  }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`
        ${mobile ? "block py-2.5 px-4 rounded-lg" : "py-2 px-3 rounded-md"} 
        ${active || isActive(to)
          ? "text-white bg-[#00072D]/80" 
          : "text-gray-300 hover:text-white hover:bg-slate-800/60"
        } 
        transition-all duration-200 font-medium text-sm flex items-center gap-1.5
      `}
    >
      {children}
    </Link>
  );

  // Compact badge for counts
  const CountBadge = ({ count }: { count: number }) => (
    <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-blue-600 rounded-full min-w-4 h-4">
      {count > 99 ? "99+" : count}
    </span>
  );

  // Subtle notification indicator
  const NotificationDot = () => (
    <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900 animate-pulse" />
  );

  return (
    <nav 
      ref={navbarRef}
      className="bg-[#00072D] text-gray-300 font-medium px-4 lg:px-6 rounded-xl mt-4 mx-4 flex justify-between items-center shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50"
    >
      {/* Logo Section */}
      <div className="flex items-center shrink-0">
        {token ? (
          <img
            src="/Logo.png"
            alt="SkillSphere"
            className="h-42 w-70 -my-10 cursor-pointer object-contain select-none"
            onClick={() => navigate("/home")}
            title="Go to Home"
          />
        ) : (
          <h1
            className="text-xl font-bold cursor-pointer hover:text-white transition-colors select-none"
            onClick={() => navigate("/")}
            title="SkillSphere Home"
          >
            SkillSphere
          </h1>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
        {/* Common Links */}
        <NavLink to="/home" active={location.pathname === "/home"}>
          <Home className="w-4 h-4" />
          Home
        </NavLink>
       

        {/* Freelancer Routes */}
        {role === "freelancer" && (
          <>
            <NavLink to="/freelancer/dashboard"><LayoutDashboard className="w-4 h-4"/>Dashboard</NavLink>
            <NavLink to="/jobs">Browse Jobs</NavLink>
            <NavLink to="/freelancer/proposals">
              My Proposals
              {proposals.length > 0 && <CountBadge count={proposals.length} />}
            </NavLink>
          </>
        )}

        {/* Client Routes */}
        {role === "client" && (
          <>
           <NavLink to="/freelancers" mobile onClick={() => setMobileMenuOpen(false)}>
              <Users className="w-4 h-4" />
                 Freelancers
            </NavLink>
            <NavLink to="/client/dashboard"><LayoutDashboard className="w-4 h-4"/>Dashboard</NavLink>
            <NavLink to="/jobs">My Jobs</NavLink>

            {/* Proposals Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProposalsDropdownOpen(!proposalsDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className={`
                  flex items-center gap-1 py-2 px-3 rounded-md text-sm font-medium
                  ${location.pathname.includes('/proposals') 
                    ? "text-white bg-slate-800/80" 
                    : "text-gray-300 hover:text-white hover:bg-slate-800/60"
                  } 
                  transition-all duration-200
                `}
                title="View Proposals"
              >
                <FileText className="w-4 h-4" />
                Proposals
                {proposals.length > 0 && <CountBadge count={proposals.length} />}
                {proposals.length > 0 && <NotificationDot />}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${proposalsDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {proposalsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-700/80">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                      Recent Proposals
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                          {proposals.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                         No proposals yet
                  </div>
                 ) : (
                   
                    proposals.slice(0, 5).map((proposal) => (
                    <Link
                       key={proposal._id}
                       to={`/jobs/${proposal.job?._id}/proposals/${proposal._id}`}
                       onClick={() => setProposalsDropdownOpen(false)}
                       className="block px-4 py-2.5 hover:bg-slate-700/80 transition-colors group"
                >
                <div className="flex justify-between">
                 <div>
                    <p className="text-sm text-white">
                       {proposal.freelancer?.name}
                    </p>
                 </div>

                 <span className="text-xs">
                    {proposal.status}
                 </span>
                </div>
               </Link>
            )))}
                  </div>
                  {proposals.length > 5 && (
                    <div className="px-3 py-2 border-t border-slate-700/80">
                      <Link
                        to="/client/proposals"
                        onClick={() => setProposalsDropdownOpen(false)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        View all {proposals.length} →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* User Dropdown (Authenticated) */}
        {token && currentUser && (
          <div className="relative ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserDropdownOpen(!userDropdownOpen);
                setProposalsDropdownOpen(false);
              }}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              title={`Welcome, ${currentUser.name || "User"}`}
            >
              <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-white font-semibold text-[11px] shrink-0">
                {currentUser.name?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#00072D] rounded-lg shadow-xl border border-slate-700 py-1 z-50 overflow-hidden">
                <div className="px-3 py-2.5 border-b border-slate-700/80">
                  <p className="text-sm font-medium text-white truncate">
                    {currentUser.name || "User"}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {currentUser.role === "client" ? "Client Account" : "Freelancer Account"}
                  </p>
                </div>
                
                <Link
                  to="/client/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700/80 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                
                <Link
                  to="/settings/security"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700/80 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Security
                </Link>
                
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700/80 transition-colors text-left mt-1 border-t border-slate-700/50 pt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Auth Buttons (Guest) */}
        {!token && (
          <div className="flex items-center gap-1.5 ml-2">
            <Link
              to="/login"
              className="px-3.5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-700 shadow-xl z-40 max-h-[85vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-0.5">
            {/* Common Links */}
            <NavLink to="/home" mobile onClick={() => setMobileMenuOpen(false)} active={location.pathname === "/home"}>
              <Home className="w-4 h-4" />
              Home
            </NavLink>

            {/* Freelancer Routes */}
            {role === "freelancer" && (
              <>
                <NavLink to="/freelancer/dashboard" mobile onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </NavLink>
                <NavLink to="/jobs" mobile onClick={() => setMobileMenuOpen(false)}>
                  <Briefcase className="w-4 h-4" />
                  Browse Jobs
                </NavLink>
                <NavLink to="/freelancer/proposals" mobile onClick={() => setMobileMenuOpen(false)}>
                  <MessageSquare className="w-4 h-4" />
                  My Proposals
                  {proposals.length > 0 && <CountBadge count={proposals.length} />}
                </NavLink>
              </>
            )}

            {/* Client Routes */}
            {role === "client" && (
              <>

               <NavLink to="/freelancers" mobile onClick={() => setMobileMenuOpen(false)}>
                 <Users className="w-4 h-4" />
                       Freelancers
              </NavLink>
               
                <NavLink to="/client/dashboard" mobile onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard className="w-4 h-4"/>Dashboard</NavLink>
                <NavLink to="/jobs" mobile onClick={() => setMobileMenuOpen(false)}>My Jobs</NavLink>

                {/* Mobile Proposals List */}
                {proposals.length > 0 && (
                  <div className="py-1.5">
                    <p className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                      Proposals ({proposals.length})
                    </p>
                    {proposals.slice(0, 4).map((proposal) => (
                      <Link
                       key={proposal._id}
                       to={`/jobs/${proposal.job._id}/proposals/${proposal._id}`}
                       onClick={() => setMobileMenuOpen(false)}
                       className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                       >
                        <div className="flex items-center justify-between gap-2">
                          
                          {/* Freelancer Name */}
                          <span className="truncate">
                            {proposal.freelancer.name}
                          </span>
                          
                        {/* Status Badge */}
                        <span
                        className={`
                          text-[10px] px-1.5 py-0.5 rounded shrink-0
                          ${proposal.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : ""}
                          ${proposal.status === "accepted" ? "bg-green-500/20 text-green-400" : ""}
                          ${proposal.status === "rejected" ? "bg-red-500/20 text-red-400" : ""}
                          ${proposal.status === "in_progress" ? "bg-blue-500/20 text-blue-400" : ""}
                        `}
                        >
                          {proposal.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                    {proposals.length > 4 && (
                      <Link
                        to="/client/proposals"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-1.5 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        View all {proposals.length} proposals →
                      </Link>
                    )}
                  </div>
                )}
               
              </>
            )}

            {/* Auth Section */}
            {token && currentUser ? (
              <>
                <div className="border-t border-slate-700/80 pt-3 mt-2">
                  <div className="px-4 py-2.5">
                    <p className="text-sm font-medium text-white truncate">
                      {currentUser.name || "User"}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {currentUser.email?.slice(0, 20)}{currentUser.email && currentUser.email.length > 20 ? "..." : ""}
                    </p>
                  </div>
                  <NavLink to="/client/profile" mobile onClick={() => setMobileMenuOpen(false)}>
                    <User className="w-4 h-4" />
                    Profile
                  </NavLink>
                  <NavLink to="/settings/security" mobile onClick={() => setMobileMenuOpen(false)}>
                    <Settings className="w-4 h-4" />
                    Security
                  </NavLink>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800/60 rounded-lg transition-colors text-left mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-slate-700/80 pt-3 mt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 px-4 py-2.5 text-center text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 px-4 py-2.5 text-center text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;