import React from "react";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/common/PageHeader";
import { ShieldAlert, Info, Database } from "lucide-react";

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Management Console"
        subtitle="Platform oversight and governance portal."
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Backend Admin APIs Not Implemented in Current MVP
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              The current TalentPulse backend architecture provides database schema definitions and registration statuses (Pending, Approved, Rejected), but does not expose administrative routes or endpoints for recruiter verification, user management, or audit inspection in this release.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>Developer Reference:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-500 pl-2">
            <li>Authenticated User Email: <span className="font-mono text-slate-800">{user?.email}</span></li>
            <li>System Role: <span className="font-mono text-slate-800">{user?.role}</span></li>
            <li>No fake statistics or fabricated endpoints are rendered in compliance with architectural guidelines.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

