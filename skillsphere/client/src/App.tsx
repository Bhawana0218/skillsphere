import { BrowserRouter, Routes, Route  } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
       
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
  );
}

export default App;