import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import CandidateLayout from "../layouts/CandidateLayout";
import RecruiterLayout from "../layouts/RecruiterLayout";
import AdminLayout from "../layouts/AdminLayout";

// Auth Pages
import Login from "../pages/auth/Login";
import RegisterCandidate from "../pages/auth/RegisterCandidate";
import RegisterRecruiter from "../pages/auth/RegisterRecruiter";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Candidate & Public Pages
import BrowseJobs from "../pages/candidate/BrowseJobs";
import JobDetails from "../pages/candidate/JobDetails";
import MyApplications from "../pages/candidate/MyApplications";
import ApplicationDetails from "../pages/candidate/ApplicationDetails";
import Profile from "../pages/candidate/Profile";

// Recruiter Pages
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import ManageJobs from "../pages/recruiter/ManageJobs";
import JobForm from "../pages/recruiter/JobForm";
import JobApplications from "../pages/recruiter/JobApplications";
import RecruiterJobDetail from "../pages/recruiter/RecruiterJobDetail";
import InterviewEvaluation from "../pages/recruiter/InterviewEvaluation";

// Admin & Fallback
import ManageRecruiters from "../pages/admin/ManageRecruiters";
import ManageJobsAdmin from "../pages/admin/ManageJobs";
import NotFound from "../pages/NotFound";

import { ROLE } from "../utils/constants";

// Public root redirect handler
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (user?.role === ROLE.CANDIDATE) return <Navigate to="/jobs" replace />;
    if (user?.role === ROLE.RECRUITER) return <Navigate to="/recruiter/dashboard" replace />;
    if (user?.role === ROLE.ADMIN) return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/jobs" replace />;
};

// Redirect authenticated users away from /login or /register
const PublicAuthOnly = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (user?.role === ROLE.CANDIDATE) return <Navigate to="/jobs" replace />;
    if (user?.role === ROLE.RECRUITER) return <Navigate to="/recruiter/dashboard" replace />;
    if (user?.role === ROLE.ADMIN) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth Routes */}
      <Route
        element={
          <PublicAuthOnly>
            <AuthLayout />
          </PublicAuthOnly>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/register/candidate" element={<RegisterCandidate />} />
        <Route path="/register/recruiter" element={<RegisterRecruiter />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public Job Browsing — uses CandidateLayout for candidates, still accessible without auth */}
      <Route path="/jobs" element={<CandidateLayout />}>
        <Route index element={<BrowseJobs />} />
        <Route path=":id" element={<JobDetails />} />
      </Route>

      {/* Candidate Protected Portal */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={[ROLE.CANDIDATE]}>
            <CandidateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/jobs" replace />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="applications/:id" element={<ApplicationDetails />} />
        <Route path="profile" element={<Profile />} />
        {/* Legacy redirect */}
        <Route path="change-password" element={<Navigate to="/candidate/profile" replace />} />
        <Route path="dashboard" element={<Navigate to="/jobs" replace />} />
      </Route>

      {/* Recruiter Protected Portal */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={[ROLE.RECRUITER]}>
            <RecruiterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="jobs/new" element={<JobForm />} />
        <Route path="jobs/:id/edit" element={<JobForm />} />
        <Route path="jobs/:id/detail" element={<RecruiterJobDetail />} />
        <Route path="jobs/:id/applications" element={<JobApplications />} />
        <Route path="applications/:id" element={<ApplicationDetails />} />
        <Route path="applications/:id/evaluate" element={<InterviewEvaluation />} />
        <Route path="interviews" element={<Navigate to="/recruiter/jobs" replace />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLE.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="recruiters" replace />} />
        <Route path="recruiters" element={<ManageRecruiters />} />
        <Route path="jobs" element={<ManageJobsAdmin />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
