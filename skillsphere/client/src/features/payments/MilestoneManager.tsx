import { useState, useEffect, type ChangeEvent } from "react";
import API from "../../services/api";

// Types
interface Milestone {
  _id: string;
  milestone: string;
  description: string;
  completed: boolean;
  files: string[];
}

interface MilestoneManagerProps {
  jobId: string;
  clientId: string;
}

const MilestoneManager: React.FC<MilestoneManagerProps> = ({ jobId, clientId }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestone, setMilestone] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const fetchMilestones = async () => {
    try {
      const { data } = await API.get<Milestone[]>(`/progress/${jobId}`);
      setMilestones(data);
    } catch (error) {
      console.error("Failed to fetch milestones:", error);
    }
  };

  const addMilestone = async () => {
    if (!milestone) return alert("Please enter milestone name");
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("milestone", milestone);
    formData.append("description", description);
    formData.append("clientId", clientId);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    try {
      await API.post("/progress", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMilestone("");
      setDescription("");
      setFiles(null);
      fetchMilestones();
    } catch (error) {
      console.error("Failed to add milestone:", error);
    }
  };

  const complete = async (id: string) => {
    try {
      await API.put(`/progress/${id}/complete`, { clientId });
      fetchMilestones();
    } catch (error) {
      console.error("Failed to mark milestone complete:", error);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const completionPercentage = () => {
    if (milestones.length === 0) return 0;
    const completedCount = milestones.filter((m) => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h3 className="text-xl mb-2">Project Progress ({completionPercentage()}%)</h3>

      <input
        type="text"
        placeholder="Milestone Name"
        value={milestone}
        onChange={(e) => setMilestone(e.target.value)}
        className="p-2 mb-2 w-full bg-gray-800"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 mb-2 w-full bg-gray-800"
      />
      <input type="file" multiple onChange={handleFileChange} className="mb-2" />
      <button onClick={addMilestone} className="bg-green-600 px-4 py-2 rounded mb-4">
        Add Milestone
      </button>

      <ul>
        {milestones.map((m) => (
          <li
            key={m._id}
            className={`p-2 mb-2 rounded ${m.completed ? "bg-green-700" : "bg-gray-800"}`}
          >
            <strong>{m.milestone}</strong> - {m.description}
            <div className="mt-1">
              {m.files.map((f, i) => (
                <a
                  key={i}
                  href={f}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 mr-2"
                >
                  File {i + 1}
                </a>
              ))}
            </div>
            {!m.completed && (
              <button
                onClick={() => complete(m._id)}
                className="bg-blue-600 px-2 py-1 mt-1 rounded"
              >
                Mark Complete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MilestoneManager;