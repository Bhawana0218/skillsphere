import { useState } from "react";
import type {ChangeEvent} from 'react';
import API from "../../services/api";

// Props type
interface FileDisputeProps {
  jobId: string;
  againstId: string;
}

const FileDispute: React.FC<FileDisputeProps> = ({ jobId, againstId }) => {
  const [description, setDescription] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async () => {
    if (!description) {
      alert("Please enter a description");
      return;
    }

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("againstId", againstId);
    formData.append("description", description);

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    try {
      await API.post("/disputes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Dispute filed successfully!");
      setDescription("");
      setFiles(null);
    } catch (error) {
      console.error("Error filing dispute:", error);
      alert("Failed to file dispute. Please try again.");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h3 className="text-xl mb-2">File a Dispute</h3>
      <textarea
        className="w-full p-2 mb-2 bg-gray-800"
        placeholder="Describe issue"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleSubmit}
        className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
      >
        Submit Dispute
      </button>
    </div>
  );
};

export default FileDispute;