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
  baseURL: (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api",
  headers: {
    'Content-Type': 'application/json',
  },
});


// Function for GET request
export const fetchData = async (endpoint: string) => {
  try {
    const response = await API.get(endpoint);
    return response.data; // return data to the caller
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // You can now safely access 'error.response'
      throw new Error(error.response?.data?.message || 'Failed to fetch data');
    } else {
      // In case it's not an AxiosError, throw a generic error
      throw new Error('An unknown error occurred');
    }
  }
};

// Function for POST request
export const postData = async (endpoint: string, data: object) => {
  try {
    const response = await API.post(endpoint, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Access error.response safely
      throw new Error(error.response?.data?.message || 'Failed to submit data');
    } else {
      // Handle non-Axios errors
      throw new Error('An unknown error occurred');
    }
  }
};


//  interceptor
API.interceptors.request.use(
  (req: InternalAxiosRequestConfig) => {
    const storedUser = localStorage.getItem("user");
    const user: User | null = storedUser ? JSON.parse(storedUser) : null;

    const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

    if (user?.token) {
      req.headers = req.headers || {};
      req.headers.Authorization = `Bearer ${user.token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;