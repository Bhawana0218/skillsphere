import { useEffect, useState } from "react";
import API from "../../services/api";

interface Proposal {
  _id: string;
  job: {
    _id: string;
    title: string;
  } | null;
  freelancer: {
    name: string;
    email: string;
  } | null;
  status: string;
  bidAmount: number;
  duration: string;
  coverLetter: string;
}

const ClientProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (!currentUser) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    const client = JSON.parse(currentUser);
    if (!client || !client._id) {
      setError("Invalid user data.");
      setLoading(false);
      return;
    }

    const fetchProposals = async () => {
      try {
        const { data } = await API.get<Proposal[]>(`/proposals/client/${client._id}`);
        setProposals(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("ClientProposals fetch error:", err);
        setError(err.response?.data?.message || "Unable to load proposals.");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  if (loading) return <div className="p-6 text-gray-300">Loading proposals...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">All Proposals</h1>
      {proposals.length === 0 ? (
        <p className="text-gray-400">No proposals yet</p>
      ) : (
        <div className="grid gap-4">
          {proposals.map((p) => (
            <div key={p._id} className="bg-slate-800 p-4 rounded shadow-sm">
              <h2 className="font-semibold text-white">{p.freelancer?.name || "Unknown freelancer"}</h2>
              <p className="text-sm text-gray-400">Job: {p.job?.title || "Unknown job"}</p>
              <p className="text-sm text-gray-300">Status: {p.status}</p>
              <p className="text-sm text-gray-300">Bid: ₹{p.bidAmount}</p>
              <p className="text-sm text-gray-300">Duration: {p.duration}</p>
              <p className="mt-2 text-gray-200">{p.coverLetter}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientProposals;
