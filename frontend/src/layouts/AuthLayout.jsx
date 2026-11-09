import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Briefcase, Sparkles, CheckCircle2 } from "lucide-react";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side: Branding / Value Prop (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              TalentPulse
            </span>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Candidate Management
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Connect Top Talent with Leading Opportunities
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed mb-8">
            Streamline your hiring workflow, manage applications in real-time, and discover extraordinary career moves.
          </p>

          <div className="space-y-4 text-sm text-indigo-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>Real-time recruitment pipeline tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>Secure, direct CV screening and document preview</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>Dedicated portal for Candidates & Verified Recruiters</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-indigo-300">
          © {new Date().getFullYear()} TalentPulse Platform. All rights reserved.
        </div>
      </div>

      {/* Right side: Auth Form content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile branding */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                TalentPulse
              </span>
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

