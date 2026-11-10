import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import applicationService from "../../services/applicationService";
import interviewService from "../../services/interviewService";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Video,
  MapPin,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Save,
  Building,
  User,
} from "lucide-react";
import { APPLICATION_STATUS } from "../../utils/constants";
import toast from "react-hot-toast";

export const InterviewEvaluation = () => {
  const { id: applicationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [application, setApplication] = useState(null);
  const [interview, setInterview] = useState(null);

  // CV preview state
  const [cvLoading, setCvLoading] = useState(false);
  const [cvBlobUrl, setCvBlobUrl] = useState(null);
  const [cvError, setCvError] = useState("");

  // Notes state
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [decisionBusy, setDecisionBusy] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch application details
        const appRes = await applicationService.getApplicationById(applicationId);
        const appData = appRes?.data?.application || appRes?.data || null;
        setApplication(appData);

        // Fetch interview details
        try {
          const ivRes = await interviewService.getByApplication(applicationId);
          const ivData = ivRes?.data?.interview || null;
          setInterview(ivData);
          if (ivData?.notes) {
            setNotes(ivData.notes);
          }
        } catch (ivErr) {
          console.warn("Interview record not found or not yet scheduled", ivErr);
        }

        // Fetch CV preview
        if (appData?.cv) {
          const isPdf = (appData.cv.fileName || "").toLowerCase().endsWith(".pdf");
          if (isPdf) {
            setCvLoading(true);
            try {
              const url = await applicationService.previewCv(applicationId);
              setCvBlobUrl(url);
            } catch (cvErr) {
              setCvError(cvErr.message || "Failed to load CV preview.");
            } finally {
              setCvLoading(false);
            }
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load application and evaluation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (cvBlobUrl) {
        URL.revokeObjectURL(cvBlobUrl);
      }
    };
  }, [applicationId]);

  const handleDownloadCv = async () => {
    if (!application?.cv?.fileName) return;
    try {
      await applicationService.downloadCv(applicationId, application.cv.fileName);
    } catch (err) {
      toast.error(err.message || "Failed to download CV file.");
    }
  };

  const handleSaveEvaluation = async (e) => {
    e?.preventDefault();
    if (!notes.trim()) {
      toast.error("Please enter evaluation notes before saving.");
      return;
    }

    try {
      setSavingNotes(true);
      await interviewService.evaluateInterview(applicationId, notes);
      toast.success("Evaluation saved! Application moved to Waiting Result.");
      // Refresh or redirect
      if (application?.jobId?._id || application?.jobId) {
        const jId = application.jobId._id || application.jobId;
        navigate(`/recruiter/jobs/${jId}/applications`);
      } else {
        navigate(-1);
      }
    } catch (err) {
      toast.error(err.message || "Failed to save interview evaluation.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDecision = async (decisionStatus) => {
    try {
      setDecisionBusy(true);
      await applicationService.updateApplicationStatus(applicationId, decisionStatus);
      const isAccepted = decisionStatus === APPLICATION_STATUS.PASSED;
      toast.success(
        isAccepted
          ? `Candidate accepted successfully!`
          : `Candidate marked as rejected after interview.`
      );
      if (application?.jobId?._id || application?.jobId) {
        const jId = application.jobId._id || application.jobId;
        navigate(`/recruiter/jobs/${jId}/applications`);
      } else {
        navigate(-1);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update candidate decision.");
    } finally {
      setDecisionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 bg-white rounded-2xl border border-slate-200">
        <LoadingSpinner text="Loading interview evaluation..." />
      </div>
    );
  }

  if (error || !application) {
    return (
      <ErrorState
        message={error || "Application not found"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const job = application.jobId || {};
  const isPdf = (application.cv?.fileName || "").toLowerCase().endsWith(".pdf");
  const isWaitingResult = application.status === APPLICATION_STATUS.INTERVIEWED;
  const isPassed = application.status === APPLICATION_STATUS.PASSED;
  const isRejected = application.status === APPLICATION_STATUS.REJECTED_INTERVIEW;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={job._id ? `/recruiter/jobs/${job._id}/applications` : "/recruiter/jobs"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Applicants
        </Link>
      </div>

      <PageHeader
        title={`Interview Evaluation: ${application.applicantName}`}
        subtitle={`Position: ${job.title || "Job Application"} · Screen and evaluate candidate performance`}
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Candidate Details & Embedded CV */}
        <div className="lg:col-span-7 space-y-6">
          {/* Candidate Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-base">
                  {application.applicantName?.charAt(0).toUpperCase() || "C"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {application.applicantName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applied on{" "}
                    {new Date(application.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <StatusBadge status={application.status} type="application" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{application.applicantEmail}</span>
              </div>
              {application.applicantPhone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{application.applicantPhone}</span>
                </div>
              )}
              {job.title && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{job.title}</span>
                </div>
              )}
              {job.workLocation && (
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{job.workLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Embedded CV Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <span className="font-semibold text-slate-800 text-sm">
                  {application.cv?.fileName || "Candidate Resume"}
                </span>
              </div>
              {application.cv?.fileName && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadCv}
                  icon={Download}
                >
                  Download CV
                </Button>
              )}
            </div>

            <div className="p-4 min-h-[500px] flex flex-col justify-center">
              {cvLoading ? (
                <div className="py-20">
                  <LoadingSpinner text="Rendering candidate CV..." />
                </div>
              ) : cvError ? (
                <div className="p-6 text-center text-sm text-red-600">
                  <p>{cvError}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={handleDownloadCv}
                  >
                    Download CV directly
                  </Button>
                </div>
              ) : isPdf && cvBlobUrl ? (
                <div className="w-full h-[620px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <iframe
                    src={cvBlobUrl}
                    title="Candidate CV Document"
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    {application.cv?.fileName || "Document File"}
                  </h4>
                  <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">
                    In-browser inline preview is supported for PDF documents. Word (DOC/DOCX) files can be downloaded directly.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleDownloadCv}
                    icon={Download}
                  >
                    Download Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Interview Schedule Details & Evaluation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interview Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Interview Schedule
            </h3>

            {interview ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-semibold">
                    {new Date(interview.startTime).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-700">
                  <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>
                    {new Date(interview.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(interview.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-700">
                  {interview.interviewType === "ONLINE" ? (
                    <Video className="w-4 h-4 text-teal-700 shrink-0" />
                  ) : (
                    <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                  )}
                  <span className="font-medium">
                    Format: {interview.interviewType === "ONLINE" ? "Online Meeting" : "On-site / In-person"}
                  </span>
                </div>

                {interview.interviewType === "ONLINE" && interview.meetingUrl && (
                  <div className="pt-1">
                    <a
                      href={interview.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs border border-teal-200 transition-colors w-full justify-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Join Video Meeting
                    </a>
                  </div>
                )}

                {interview.interviewType === "ONSITE" && interview.officeAddress && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    <p className="font-semibold text-slate-800 mb-0.5">Location Address:</p>
                    <p>{interview.officeAddress}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No interview session record found for this application.
              </p>
            )}
          </div>

          {/* Evaluation Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Recruiter Evaluation Notes
            </h3>

            <form onSubmit={handleSaveEvaluation} className="space-y-4">
              <div>
                <label
                  htmlFor="eval-notes"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Interview Feedback & Rating <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="eval-notes"
                  rows={8}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all placeholder:text-slate-400"
                  placeholder="Record candidate strengths, technical assessment, cultural fit, communication skills, and hiring recommendation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={savingNotes || decisionBusy}
                  required
                />
              </div>

              {/* Status & Actions based on current status */}
              {application.status === APPLICATION_STATUS.WAITING_INTERVIEW && (
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    loading={savingNotes}
                    icon={Save}
                  >
                    Save Notes & Move to Waiting Result
                  </Button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Saving evaluation marks the candidate as Interviewed and advances them to Waiting Result.
                  </p>
                </div>
              )}

              {/* In Waiting Result (INTERVIEWED): Can update notes AND make final decision */}
              {isWaitingResult && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    loading={savingNotes}
                    icon={Save}
                  >
                    Update Evaluation Notes
                  </Button>

                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Final Hiring Decision:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={decisionBusy}
                        onClick={() => handleDecision(APPLICATION_STATUS.PASSED)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept Candidate
                      </button>

                      <button
                        type="button"
                        disabled={decisionBusy}
                        onClick={() => handleDecision(APPLICATION_STATUS.REJECTED_INTERVIEW)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Candidate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Already Decided (PASSED or REJECTED_INTERVIEW) */}
              {(isPassed || isRejected) && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      Final Decision:
                    </span>
                    <StatusBadge status={application.status} type="application" />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    loading={savingNotes}
                    icon={Save}
                  >
                    Update Saved Notes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewEvaluation;
