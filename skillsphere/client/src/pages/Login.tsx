import { useState } from "react";
import type { ChangeEvent, FormEvent} from 'react';

import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

// Type for Form
interface LoginForm {
  email: string;
  password: string;
}

// API Response Type
interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  //  Submit Handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { data } = await API.post<UserResponse>("/auth/login", form);

      localStorage.setItem("user", JSON.stringify(data));

      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  // Input Change Handler
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-white text-2xl mb-6 text-center">Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
          onChange={handleChange}
        />

        <button className="w-full bg-blue-600 py-3 rounded text-white hover:bg-blue-700">
          Login
        </button>

        <p className="text-gray-400 mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;