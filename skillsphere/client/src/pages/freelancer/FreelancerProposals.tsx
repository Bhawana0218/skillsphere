import { useEffect, useState } from "react";
import API from "../../services/api";

interface Proposal {
  _id: string;
  status: string;
  bidAmount: number;
  duration: string;
  job: {
    title: string;
  };
}

const FreelancerProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await API.get(`/proposals/freelancer/${user._id}`);
        setProposals(res.data);
      } catch (err) {
        console.error("Error fetching proposals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl font-bold mb-4">My Proposals</h1>

      {proposals.length === 0 ? (
        <p>No proposals yet</p>
      ) : (
        proposals.map((p) => (
          <div key={p._id} className="bg-slate-800 p-4 rounded mb-3">
            <p className="font-semibold">{p.job?.title}</p>
            <p>Bid: ₹{p.bidAmount}</p>
            <p>Duration: {p.duration}</p>
            <p>Status: {p.status}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default FreelancerProposals;