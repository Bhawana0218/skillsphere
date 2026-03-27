import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

// Form Type
interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: "client" | "freelancer";
}

function Register() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    role: "client",
  });

  const navigate = useNavigate();

  // Submit Handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  // Input Handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <form
        className="bg-gray-800 p-8 rounded-2xl w-96"
        onSubmit={handleSubmit}
      >
        <h2 className="text-white text-2xl mb-6 text-center">Register</h2>

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          className="w-full mb-3 p-3 bg-gray-700 text-white rounded"
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          className="w-full mb-3 p-3 bg-gray-700 text-white rounded"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          className="w-full mb-3 p-3 bg-gray-700 text-white rounded"
          onChange={handleChange}
        />

        <select
          name="role"
          value={form.role}
          className="w-full mb-4 p-3 bg-gray-700 text-white rounded"
          onChange={handleChange}
        >
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <button className="w-full bg-green-600 py-3 rounded text-white">
          Register
        </button>

        <p className="text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-blue-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;