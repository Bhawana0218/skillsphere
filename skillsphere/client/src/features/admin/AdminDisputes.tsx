import { useEffect, useState } from "react";
import API from "../../services/api";

// Dispute type
interface User {
  name: string;
}

interface Job {
  title: string;
}

interface Dispute {
  _id: string;
  job: Job;
  filedBy: User;
  against: User;
  status: string;
  description: string;
}

const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  const fetchDisputes = async () => {
    try {
      const { data } = await API.get<Dispute[]>("/disputes");
      setDisputes(data);
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
    }
  };

  const resolve = async (id: string) => {
    const resolution = prompt("Enter resolution details:");
    if (resolution) {
      try {
        await API.put(`/disputes/${id}/resolve`, { resolution });
        fetchDisputes();
      } catch (error) {
        console.error("Failed to resolve dispute:", error);
      }
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h2 className="text-2xl mb-4">All Disputes</h2>
      {disputes.length === 0 && <p>No disputes found.</p>}
      {disputes.map((d) => (
        <div key={d._id} className="p-2 mb-2 bg-gray-800 rounded">
          <p><strong>Job:</strong> {d.job.title}</p>
          <p>
            <strong>Filed By:</strong> {d.filedBy.name} against {d.against.name}
          </p>
          <p><strong>Status:</strong> {d.status}</p>
          <p><strong>Description:</strong> {d.description}</p>
          <button
            onClick={() => resolve(d._id)}
            className="bg-green-600 px-2 py-1 rounded mt-2"
          >
            Resolve
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminDisputes;