import axios, { type InternalAxiosRequestConfig } from "axios";

// User type
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

//  Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

//  interceptor
API.interceptors.request.use(
  (req: InternalAxiosRequestConfig) => {
    const storedUser = localStorage.getItem("user");
    const user: User | null = storedUser ? JSON.parse(storedUser) : null;

    if (user?.token) {
      req.headers = req.headers || {};
      req.headers.Authorization = `Bearer ${user.token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;