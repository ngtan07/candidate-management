import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import applicationService from "../../services/applicationService";
import CvActions from "../../components/common/CvActions";
import useAuth from "../../hooks/useAuth";
import interviewService from "../../services/interviewService";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import Modal from "../../components/common/Modal";
import {
  ArrowLeft,
  Briefcase,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  MapPin,
  Eye,
  Download,
  AlertCircle,
} from "lucide-react";
import {
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
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "–";

export const ApplicationDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviewNotes, setInterviewNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // CV modal
  const [cvModal, setCvModal] = useState({
    isOpen: false,
    loading: false,
    fileName: "",
    url: "",
    error: "",
  });

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getApplicationById(id);
      if (res?.data?.application) {
        setApplication(res.data.application);
        setInterviewNotes(res.data.application.interview?.notes || "");
      }
    } catch (err) {
      setError(err.message || "Failed to load application details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const saveInterviewNotes = async () => {
    if (!application?.interview?._id) return;
    try { setSavingNotes(true); await interviewService.notes(application.interview._id, interviewNotes); toast.success("Interview notes saved."); }
    catch (err) { toast.error(err.message || "Could not save interview notes."); }
    finally { setSavingNotes(false); }
  };

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleViewCv = async () => {
    if (!application) return;
    try {
      setCvModal({
        isOpen: true,
        loading: true,
        fileName: application.cv?.fileName || "My CV",
        url: "",
        error: "",
      });

      const res = await applicationService.getApplicationCv(application._id);
      if (res?.data?.url) {
        setCvModal({
          isOpen: true,
          loading: false,
          fileName: res.data.fileName || application.cv?.fileName,
          url: res.data.url,
          error: "",
        });
      } else {
        throw new Error("Could not retrieve CV preview URL.");
      }
    } catch (err) {
      setCvModal((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to retrieve CV file.",
      }));
    }
  };

  const handleDownloadCv = async () => {
    if (!application) return;
    try {
      toast.loading("Preparing secure download...", { id: "cv-dl" });
      const res = await applicationService.getApplicationCv(application._id);
      if (res?.data?.url) {
        toast.dismiss("cv-dl");
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      toast.error(err.message || "Failed to download CV file.", { id: "cv-dl" });
    }
  };

  if (loading) {
    return (
      <div className="py-24 bg-white rounded-2xl border border-slate-200">
        <LoadingSpinner text="Loading application record..." />
      </div>
    );
  }

  if (error || !application) {
    return (
      <ErrorState
        message={error || "Application record not found."}
        onRetry={fetchApplication}
      />
    );
  }

  const job = application.jobId || {};
  const isPdf = cvModal.fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          to={user?.role === "RECRUITER" && application?.jobId?._id ? `/recruiter/jobs/${application.jobId._id}/applications` : "/candidate/applications"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Applications
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Application Details
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {job.title || "Job Application"}
            </h1>
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{job.recruiterId?.companyName || "Company"}</span>
              {job.location && (
                <>
                  <span className="text-slate-300">•</span>
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{job.location}</span>
                </>
              )}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-400 block mb-1">Application Status</span>
            <StatusBadge status={application.status} type="application" className="text-sm px-3.5 py-1.5" />
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              Submitted on:{" "}
              <strong className="text-slate-800">
                {new Date(application.createdAt).toLocaleString("en-GB")}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              Status updated:{" "}
              <strong className="text-slate-800">
                {application.statusUpdatedAt
                  ? new Date(application.statusUpdatedAt).toLocaleString("en-GB")
                  : "N/A"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: Submitted Candidate Detail (Left) vs Job Description Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Submitted Candidate Detail (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-700" />
              Submitted Candidate Details
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Applicant Full Name</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {application.applicantName}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Email Address</span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{application.applicantEmail}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Phone Number</span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{application.applicantPhone || "Not provided"}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-slate-400 block mb-1.5">Submitted CV Document</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 truncate">
                    <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="truncate">{application.cv?.fileName || "CV Document"}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <CvActions applicationId={application._id} fileName={application.cv?.fileName} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 block mb-1">Status at Submission</span>
                <StatusBadge status={application.status} type="application" />
              </div>
            </div>
          </div>

          {/* Interview Information Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              Interview Information
            </h2>

            {application.interview ? (
              <div className="space-y-3.5 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Date</span>
                  <p className="font-semibold text-slate-900 text-sm">
                    {new Date(application.interview.startTime).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>
                    {new Date(application.interview.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(application.interview.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Interview Format</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-xs bg-slate-100 text-slate-700">
                    {application.interview.interviewType === "ONLINE" ? "Online Meeting" : "On-site / In-person"}
                  </span>
                </div>

                {application.interview.interviewType === "ONLINE" && application.interview.meetingUrl && (
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[11px] mb-1">Meeting Link</span>
                    <a
                      href={application.interview.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs border border-teal-200 transition-colors break-all"
                    >
                      Join Interview Meeting
                    </a>
                  </div>
                )}

                {application.interview.interviewType === "ONSITE" && application.interview.officeAddress && (
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-0.5">Interview Location</span>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                      {application.interview.officeAddress}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Interview not scheduled yet
                </p>
                <p className="text-[11px] text-slate-500">
                  You will see meeting details here once the recruiter schedules an interview.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Job Description Detail (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Job Description & Position Details
          </h2>

          {/* Quick job highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block">Category</span>
              <span className="font-semibold text-slate-800">
                {JOB_CATEGORY_LABELS[job.category] || job.category || "–"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Employment Type</span>
              <span className="font-semibold text-slate-800">
                {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType || "–"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Experience Level</span>
              <span className="font-semibold text-slate-800">
                {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel || "–"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Arrangement</span>
              <span className="font-semibold text-slate-800">
                {WORK_LOCATION_TYPE_LABELS[job.workLocationType] || job.workLocationType || "–"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Compensation</span>
              <span className="font-semibold text-emerald-700">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Positions</span>
              <span className="font-semibold text-slate-800">
                {job.numberOfPositions || 1}
              </span>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description & Requirements
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-1">
              {job.description || "No job description text available."}
            </div>
          </div>

          {/* Application window notice */}
          {(job.applicationStartDate || job.applicationEndDate) && (
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Application window: {formatDate(job.applicationStartDate)} – {formatDate(job.applicationEndDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {user?.role === "RECRUITER" && application.interview && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Recruiter Evaluation & Interview Details</h2>
            <Link
              to={`/recruiter/applications/${application._id}/evaluate`}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
            >
              Open Evaluation Page →
            </Link>
          </div>
          <p className="text-sm text-slate-600">
            {new Date(application.interview.startTime).toLocaleString()} –{" "}
            {new Date(application.interview.endTime).toLocaleTimeString()} · {application.interview.interviewType}
          </p>
          <p className="text-sm text-slate-600">
            {application.interview.meetingUrl || application.interview.officeAddress}
          </p>
          <label className="block text-sm font-medium text-slate-700" htmlFor="interview-notes">
            Private interview notes
          </label>
          <textarea
            id="interview-notes"
            className="w-full border rounded-lg p-3 text-sm"
            rows="5"
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
          />
          <button
            type="button"
            disabled={savingNotes}
            onClick={saveInterviewNotes}
            className="rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {savingNotes ? "Saving..." : "Save notes"}
          </button>
        </section>
      )}

      {/* CV Preview Modal */}
      <Modal
        isOpen={cvModal.isOpen}
        onClose={() => setCvModal({ isOpen: false, loading: false, fileName: "", url: "", error: "" })}
        title={`CV Document: ${cvModal.fileName}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          {cvModal.loading ? (
            <div className="py-20">
              <LoadingSpinner text="Fetching document preview..." />
            </div>
          ) : cvModal.error ? (
            <div className="p-6 text-center text-sm text-red-600">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              {cvModal.error}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-xs">
                <span className="text-slate-500">
                  Secure download preview
                </span>
                <a
                  href={cvModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-900"
                >
                  <Download className="w-3.5 h-3.5" />
                  Direct Download
                </a>
              </div>

              {isPdf ? (
                <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <iframe
                    src={cvModal.url}
                    title="CV Document Viewer"
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Document: {cvModal.fileName}
                  </h4>
                  <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">
                    In-browser preview is supported for PDF documents. Word and DOC files can be downloaded directly.
                  </p>
                  <a
                    href={cvModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationDetails;
