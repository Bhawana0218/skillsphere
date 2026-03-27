import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import API from "../services/api";

// Job Type
interface JobForm {
  title: string;
  description: string;
  skillsRequired: string;
  budget: string;
  deadline: string;
}

function CreateJob() {
  const [job, setJob] = useState<JobForm>({
    title: "",
    description: "",
    skillsRequired: "",
    budget: "",
    deadline: "",
  });

  // Handle Change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await API.post("/jobs", {
        ...job,
        skillsRequired: job.skillsRequired
          .split(",")
          .map((s) => s.trim()), // clean values
      });

      alert("Job Posted!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-10 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl mb-6">Post a Job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Title"
          className="w-full p-3 bg-gray-800 rounded"
          value={job.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full p-3 bg-gray-800 rounded"
          value={job.description}
          onChange={handleChange}
        />

        <input
          name="skillsRequired"
          placeholder="Skills (comma separated)"
          className="w-full p-3 bg-gray-800 rounded"
          value={job.skillsRequired}
          onChange={handleChange}
        />

        <input
          name="budget"
          placeholder="Budget"
          className="w-full p-3 bg-gray-800 rounded"
          value={job.budget}
          onChange={handleChange}
        />

        <input
          name="deadline"
          type="date"
          className="w-full p-3 bg-gray-800 rounded"
          value={job.deadline}
          onChange={handleChange}
        />

        <button className="bg-green-600 px-6 py-2 rounded">
          Post Job
        </button>
      </form>
    </div>
  );
}

export default CreateJob;