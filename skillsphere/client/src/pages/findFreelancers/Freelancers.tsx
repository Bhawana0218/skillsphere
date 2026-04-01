// import { useState } from "react";
// import type { ChangeEvent } from "react";
// import API from "../../services/api";

// // Profile Type
// interface Profile {
//   _id: string;
//   hourlyRate: string;
//   user: {
//     name: string;
//   };
// }

// // Filters Type
// interface Filters {
//   skill: string;
//   minRate: string;
//   maxRate: string;
// }

// function Freelancers() {
//   const [profiles, setProfiles] = useState<Profile[]>([]);
//   const [filters, setFilters] = useState<Filters>({
//     skill: "",
//     minRate: "",
//     maxRate: "",
//   });

//   const search = async () => {
//   try {
//     const query = new URLSearchParams({
//       skill: filters.skill,
//       minRate: filters.minRate,
//       maxRate: filters.maxRate,
//     }).toString();

//     const { data } = await API.get<Profile[]>(`/profile/search?${query}`);
//     setProfiles(data);
//   } catch (error) {
//     console.error(error);
//   }
// };

//   // Handle Input Change
//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setFilters({
//       ...filters,
//       [e.target.name]: e.target.value,
//     });
//   };

//   return (
//     <div className="p-10 bg-gray-900 text-white min-h-screen">
//       <h1 className="text-3xl mb-4">Find Freelancers</h1>

//       {/* Filters */}
//       <input
//         name="skill"
//         placeholder="Skill (e.g. React)"
//         value={filters.skill}
//         onChange={handleChange}
//         className="p-2 bg-gray-800 mb-2 w-full rounded"
//       />

//       <input
//         name="minRate"
//         placeholder="Min Rate"
//         value={filters.minRate}
//         onChange={handleChange}
//         className="p-2 bg-gray-800 mb-2 w-full rounded"
//       />

//       <input
//         name="maxRate"
//         placeholder="Max Rate"
//         value={filters.maxRate}
//         onChange={handleChange}
//         className="p-2 bg-gray-800 mb-2 w-full rounded"
//       />

//       <button
//         onClick={search}
//         className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
//       >
//         Search
//       </button>

//       {/* Results */}
//       <div className="mt-6 grid gap-4">
//         {profiles.length === 0 ? (
//           <p className="text-gray-400">No freelancers found</p>
//         ) : (
//           profiles.map((p) => (
//             <div key={p._id} className="bg-gray-800 p-4 rounded">
//               <h2 className="text-lg font-semibold">{p.user.name}</h2>
//               <p className="text-green-400">₹{p.hourlyRate}/hr</p>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// export default Freelancers;









import { useState } from "react";
import type { ChangeEvent } from "react";
import API from "../../services/api";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";

interface Profile {
  _id: string;
  hourlyRate: string;
  user: {
    name: string;
  };
}

interface Filters {
  skill: string;
  minRate: string;
  maxRate: string;
}

export default function Freelancers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    skill: "",
    minRate: "",
    maxRate: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const search = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        skill: filters.skill,
        minRate: filters.minRate,
        maxRate: filters.maxRate,
      }).toString();

      const { data } = await API.get<Profile[]>(`/profile/search?${query}`);
      setProfiles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-cyan-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-cyan-600" /> Find Freelancers
          </h1>
          <p className="text-gray-600 mt-2">
            Discover skilled professionals for your next project 
          </p>
        </motion.div>

        {/* Filter Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <input
              name="skill"
              placeholder="🔍 Skill (React, Node...)"
              value={filters.skill}
              onChange={handleChange}
              className="px-4 py-3 border rounded-xl text-black focus:ring-2 focus:ring-cyan-500 outline-none"
            />

            <input
              name="minRate"
              placeholder="Min ₹"
              value={filters.minRate}
              onChange={handleChange}
              className="px-4 py-3 border rounded-xl text-black focus:ring-2 focus:ring-cyan-500 outline-none"
            />

            <input
              name="maxRate"
              placeholder="Max ₹"
              value={filters.maxRate}
              onChange={handleChange}
              className="px-4 py-3 border rounded-xl text-black focus:ring-2 focus:ring-cyan-500 outline-none"
            />

            <button
              onClick={search}
              className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl shadow-md transition"
            >
              <Search size={18} /> Search
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <p className="text-center text-gray-500">Searching freelancers...</p>
        ) : 
        profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-center">
            <div className="w-28 h-28 rounded-full bg-linear-to-br from-cyan-100 to-blue-200 flex items-center justify-center shadow-inner mb-6">
              <Search className="w-14 h-14 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Freelancers Found
            </h2>
            <p className="text-gray-500 max-w-md">
              We couldn’t find any freelancers matching your search. Try adjusting filters or explore different skills.
            </p>
          </div>
        )
        : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {profiles.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-xl transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {p.user.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {p.user.name}
                    </h2>
                    <p className="text-sm text-gray-500">Freelancer</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-cyan-600">
                    ₹{p.hourlyRate}
                  </span>
                  <span className="text-gray-500 text-sm"> / hour</span>
                </div>

                <button className="w-full bg-linear-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-xl hover:opacity-90 transition">
                  View Profile
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
