import { useEffect, useState } from "react";
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
interface ProposalsProps {
  jobId: string;
}

function Proposals({ jobId }: ProposalsProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (jobId) fetchProposals();
  }, [jobId]);

  // Fetch Proposals
  const fetchProposals = async () => {
    try {
      const { data } = await API.get<Proposal[]>(`/proposals/${jobId}`);
      setProposals(data);
    } catch (error) {
      console.error(error);
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