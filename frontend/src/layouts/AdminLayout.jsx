import React, { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  Shield,
  Users,
  Briefcase,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Button from "../components/common/Button";

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/admin/recruiters",
      label: "Manage Recruiters",
      icon: Users,
    },
    {
      to: "/admin/jobs",
      label: "Manage Jobs",
      icon: Briefcase,
    },
  ];

  const SidebarContent = ({ onLinkClick }) => (
    <div className="p-5 flex flex-col h-full justify-between">
      <div>
        {/* Brand */}
        <Link
          to="/admin/recruiters"
          className="flex items-center gap-3 mb-8"
          onClick={onLinkClick}
        >
          <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight block">
              TalentPulse
            </span>
            <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
              Admin Console
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-teal-700 text-white shadow-sm shadow-teal-700/25"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & logout */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
            A
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-slate-900 block truncate">
              Administrator
            </span>
            <span className="text-[11px] text-slate-400 block truncate">
              {user?.email}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-10 flex flex-col">
            <div className="p-4 flex justify-end border-b border-slate-100">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base">
                TalentPulse
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700">
            Admin
          </span>
        </header>

        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
