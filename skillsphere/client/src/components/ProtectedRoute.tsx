import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

//  User Type
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

//  Props Type
interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    
  //  Safe localStorage parsing
  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  return user ? <>{children}</> : <Navigate to="/" replace />;
}

export default ProtectedRoute;