import { BrowserRouter, Routes, Route  } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/access/login/Login";
import Register from "./pages/auth/access/register/Register";
import VerifyEmail from "./pages/auth/emailVerification/VerifyEmail";
import ResendVerification from "./pages/auth/resendVeification/ResendVerification";
import ForgotPassword from "./pages/auth/password/forgetPassword/ForgotPassword";
import ResetPassword from "./pages/auth/password/forgetPassword/resetPassword/ResetPassword";
import TwoFactorSetup from "./pages/auth/twoFactorSetup/TwoFactorSetup";
import VerifyRequired from "./pages/auth/emailVerification/VerifyRequired";
import Dashboard from "./pages/dashboard/Dashboard";
import Jobs from "./pages/jobs/job/Jobs";
import CreateJob from "./pages/jobs/createNewJob/CreateJob";
import JobDetails from "./pages/jobs/job/jobDetail/JobDetails";
import Freelancers from "./pages/findFreelancers/Freelancers";
import Profile from "./pages/auth/Profile";
import Proposals from "./pages/Proposals";
import BookSlot from "./pages/BookSlot";
import FreelancerDashboardPage from "./pages/freelancer/Dashboard";
import FreelancerProfilePage from "./pages/freelancer/Profile";
import FreelancerProposals from "./pages/freelancer/FreelancerProposals";
import Footer from "./layouts/Footer/Footer";
import FreelancerDashboard from "./pages/FreelancerDashboard";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientProposals from "./pages/client/ClientProposals";


function App() {
  return (
    <>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <BrowserRouter>
      <Toaster
  position="top-right"
  toastOptions={{
    style: {
      borderRadius: "12px",
      background: "#00072D",
      // "#0A4B5F",
      color: "#fff",
      padding: "12px 16px",
    },
    success: {
      iconTheme: {
        primary: "#06b6d4",
        secondary: "#fff",
      },
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

        {/* <Route element={<MainLayout />}> */}
         <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
                <Footer/>
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

        <Route path="/freelancer/proposals"
         element={
           <ProtectedRoute>
             <MainLayout>
              <FreelancerProposals />
             </MainLayout>
          </ProtectedRoute>} />

         <Route
          path="/freelancer-dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FreelancerDashboard />
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
          path="/client/proposals"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClientProposals />
                <Footer />
              </MainLayout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/jobs"
          element={
           <MainLayout>
              <Jobs />
               <Footer/>
            </MainLayout>
          }
        />

          <Route
          path="/jobs/:id"
          element={
           <MainLayout>
              <JobDetails />
               <Footer/>
            </MainLayout>
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
                <Footer/>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* PROPOSALS */}
        <Route
          path="/jobs/:jobId/proposals"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Proposals />
                 <Footer/>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:jobId/proposals/:proposalId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Proposals />
                 <Footer/>
              </MainLayout>
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
                <Footer/>
             </MainLayout>
            </ProtectedRoute>
          }
        />

        {/*  FALLBACK */}
        <Route path="*" element={<h1 className="text-white text-center mt-10">404 - Page Not Found</h1>} />
        
       

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
    </>
  );
}

export default App;