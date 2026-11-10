import React, { useState } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  Briefcase,
  LayoutDashboard,
  PlusCircle,
  FileCheck,
  CalendarDays,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import StatusBadge from "../components/common/StatusBadge";
import { REGISTRATION_STATUS } from "../utils/constants";

export const RecruiterLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jobsExpanded, setJobsExpanded] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isPendingApproval = user?.registrationStatus === REGISTRATION_STATUS.PENDING;
  const isRejected = user?.registrationStatus === REGISTRATION_STATUS.REJECTED;

  // Determine active states
  const isOnJobs = location.pathname.startsWith("/recruiter/jobs");
  const isOnNewJob = location.pathname === "/recruiter/jobs/new";
  const isOnManageJobs =
    isOnJobs && !isOnNewJob && !location.pathname.includes("/applications");

  const initials = user?.companyName
    ? user.companyName.charAt(0).toUpperCase()
    : "R";

  const SidebarContent = ({ onLinkClick }) => (
    <div className="p-5 flex-1">
      <Link
        to="/recruiter/dashboard"
        className="flex items-center gap-3 mb-8"
        onClick={onLinkClick}
      >
        <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight block">
            TalentPulse
          </span>
          <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
            Recruiter Portal
          </span>
        </div>
      </Link>

      <nav className="space-y-1">
        {/* Dashboard */}
        <NavLink
          to="/recruiter/dashboard"
          end
          onClick={onLinkClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-teal-700 text-white shadow-sm shadow-teal-700/30"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </NavLink>

        {/* Jobs Group */}
        <div>
          <button
            onClick={() => setJobsExpanded(!jobsExpanded)}
            className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isOnJobs
                ? "bg-teal-50 text-teal-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 shrink-0" />
              Manage Jobs
            </div>
            {jobsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {jobsExpanded && (
            <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-slate-200 pl-3">
              <Link
                to="/recruiter/jobs"
                onClick={onLinkClick}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isOnManageJobs
                    ? "text-teal-700 bg-teal-50 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                All Jobs
              </Link>
              <Link
                to="/recruiter/jobs/new"
                onClick={onLinkClick}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isOnNewJob
                    ? "text-teal-700 bg-teal-50 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Post New Job
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/recruiter/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">TalentPulse</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-white h-full flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.companyName || "Recruiter"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="mb-3">
                <StatusBadge status={user?.registrationStatus} type="registration" />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col justify-between sticky top-0 h-screen shrink-0">
        <SidebarContent onLinkClick={() => {}} />

        {/* Recruiter info & status */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-2xl border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.companyName || "Recruiter"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="mb-3">
            <StatusBadge status={user?.registrationStatus} type="registration" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Warning Banner if Recruiter is not approved yet */}
        {isPendingApproval && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-6 flex items-center gap-3 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Registration Pending Review:</strong> Your recruiter profile is under review.
              You can create draft jobs, but publishing requires account approval.
            </span>
          </div>
        )}

        {isRejected && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 sm:px-6 flex items-center gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>
              <strong>Registration Rejected:</strong> Your recruiter registration was not approved.
              Please contact support.
            </span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
