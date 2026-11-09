import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import jobService from "../../services/jobService";
import applicationService from "../../services/applicationService";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  ArrowLeft,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  JOB_CATEGORY_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_LOCATION_TYPE_LABELS,
  SALARY_CURRENCY,
  ROLE,
} from "../../utils/constants";
import { validateCvFile } from "../../utils/validators";
import toast from "react-hot-toast";

export const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply state
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [cvError, setCvError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState("");

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobService.getPublicJobById(id);
      if (res?.data?.job) {
        setJob(res.data.job);
      }
    } catch (err) {
      setError(err.message || "Failed to load job details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Check if current candidate has already applied for this job
  const checkExistingApplication = useCallback(async () => {
    if (isAuthenticated && user?.role === ROLE.CANDIDATE) {
      try {
        const res = await applicationService.getMyApplications({ limit: 100 });
        const userApps = res?.data?.applications || [];
        const found = userApps.some(
          (app) => (app.jobId?._id || app.jobId) === id
        );
        if (found) {
          setHasApplied(true);
        }
      } catch (err) {
        // Silently ignore check failure
      }
    }
  }, [id, isAuthenticated, user?.role]);

  useEffect(() => {
    fetchJob();
    checkExistingApplication();
  }, [fetchJob, checkExistingApplication]);

  const openApplyModal = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in as a candidate to apply.");
      navigate("/login", { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    if (user?.role !== ROLE.CANDIDATE) {
      toast.error("Only candidate accounts can submit job applications.");
      return;
    }

    setApplyForm({
      applicantName: user?.fullName || "",
      applicantEmail: user?.email || "",
      applicantPhone: user?.phone || "",
    });
    setCvFile(null);
    setCvError("");
    setApplyError("");
    setIsApplyModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const err = validateCvFile(file);
      if (err) {
        setCvError(err);
        setCvFile(null);
      } else {
        setCvError("");
        setCvFile(file);
      }
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError("");

    if (!applyForm.applicantName.trim()) {
      setApplyError("Applicant full name is required.");
      return;
    }
    if (!applyForm.applicantEmail.trim()) {
      setApplyError("Applicant email is required.");
      return;
    }
    if (!cvFile) {
      setCvError("Please upload your CV document (PDF, DOC, DOCX up to 5MB).");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("applicantName", applyForm.applicantName.trim());
      formData.append("applicantEmail", applyForm.applicantEmail.trim());
      if (applyForm.applicantPhone.trim()) {
        formData.append("applicantPhone", applyForm.applicantPhone.trim());
      }
      formData.append("cv", cvFile);

      await applicationService.applyForJob(id, formData);

      toast.success("Application submitted successfully!");
      setIsApplyModalOpen(false);
      setHasApplied(true);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("already applied")) {
        setHasApplied(true);
        setIsApplyModalOpen(false);
        toast.error("You have already applied for this job.");
      } else {
        setApplyError(err.message || "Failed to submit application. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 bg-white rounded-2xl border border-slate-200">
        <LoadingSpinner text="Loading job information..." />
      </div>
    );
  }

  if (error || !job) {
    return <ErrorState message={error || "Job not found."} onRetry={fetchJob} />;
  }

  const isExpired = job.applicationEndDate && new Date(job.applicationEndDate) < new Date();

  const formatSalary = (min, max, currency, period) => {
    if (min == null && max == null) return "Negotiable";
    const curr = currency === SALARY_CURRENCY.USD ? "$" : "₫";
    const per = period ? `/${period.toLowerCase()}` : "";
    if (min != null && max != null) {
      return `${curr}${min.toLocaleString()} – ${curr}${max.toLocaleString()}${per}`;
    }
    if (min != null) return `From ${curr}${min.toLocaleString()}${per}`;
    return `Up to ${curr}${max.toLocaleString()}${per}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all jobs
        </Link>
      </div>

      {/* Hero Header Card with the ONLY primary action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                {JOB_CATEGORY_LABELS[job.category] || job.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                {WORK_LOCATION_TYPE_LABELS[job.workLocationType] || job.workLocationType}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{job.recruiterId?.companyName || "Confidential Company"}</span>
              {job.location && (
                <>
                  <span className="text-slate-300">•</span>
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{job.location}</span>
                </>
              )}
            </div>
          </div>

          {/* SINGLE PRIMARY APPLY BUTTON */}
          <div className="shrink-0 flex items-center sm:items-start">
            {hasApplied ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-semibold border border-emerald-200 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Applied
              </div>
            ) : isExpired ? (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200">
                Application Closed
              </span>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={openApplyModal}
                className="shadow-sm w-full sm:w-auto"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Experience Level</span>
            <span className="font-semibold text-slate-800 text-sm">
              {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Compensation</span>
            <span className="font-semibold text-emerald-700 text-sm">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Positions Open</span>
            <span className="font-semibold text-slate-800 text-sm">
              {job.numberOfPositions || 1}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Deadline</span>
            <span className="font-semibold text-slate-800 text-sm">
              {job.applicationEndDate
                ? new Date(job.applicationEndDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Open"}
            </span>
          </div>
        </div>
      </div>

      {/* Job Description Body (Clean, no second apply button) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
          Job Description & Responsibilities
        </h2>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
          {job.description}
        </div>
      </div>

      {/* Meta Footer */}
      <div className="text-xs text-slate-400 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Posted on{" "}
            {job.createdAt
              ? new Date(job.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Recently"}
          </span>
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => !submitting && setIsApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 pt-2">
          {applyError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{applyError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            required
            value={applyForm.applicantName}
            onChange={(e) =>
              setApplyForm((prev) => ({ ...prev, applicantName: e.target.value }))
            }
            disabled={submitting}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={applyForm.applicantEmail}
              onChange={(e) =>
                setApplyForm((prev) => ({ ...prev, applicantEmail: e.target.value }))
              }
              disabled={submitting}
            />

            <Input
              label="Phone Number"
              placeholder="0912345678"
              value={applyForm.applicantPhone}
              onChange={(e) =>
                setApplyForm((prev) => ({ ...prev, applicantPhone: e.target.value }))
              }
              disabled={submitting}
            />
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Resume / CV File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors bg-slate-50/50">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                <div className="flex text-xs text-slate-600 justify-center">
                  <label
                    htmlFor="cv-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>Choose a file</span>
                    <input
                      id="cv-upload"
                      name="cv"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={submitting}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-[11px] text-slate-400">PDF, DOC, DOCX up to 5MB</p>
              </div>
            </div>

            {cvFile && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-800 font-medium">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">{cvFile.name}</span>
                  <span className="text-slate-400 text-[10px]">
                    ({(cvFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCvFile(null)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs ml-2 font-bold"
                  disabled={submitting}
                >
                  Change
                </button>
              </div>
            )}

            {cvError && <p className="mt-1 text-xs text-red-600 font-medium">{cvError}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsApplyModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetails;
