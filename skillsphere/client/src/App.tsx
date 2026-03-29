import { BrowserRouter, Routes, Route  } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResendVerification from "./pages/auth/ResendVerification";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import TwoFactorSetup from "./pages/auth/TwoFactorSetup";
import VerifyRequired from "./pages/auth/VerifyRequired";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import CreateJob from "./pages/CreateJob";
import JobDetails from "./pages/JobDetails";
import Freelancers from "./pages/Freelancers";
import Profile from "./pages/Profile";
import Proposals from "./pages/Proposals";
import BookSlot from "./pages/BookSlot";
import FreelancerDashboardPage from "./pages/freelancer/Dashboard";
import FreelancerProfilePage from "./pages/freelancer/Profile";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import ClientDashboard from "./pages/client/ClientDashboard";


function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0B1020",
              color: "#E5E7EB",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />
        <Routes>

        {/* PUBLIC ROUTES */}
       
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-required" element={<VerifyRequired />} />

        {/*  PROTECTED ROUTES */}


         <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
               <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/security"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TwoFactorSetup />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Freelancer route set (connected pages + props path state) */}
        <Route
          path="/freelancer/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FreelancerDashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/freelancer/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FreelancerProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
               <ClientDashboard onBack={()=> null}/>
              </MainLayout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/jobs"
          element={
            // <MainLayout>
              <Jobs />
            // </MainLayout>
          }
        />

          <Route
          path="/jobs/:id"
          element={
            // <MainLayout>
              <JobDetails />
            // </MainLayout>
          }
        />

        <Route
          path="/create-job"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateJob />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/freelancers"
          element={
            <MainLayout>
              <Freelancers />
           </MainLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-job"
          element={
            <ProtectedRoute>
              <MainLayout>
               <CreateJob />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* PROPOSALS */}
        <Route
          path="/proposals/:jobId"
          element={
            <ProtectedRoute>
              <Proposals />
            </ProtectedRoute>
          }
        />


        {/* BOOK SLOT */}
        <Route
          path="/book-slot/:freelancerId/:jobId"
          element={
            <ProtectedRoute>
              <MainLayout>
               <BookSlot />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/*  FALLBACK */}
        <Route path="*" element={<h1 className="text-white text-center mt-10">404 - Page Not Found</h1>} />

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;