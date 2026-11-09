import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import jobService from "../../services/jobService";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  FileCheck,
  AlertCircle,
  Eye,
  Users,
} from "lucide-react";
import { JOB_STATUS, REGISTRATION_STATUS } from "../../utils/constants";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "–";

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [totalJobsCount, setTotalJobsCount] = useState(0);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        if (user?.registrationStatus === REGISTRATION_STATUS.APPROVED) {
          const res = await jobService.getMyJobs({ limit: 5 });
          if (res?.data) {
            setJobs(res.data.jobs || []);
            setTotalJobsCount(res.data.pagination?.total || 0);
          }
        }
      } catch (err) {
        console.error("Recruiter dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, [user?.registrationStatus]);

  const isApproved = user?.registrationStatus === REGISTRATION_STATUS.APPROVED;

  const openingJobsCount = jobs.filter((j) => j.status === JOB_STATUS.OPENING).length;
  const draftJobsCount = jobs.filter((j) => j.status === JOB_STATUS.DRAFT).length;
  const closedJobsCount = jobs.filter((j) => j.status === JOB_STATUS.CLOSED).length;

  if (loading) {
    return (
      <div className="py-24 bg-white rounded-2xl border border-slate-200">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Recruiter Hub
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-indigo-200">{user?.companyName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Welcome, {user?.companyName || "Recruiter"}
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed mb-6">
            Oversee your recruitment pipeline, review applicants, and manage job openings.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/recruiter/jobs/new">
              <Button variant="primary" size="sm" icon={PlusCircle} className="bg-indigo-600 hover:bg-indigo-500">
                Post New Job
              </Button>
            </Link>
            <Link to="/recruiter/jobs">
              <Button variant="secondary" size="sm" icon={FileCheck}>
                Manage Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Account Verification Notice */}
      {!isApproved && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900 mb-1">
              Account Registration: {user?.registrationStatus || "Under Review"}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your profile is pending administrator review. You can create drafts, but publishing requires approval.
            </p>
          </div>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Postings</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalJobsCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">All job postings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Opening</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{openingJobsCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Accepting applications</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Drafts</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-700">{draftJobsCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Unpublished</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Closed</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-600">{closedJobsCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Closed postings</span>
        </div>
      </div>

      {/* Recent Job Postings Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Job Postings</h2>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            Manage all jobs ({totalJobsCount})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No job postings yet"
            description="Create your first job posting to start receiving qualified candidates."
            actionLabel="Post New Job"
            onAction={() => window.location.assign("/recruiter/jobs/new")}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Title</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Positions</th>
                  <th scope="col" className="px-6 py-4">Application Period</th>
                  <th scope="col" className="px-6 py-4">Applications</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <Link
                        to={`/recruiter/jobs/${job._id}/detail`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} type="job" />
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {job.numberOfPositions || 1}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(job.applicationStartDate)} – {formatDate(job.applicationEndDate)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applications`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <Users className="w-3 h-3" />
                        {job.applicationCount ?? "–"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/recruiter/jobs/${job._id}/detail`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
