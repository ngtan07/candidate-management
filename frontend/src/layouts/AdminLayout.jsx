import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ShieldAlert, LogOut, Briefcase } from "lucide-react";
import Button from "../components/common/Button";

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block leading-tight">
              TalentPulse
            </span>
            <span className="text-[10px] uppercase font-semibold text-indigo-400">
              Admin Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">{user?.email}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={LogOut}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-10 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

