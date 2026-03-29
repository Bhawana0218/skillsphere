import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

//  User Type
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  isVerified?: boolean;
}

//  Props Type
interface ProtectedRouteProps {
  children: ReactNode;
  // role?: string;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {

  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  //  MAIN AUTH CHECK
  if (!token || !user) {
    return <Navigate to="/" replace />; // or "/login"
  }

  // Email verification gate (product UX).
  // Backend can additionally enforce with REQUIRE_EMAIL_VERIFIED=true.
  if (user.isVerified === false) {
    return <Navigate to="/verify-required" replace />;
  }

  // if (role && user.role !== role) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <>{children}</>;
}


export default ProtectedRoute;