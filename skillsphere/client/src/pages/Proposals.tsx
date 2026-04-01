import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

// Freelancer Type
interface Freelancer {
  name: string;
}

// Proposal Type
interface Proposal {
  _id: string;
  freelancer: Freelancer;
  coverLetter: string;
  bidAmount: string;
}

// Props Type
// interface ProposalsProps {
//   jobId: string;
// }

function Proposals() {
  const { jobId } = useParams<{ jobId: string }>();

  // Debug: Log the jobId to identify invalid values
  useEffect(() => {
    console.log("Proposals component loaded with jobId:", jobId);
    
    // Validate MongoDB ObjectId format
    if (jobId && !/^[0-9a-f]{24}$/i.test(jobId)) {
      console.error("❌ INVALID JOB ID FORMAT:", jobId);
      console.error("Expected MongoDB ObjectId (24 hex characters), got:", jobId);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    if (!/^[0-9a-f]{24}$/i.test(jobId)) {
      console.error("Cannot fetch proposals with invalid jobId:", jobId);
      return;
    }
    fetchProposals();
  }, [jobId]);

  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Fetch Proposals
  const fetchProposals = async () => {
    try {
      console.log("Fetching proposals for jobId:", jobId);
      const { data } = await API.get<Proposal[]>(`/proposals/${jobId}`);
      console.log("✅ Successfully fetched proposals:", data);
      setProposals(data);
    } catch (error: any) {
      console.error("❌ Error fetching proposals:", error.response?.data || error.message);
      if (error.response?.status === 400) {
        console.error("Invalid Job ID format. Expected MongoDB ObjectId format (24 hex chars)");
      }
    }
  };

  // Accept Proposal
  const handleAccept = async (id: string) => {
    try {
      await API.put(`/proposals/accept/${id}`);
      fetchProposals(); // refresh list
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      {proposals.length === 0 ? (
        <p className="text-gray-400">No proposals yet</p>
      ) : (
        proposals.map((p) => (
          <div
            key={p._id}
            className="bg-gray-800 p-4 mb-4 rounded"
          >
            <h3 className="font-bold">{p.freelancer?.name}</h3>

            <p className="mt-2">{p.coverLetter}</p>

            <p className="mt-2 text-green-400">
              ₹{p.bidAmount}
            </p>

            <button
               onClick={() => handleAccept(p._id)}
               className="mt-3 bg-green-600 px-4 py-1 rounded hover:bg-green-700"
                >
               Accept Proposal
           </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Proposals;