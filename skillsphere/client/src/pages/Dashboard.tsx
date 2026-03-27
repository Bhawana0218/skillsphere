import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Define User Type
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

function Dashboard() {
  const navigate = useNavigate();

  // Safely parse localStorage
  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="p-10 text-white bg-gray-900 h-screen">
      <h1 className="text-3xl">
        Welcome {user?.name} ({user?.role})
      </h1>
    </div>
  );
}

export default Dashboard;