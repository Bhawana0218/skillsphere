// import { useEffect, useState } from "react";
// import { Link, useNavigate} from "react-router-dom";
// import API from "../services/api";

// interface Job {
//   _id: string;
//   title: string;
//   description: string;
//   skillsRequired: string[];
//   budget: string;
//   deadline: string;
// }

// interface Proposal {
//   _id: string;
//   jobId: string;
//   freelancerName: string;
//   status: string;
// }


// const Navbar = () => {

//   const [job, setJob] = useState<Job | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [proposals, setProposals] = useState<Proposal[]>([]);

//   useEffect(() => {
//     const fetchJob = async () => {
//       try {
//         const response = await API.get("/jobs/latest"); // adjust endpoint
//         setJob(response.data); // assuming response.data is the job object
//       } catch (error) {
//         console.error("Failed to fetch job:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJob();
//   }, []);

//   useEffect(() => {
//   const fetchJob = async () => {
//     try {
//       const response = await API.get("/jobs/latest"); 
//       setJob(response.data);
//     } catch (error) {
//       console.error("Failed to fetch job:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchJob();


//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");
//   const user = (() => {
//     try {
//       return JSON.parse(localStorage.getItem("user") || "null") as { role?: string } | null;
//     } catch {
//       return null;
//     }
//   })();
//   const role = user?.role;

//   const handleLogout = () => {
//   localStorage.clear();

//   // force redirect + refresh
//   window.location.href = "/"; 
//   };

//   const fetchProposals = async () => {
//     if (role === "client" && user?._id) {
//       try {
//         const res = await API.get(`/proposals/client/${user._id}`);
//         setProposals(res.data); // assuming backend returns array of proposals
//       } catch (err) {
//         console.error("Failed to fetch proposals:", err);
//       }
//     }
//   };

//   fetchProposals();
// }, [role, user?._id]);

//   return (
//     <nav className="bg-slate-900 text-gray-300 font-semibold px-6 py-3 flex justify-between items-center shadow-md fixed top-0 w-full z-50 border-b border-gray-300">
//     {/*  <nav className="bg-gray-900 text-white px-6 py-1 flex justify-between items-center shadow-md sticky top-0 z-50"> */}
      
//       {/* Logo */}
//       {token ? (
//   <img
//     src="/Logo.png"
//     alt="Logo"
//     className="h-42 w-70 -my-10 cursor-pointer"
//     onClick={() => navigate("/home")}
//   />
// ) : (
//   <h1
//     className="text-xl font-bold cursor-pointer"
//     onClick={() => navigate("/")}
//   >
//     SkillSphere
//   </h1>
// )}

//       {/* Links */}
//       <div className="flex gap-6 items-center flex-wrap">

//         <Link to="/home" className="hover:text-white">
//           Home
//         </Link>

//         {/* <Link to="freelancer/dashboard" className="hover:text-white">
//           Client Dashboard
//         </Link> */}

//         {role === "freelancer" && (
//           <>
//             <Link to="/freelancer/dashboard" className="hover:text-white">
//               Freelancer Dashboard
//             </Link>
//             <Link to="/freelancer/profile" className="hover:text-white">
//               Freelancer Profile
//             </Link>
//           </>
//         )}

//         {role === "client" && (
//           <Link to="/client/dashboard" className="hover:text-white">
//             Client Dashboard
//           </Link>
//         )}

//         {!loading && job && (
//         <Link to={`/jobs/${job._id}`}>{job.title}</Link>
//       )}

//         <Link to="/freelancers" className="hover:text-white">
//           Freelancers
//         </Link>

//         <Link to="/create-job" className="hover:text-white">
//           Create Job
//         </Link>

//         {/* Proposals are accessed from Client Dashboard when viewing individual jobs */}
       
//         {/* Book Slot is accessed from Freelancer profiles or Job Details */}

//         <Link to="/profile" className="hover:text-white">
//           Profile
//         </Link>

//         {role === "client" && proposals.length > 0 && (
//   <div className="relative group">
//     <button className="hover:text-white">
//       Proposals ({proposals.length})
//     </button>
//     <div className="absolute hidden group-hover:block bg-gray-800 text-white mt-1 rounded shadow-lg">
//       {proposals.map((p) => (
//         <Link
//           key={p._id}
//           to={`/jobs/${p.jobId}/proposals/${p._id}`}
//           className="block px-4 py-2 hover:bg-gray-700"
//         >
//           {p.freelancerName} - {p.status}
//         </Link>
//       ))}
//     </div>
//   </div>
// )}

//         {token ? (
//           <Link to="/settings/security" className="hover:text-white">
//             Security
//           </Link>
//         ) : null}

//         {/* Auth Buttons */}
//         {token ? (
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
//           >
//             Logout
//           </button>
//         ) : (
//           <>
//             <Link to="/" className="hover:text-white">
//               Login
//             </Link>
//             <Link
//               to="/register"
//               className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
//             >
//               Register
//             </Link>
//           </>
//         )}

      
//       </div>
//     </nav>
     
//   );
// };

// export default Navbar;







import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

interface Job {
  _id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  budget: string;
  deadline: string;
}

interface Proposal {
  _id: string;
  jobId: string;
  freelancerName: string;
  status: string;
}

interface User {
  _id: string;
  role: "client" | "freelancer";
  name?: string;
}

const Navbar = () => {
  const navigate = useNavigate(); 
  const token = localStorage.getItem("token");

  // Parse user safely
  const user: User | null = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const role = user?.role;

  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest job and proposals (for client) in a single effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest job
        const jobRes = await API.get("/jobs/latest");
        setJob(jobRes.data);

        // Fetch client proposals
        if (role === "client" && user?._id) {
          const propRes = await API.get(`/proposals/client/${user._id}`);
          setProposals(propRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role, user?._id]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="bg-slate-900 text-gray-300 font-semibold px-6 py-3 flex justify-between items-center shadow-md fixed top-0 w-full z-50 border-b border-gray-300">
      {/* Logo */}
      {token ? (
        <img
          src="/Logo.png"
          alt="Logo"
          className="h-42 w-70 -my-10 cursor-pointer"
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
        <Link to="/home" className="hover:text-white">
          Home
        </Link>

        {role === "freelancer" && (
          <>
            <Link to="/freelancer/dashboard" className="hover:text-white">
              Freelancer Dashboard
            </Link>
            <Link to="/freelancer/profile" className="hover:text-white">
              Freelancer Profile
            </Link>
          </>
        )}

        {role === "client" && (
          <Link to="/client/dashboard" className="hover:text-white">
            Client Dashboard
          </Link>
        )}

        {/* Latest Job */}
        {!loading && job && (
          <Link to={`/jobs/${job._id}`} className="hover:text-white">
            {job.title}
          </Link>
        )}

        <Link to="/freelancers" className="hover:text-white">
          Freelancers
        </Link>

        <Link to="/create-job" className="hover:text-white">
          Create Job
        </Link>

        {/* Proposals Dropdown for Client */}
        {role === "client" && proposals.length > 0 && (
          <div className="relative group">
            <button className="hover:text-white">
              Proposals ({proposals.length})
            </button>
            <div className="absolute hidden group-hover:block bg-gray-800 text-white mt-1 rounded shadow-lg">
              {proposals.map((p) => (
                <Link
                  key={p._id}
                  to={`/jobs/${p.jobId}/proposals/${p._id}`}
                  className="block px-4 py-2 hover:bg-gray-700"
                >
                  {p.freelancerName} - {p.status}
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link to="/profile" className="hover:text-white">
          Profile
        </Link>

        {token && (
          <Link to="/settings/security" className="hover:text-white">
            Security
          </Link>
        )}

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
            <Link to="/" className="hover:text-white">
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