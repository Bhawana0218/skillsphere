import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  isVerified?: boolean;
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  //  Auth check
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Email verification check
  if (user.isVerified === false) {
    return <Navigate to="/verify-required" replace />;
  }

  // Role check (NEW)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />; // or /unauthorized
  }

  return <>{children}</>;
}

export default ProtectedRoute;