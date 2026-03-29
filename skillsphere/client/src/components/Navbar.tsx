import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null") as { role?: string } | null;
    } catch {
      return null;
    }
  })();
  const role = user?.role;

  const handleLogout = () => {
  localStorage.clear();

  // force redirect + refresh
  window.location.href = "/"; 
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-1 flex justify-between items-center shadow-md sticky top-0 z-50">
      
      {/* Logo */}
      {token ? (
  <img
    src="/Logo.png"
    alt="Logo"
    className="h-40 w-48 -my-10 cursor-pointer"
    onClick={() => navigate("/home")}
  />
) : (
  <h1
    className="text-xl font-bold cursor-pointer"
    onClick={() => navigate("/")}
  >
    SkillSphere
  </h1>
)}

      {/* Links */}
      <div className="flex gap-6 items-center flex-wrap">

        <Link to="/home" className="hover:text-blue-400">
          Home
        </Link>

        {/* <Link to="freelancer/dashboard" className="hover:text-blue-400">
          Client Dashboard
        </Link> */}

        {role === "freelancer" && (
          <>
            <Link to="/freelancer/dashboard" className="hover:text-blue-400">
              Freelancer Dashboard
            </Link>
            <Link to="/freelancer/profile" className="hover:text-blue-400">
              Freelancer Profile
            </Link>
          </>
        )}

        {role === "client" && (
          <Link to="/client/dashboard" className="hover:text-blue-400">
            Client Dashboard
          </Link>
        )}

        <Link to="/jobs" className="hover:text-blue-400">
          Jobs
        </Link>

        <Link to="/freelancers" className="hover:text-blue-400">
          Freelancers
        </Link>

        <Link to="/create-job" className="hover:text-blue-400">
          Create Job
        </Link>

        <Link to="/proposals/1" className="hover:text-blue-400">
          Proposal (sample)
        </Link>

        <Link to="/book-slot/1/1" className="hover:text-blue-400">
          Book Slot (sample)
        </Link>

        <Link to="/profile" className="hover:text-blue-400">
          Profile
        </Link>

        {token ? (
          <Link to="/settings/security" className="hover:text-blue-400">
            Security
          </Link>
        ) : null}

        {/* Auth Buttons */}
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/" className="hover:text-blue-400">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
            >
              Register
            </Link>
          </>
        )}

      
      </div>
    </nav>
     
  );
};

export default Navbar;