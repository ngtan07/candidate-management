import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import jobService from "../../services/jobService";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Edit3,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import {
  JOB_STATUS,
  JOB_CATEGORY_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_LOCATION_TYPE_LABELS,
  SALARY_CURRENCY,
} from "../../utils/constants";
import toast from "react-hot-toast";

const formatSalary = (min, max, currency, period) => {
  if (min == null && max == null) return "Negotiable";
  const curr = currency === SALARY_CURRENCY.USD ? "$" : "₫";
  const per = period ? `/${period.toLowerCase()}` : "";
  if (min != null && max != null)
    return `${curr}${min.toLocaleString()} – ${curr}${max.toLocaleString()}${per}`;
  if (min != null) return `From ${curr}${min.toLocaleString()}${per}`;
  return `Up to ${curr}${max.toLocaleString()}${per}`;
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";

export const RecruiterJobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobService.getMyJobById(id);
      if (res?.data?.job) {
        setJob(res.data.job);
      }
    } catch (err) {
      setError(err.message || "Failed to load job details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  const handleAction = async () => {
    if (!job) return;
    try {
      setActionLoading(true);
      if (confirmModal.type === "publish") {
        await jobService.publishJob(job._id);
        toast.success("Job published successfully!");
      } else if (confirmModal.type === "close") {
        await jobService.closeJob(job._id);
        toast.success("Job closed.");
      } else if (confirmModal.type === "delete") {
        await jobService.deleteJob(job._id);
        toast.success("Job deleted.");
        navigate("/recruiter/jobs");
        return;
      }
      setConfirmModal({ isOpen: false, type: null });
      fetchJob();
    } catch (err) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 bg-white rounded-2xl border border-slate-200">
        <LoadingSpinner text="Loading job details..." />
      </div>
    );
  }

  if (error || !job) {
    return <ErrorState message={error || "Job not found."} onRetry={fetchJob} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Manage Jobs
        </Link>

        <div className="flex items-center gap-2">
          {job.status === JOB_STATUS.DRAFT && (
            <>
              <Link to={`/recruiter/jobs/${job._id}/edit`}>
                <Button variant="secondary" size="sm" icon={Edit3}>
                  Edit
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle}
                onClick={() => setConfirmModal({ isOpen: true, type: "publish" })}
              >
                Publish
              </Button>
            </>
          )}
          {job.status === JOB_STATUS.OPENING && (
            <Button
              variant="secondary"
              size="sm"
              icon={XCircle}
              onClick={() => setConfirmModal({ isOpen: true, type: "close" })}
              className="text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              Close Job
            </Button>
          )}
          <Link to={`/recruiter/jobs/${job._id}/applications`}>
            <Button variant="secondary" size="sm" icon={Users}>
              View Applicants
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                {JOB_CATEGORY_LABELS[job.category] || job.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
                {WORK_LOCATION_TYPE_LABELS[job.workLocationType] || job.workLocationType}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {job.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{job.location || "Location not specified"}</span>
            </div>
          </div>

          <div className="shrink-0">
            <StatusBadge status={job.status} type="job" />
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Experience</span>
            <span className="font-semibold text-slate-800 text-sm">
              {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Salary</span>
            <span className="font-semibold text-emerald-700 text-sm">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Positions</span>
            <span className="font-semibold text-slate-800 text-sm">
              {job.numberOfPositions || 1}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Application Period</span>
            <span className="font-semibold text-slate-800 text-sm">
              {formatDate(job.applicationStartDate)} – {formatDate(job.applicationEndDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileText className="w-4 h-4 text-indigo-600" />
          Job Description & Details
        </h2>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {job.description}
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-xs text-slate-500 flex flex-wrap gap-6">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Created: {formatDate(job.createdAt)}
        </div>
        {job.updatedAt && job.updatedAt !== job.createdAt && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Updated: {formatDate(job.updatedAt)}
          </div>
        )}
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => !actionLoading && setConfirmModal({ isOpen: false, type: null })}
        onConfirm={handleAction}
        loading={actionLoading}
        title={
          confirmModal.type === "publish"
            ? "Publish Job"
            : confirmModal.type === "close"
            ? "Close Job"
            : "Delete Job"
        }
        message={
          confirmModal.type === "publish"
            ? `Publish "${job.title}"? Once published, candidates can apply and details cannot be edited.`
            : confirmModal.type === "close"
            ? `Close "${job.title}"? No new applications will be accepted.`
            : `Delete "${job.title}"? This cannot be undone.`
        }
        confirmText={
          confirmModal.type === "publish" ? "Publish" : confirmModal.type === "close" ? "Close" : "Delete"
        }
        variant={confirmModal.type === "publish" ? "success" : "danger"}
      />
    </div>
  );
};

export default RecruiterJobDetail;

