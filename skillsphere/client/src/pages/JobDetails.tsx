import { useEffect, useState } from "react";
import type { ChangeEvent} from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";

// Job Type
interface Job {
  _id: string;
  title: string;
  description: string;
  budget: string;
  skillsRequired: string[];
}

// Proposal Type
interface Proposal {
  bidAmount: string;
  duration: string;
  coverLetter: string;
}

function JobDetails() {
  const { id } = useParams<{ id?: string }>();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  //  Proposal State
  const [proposal, setProposal] = useState<Proposal>({
    bidAmount: "",
    duration: "",
    coverLetter: "",
  });

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  //  Fetch Job
  const fetchJob = async () => {
    try {
      const { data } = await API.get<Job>(`/jobs/${id}`);
      setJob(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //  Handle Proposal Input
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProposal({
      ...proposal,
      [e.target.name]: e.target.value,
    });
  };

  //  Submit Proposal
const handleApply = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    console.log("Submitting proposal:", proposal);

    await API.post("/proposals", {
      jobId: job?._id,
      ...proposal,
    });

    setApplied(true);
    alert("Proposal Submitted!");

  } catch (error: any) {
    console.error("ERROR:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Failed to apply");
  }
};
  // Invalid ID
  if (!id) {
    return (
      <div className="p-10 text-white bg-gray-900 min-h-screen">
        Invalid Job ID
      </div>
    );
  }

  //  Loading
  if (loading) {
    return (
      <div className="p-10 text-white bg-gray-900 min-h-screen">
        Loading...
      </div>
    );
  }

  // No Job
  if (!job) {
    return (
      <div className="p-10 text-white bg-gray-900 min-h-screen">
        Job not found
      </div>
    );
  }

  return (
    <div className="p-10 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold">{job.title}</h1>

      <p className="mt-4">{job.description}</p>

      {/* Skills */}
      <div className="mt-4">
        {job.skillsRequired?.map((skill, i) => (
          <span
            key={i}
            className="bg-blue-600 px-3 py-1 mr-2 rounded"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Budget */}
      <p className="mt-4 text-green-400">₹{job.budget}</p>

      {/* PROPOSAL FORM */}
      <div className="mt-8">
        <h2 className="text-2xl mb-4">Submit Proposal</h2>

        {applied ? (
    <p className="text-green-400">You already applied to this job</p>
  ) : (
    <form onSubmit={handleApply} className="space-y-4">
  <input
    name="bidAmount"
    placeholder="Your Bid Amount"
    className="w-full p-3 bg-gray-800 rounded"
    value={proposal.bidAmount}
    onChange={handleChange}
  />

  <input
    name="duration"
    placeholder="Duration (e.g. 7 days)"
    className="w-full p-3 bg-gray-800 rounded"
    value={proposal.duration}
    onChange={handleChange}
  />

  <textarea
    name="coverLetter"
    placeholder="Cover Letter"
    className="w-full p-3 bg-gray-800 rounded"
    value={proposal.coverLetter}
    onChange={handleChange}
  />

  <button
    type="submit"
    className="bg-green-600 px-6 py-2 rounded hover:bg-green-700"
  >
    Submit Proposal
  </button>
</form>
  )}
{/* </div>
          </form> */}
        {/* )} */}
      </div>
    </div>
  );
}

export default JobDetails;