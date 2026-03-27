import { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

// Job Type
interface Job {
  _id: string;
  title: string;
  description: string;
  budget: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  budget: string;
  skillsRequired: string[]; 
}

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch Jobs
  const fetchJobs = async () => {
    try {
      const { data } = await API.get<Job[]>("/jobs");
      setJobs(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-10 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl mb-6">Available Jobs</h1>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <Link to={`/jobs/${job._id}`} key={job._id}>
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700">
              <h2 className="text-xl font-bold">{job.title}</h2>

              <p>
                {job.description.length > 100
                  ? job.description.substring(0, 100) + "..."
                  : job.description}
              </p>

              <div className="mt-2">
                {job.skillsRequired?.map((skill, i) => (
                    <span
                    key={i}
                    className="bg-blue-600 px-2 py-1 mr-2 rounded">
                        {skill}
                    </span>
                ))}
                </div>

              <p className="text-green-400 mt-2">₹{job.budget}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Jobs;