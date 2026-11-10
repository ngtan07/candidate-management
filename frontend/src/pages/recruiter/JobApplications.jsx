import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import applicationService from "../../services/applicationService";
import CvActions from "../../components/common/CvActions";
import interviewService from "../../services/interviewService";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import usePagination from "../../hooks/usePagination";
import {
  ArrowLeft,
  Search,
  FileText,
  Mail,
  Phone,
  Eye,
  Download,
  Check,
  X,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABELS,
} from "../../utils/constants";
import toast from "react-hot-toast";

export const JobApplications = () => {
  const { id: jobId } = useParams();

  const [jobInfo, setJobInfo] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleForm, setScheduleForm] = useState({ date: "", start: "", end: "", interviewType: "ONLINE", meetingUrl: "", officeAddress: "", notes: "" });

  // Inline action state
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    application: null,
    targetStatus: null,
  });

  // CV Viewer modal
  const [cvModal, setCvModal] = useState({
    isOpen: false,
    loading: false,
    fileName: "",
    url: "",
    error: "",
  });

  const {
    page,
    limit,
    total,
    totalPages,
    setPaginationData,
    goToPage,
  } = usePagination(1, 10);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (searchInput.trim()) params.search = searchInput.trim();

      const res = await applicationService.getApplicationsByJob(jobId, params);
      if (res?.data) {
        setJobInfo(res.data.job || null);
        setApplications(res.data.applications || []);
        setStatusCounts(res.data.statusCounts || {});
        setPaginationData(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to load job applicants.");
    } finally {
      setLoading(false);
    }
  }, [jobId, page, limit, statusFilter, searchInput, setPaginationData]);

  useEffect(() => { setSelectedIds([]); }, [jobId, statusFilter, page, searchInput]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    goToPage(1);
  };

  const handleStatusTransition = async (application, newStatus) => {
    try {
      setUpdatingId(application._id);
      await applicationService.updateApplicationStatus(application._id, newStatus);
      const label =
        newStatus === APPLICATION_STATUS.PASSED_CV ? "Accepted CV" : "Rejected CV";
      toast.success(`Application for "${application.applicantName}" marked as ${label}.`);
      setConfirmDialog({ isOpen: false, application: null, targetStatus: null });
      fetchApplications();
    } catch (err) {
      toast.error(err.message || "Failed to update application status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewCv = async (applicationId, fileName) => {
    try {
      setCvModal({
        isOpen: true,
        loading: true,
        fileName: fileName || "Candidate CV",
        url: "",
        error: "",
      });

      const res = await applicationService.getApplicationCv(applicationId);
      if (res?.data?.url) {
        setCvModal({
          isOpen: true,
          loading: false,
          fileName: res.data.fileName || fileName,
          url: res.data.url,
          error: "",
        });
      } else {
        throw new Error("Could not generate CV preview link.");
      }
    } catch (err) {
      setCvModal((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to retrieve CV file.",
      }));
    }
  };

  const handleDownloadCv = async (applicationId, fileName) => {
    try {
      toast.loading("Preparing secure download...", { id: "cv-dl" });
      const res = await applicationService.getApplicationCv(applicationId);
      if (res?.data?.url) {
        toast.dismiss("cv-dl");
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      toast.error(err.message || "Failed to download CV file.", { id: "cv-dl" });
    }
  };

  const toggleSelected = (id) => setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const selectAllVisible = (checked) => setSelectedIds(checked ? applications.filter(app => app.status === APPLICATION_STATUS.PASSED_CV).map(app => app._id) : []);
  const submitSchedule = async (event) => {
    event.preventDefault(); setScheduleError(""); setScheduleBusy(true);
    const localDateTime = time => new Date(`${scheduleForm.date}T${time}`).toISOString();
    const sharedInterview = { startTime: localDateTime(scheduleForm.start), endTime: localDateTime(scheduleForm.end), interviewType: scheduleForm.interviewType, meetingUrl: scheduleForm.interviewType === "ONLINE" ? scheduleForm.meetingUrl : undefined, officeAddress: scheduleForm.interviewType === "ONSITE" ? scheduleForm.officeAddress : undefined, notes: scheduleForm.notes || undefined };
    try {
      const result = await interviewService.bulkSchedule(selectedIds, sharedInterview);
      const scheduled = result.data?.scheduled || []; const failed = result.data?.failed || [];
      if (scheduled.length) toast.success(`Scheduled ${scheduled.length} candidate${scheduled.length === 1 ? "" : "s"}.`);
      if (failed.length) { const labels = failed.map(f => applications.find(app => app._id === f.applicationId)?.applicantName || f.applicationId); setScheduleError(`${scheduled.length} scheduled; ${failed.length} failed: ${labels.join(", ")}. ${failed.map(f => f.message).join("; ")}`); }
      setSelectedIds(failed.map(item => item.applicationId));
      if (!failed.length) setScheduleOpen(false);
      await fetchApplications();
    } catch (err) { setScheduleError(err.message || "Scheduling failed."); }
    finally { setScheduleBusy(false); }
  };

  // Only APPLIED, PASSED_CV, REJECTED_CV are supported in this simplified screening scope
  const filterOptions = [
    { value: APPLICATION_STATUS.REJECTED_CV, label: "Rejected CV" },
    { value: APPLICATION_STATUS.REJECTED_INTERVIEW, label: "Rejected Interview" },
    { value: APPLICATION_STATUS.INTERVIEWED, label: "Interviewed" },
  ];

  const isPdf = cvModal.fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Manage Jobs
        </Link>
      </div>

      <PageHeader
        title={jobInfo?.title ? `Applicants: ${jobInfo.title}` : "Job Applicants"}
        subtitle="Review applicant profiles, preview attached CVs, and screen applications."
      />

      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2" role="tablist" aria-label="Application stages">
        <button
          role="tab"
          aria-selected={statusFilter === ""}
          type="button"
          onClick={() => { setStatusFilter(""); goToPage(1); }}
          className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === "" ? "bg-teal-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
        >
          All
          <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-200/60 text-current">
            {statusCounts.ALL !== undefined ? statusCounts.ALL : total}
          </span>
        </button>

        {[
          [APPLICATION_STATUS.APPLIED, "Pending"],
          [APPLICATION_STATUS.PASSED_CV, "Passed CV"],
          [APPLICATION_STATUS.WAITING_INTERVIEW, "Waiting Interview"],
          [APPLICATION_STATUS.INTERVIEWED, "Waiting Result"],
          [APPLICATION_STATUS.PASSED, "Passed"],
        ].map(([value, label]) => (
          <button
            role="tab"
            aria-selected={statusFilter === value}
            key={value}
            type="button"
            onClick={() => { setStatusFilter(value); goToPage(1); }}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === value ? "bg-teal-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            {label}
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-200/60 text-current">
              {statusCounts[value] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar Directly Above Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by candidate name or email..."
              icon={Search}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                goToPage(1);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
            >
              Clear
            </button>
          )}
        </form>

        <div className="w-full sm:w-56 shrink-0">
          <Select placeholder="Other statuses" options={filterOptions} value={filterOptions.some(option => option.value === statusFilter) ? statusFilter : ""} onChange={(e) => { setStatusFilter(e.target.value); goToPage(1); }} />
        </div>
      </div>

      {statusFilter === APPLICATION_STATUS.PASSED_CV && selectedIds.length > 0 && (
        <div className="flex justify-between items-center rounded-xl bg-teal-50 border border-teal-200 p-3">
          <p className="text-sm text-teal-900 font-medium">
            {selectedIds.length} candidate{selectedIds.length === 1 ? "" : "s"} selected
          </p>
          <Button onClick={() => { setScheduleForm({ date: "", start: "", end: "", interviewType: "ONLINE", meetingUrl: "", officeAddress: "", notes: "" }); setScheduleError(""); setScheduleOpen(true); }}>
            Set Scheduler Interview
          </Button>
        </div>
      )}

      {loading ? (
        <div className="py-24 bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner text="Loading candidate applications..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchApplications} />
      ) : applications.length === 0 ? (
        <EmptyState
          title={searchInput || statusFilter ? "No matching applicants" : "No applicants yet"}
          description={
            searchInput || statusFilter
              ? "No applicants match your current search and filter criteria."
              : "Candidates will appear here once they submit applications for this job."
          }
          actionLabel={searchInput || statusFilter ? "Reset Filters" : null}
          onAction={() => {
            setSearchInput("");
            setStatusFilter("");
            goToPage(1);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  {statusFilter === APPLICATION_STATUS.PASSED_CV && <th className="px-4 py-4"><input type="checkbox" aria-label="Select all eligible applicants on this page" checked={applications.filter(a => a.status === APPLICATION_STATUS.PASSED_CV).length > 0 && applications.filter(a => a.status === APPLICATION_STATUS.PASSED_CV).every(a => selectedIds.includes(a._id))} onChange={e => selectAllVisible(e.target.checked)} /></th>}
                  <th scope="col" className="px-6 py-4">Applicant</th>
                  <th scope="col" className="px-6 py-4">Contact Info</th>
                  <th scope="col" className="px-6 py-4">Attached CV</th>
                  <th scope="col" className="px-6 py-4">Applied Date</th>
                  {/* Combined Status & Action column (no separate Actions column) */}
                  <th scope="col" className="px-6 py-4 text-center">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {applications.map((app) => {
                  const isApplied = app.status === APPLICATION_STATUS.APPLIED;
                  const isPassedCv = app.status === APPLICATION_STATUS.PASSED_CV;
                  const isWaitingInterview = app.status === APPLICATION_STATUS.WAITING_INTERVIEW;
                  const isInterviewed = app.status === APPLICATION_STATUS.INTERVIEWED;
                  const isUpdating = updatingId === app._id;

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      {statusFilter === APPLICATION_STATUS.PASSED_CV && <td className="px-4 py-4"><input type="checkbox" aria-label={`Select ${app.applicantName}`} checked={selectedIds.includes(app._id)} disabled={!isPassedCv} onChange={() => toggleSelected(app._id)} /></td>}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <Link className="hover:text-teal-700" to={`/recruiter/applications/${app._id}`}>{app.applicantName}</Link>
                        {app.interview && <p className="mt-1 text-xs font-normal text-slate-500">{new Date(app.interview.startTime).toLocaleString()} · {app.interview.interviewType}</p>}
                      </td>

                      <td className="px-6 py-4 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{app.applicantEmail}</span>
                        </div>
                        {app.applicantPhone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{app.applicantPhone}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        <CvActions applicationId={app._id} fileName={app.cv?.fileName} />
                        <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[150px]">
                          {app.cv?.fileName}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Combined Status and Screening actions */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {isApplied ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              disabled={isUpdating}
                              onClick={() =>
                                setConfirmDialog({
                                  isOpen: true,
                                  application: app,
                                  targetStatus: APPLICATION_STATUS.PASSED_CV,
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                              title="Accept candidate CV"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept CV
                            </button>

                            <button
                              disabled={isUpdating}
                              onClick={() =>
                                setConfirmDialog({
                                  isOpen: true,
                                  application: app,
                                  targetStatus: APPLICATION_STATUS.REJECTED_CV,
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                              title="Reject candidate CV"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject CV
                            </button>
                          </div>
                        ) : isPassedCv ? (
                          <button
                            type="button"
                            onClick={() => { setSelectedIds([app._id]); setScheduleForm({ date: "", start: "", end: "", interviewType: "ONLINE", meetingUrl: "", officeAddress: "", notes: "" }); setScheduleError(""); setScheduleOpen(true); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
                          >
                            Set Scheduler Interview
                          </button>
                        ) : isWaitingInterview ? (
                          <div className="inline-flex items-center gap-2">
                            <StatusBadge status={app.status} type="application" />
                            <Link
                              to={`/recruiter/applications/${app._id}/evaluate`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
                            >
                              Interview
                            </Link>
                          </div>
                        ) : isInterviewed ? (
                          <div className="inline-flex items-center gap-2">
                            <Link
                              to={`/recruiter/applications/${app._id}/evaluate`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                              title="View Interview Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusTransition(app, APPLICATION_STATUS.PASSED)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                              title="Accept Candidate"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusTransition(app, APPLICATION_STATUS.REJECTED_INTERVIEW)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                              title="Reject Candidate"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <StatusBadge status={app.status} type="application" />
                            {(app.status === APPLICATION_STATUS.PASSED || app.status === APPLICATION_STATUS.REJECTED_INTERVIEW) && (
                              <Link
                                to={`/recruiter/applications/${app._id}/evaluate`}
                                className="text-xs text-slate-500 hover:text-teal-700 underline font-medium"
                              >
                                Evaluation
                              </Link>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalItems={total}
            pageSize={limit}
          />
        </div>
      )}

      {/* Confirmation Dialog for Accept/Reject */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, application: null, targetStatus: null })}
        onConfirm={() =>
          handleStatusTransition(confirmDialog.application, confirmDialog.targetStatus)
        }
        loading={updatingId !== null}
        title={
          confirmDialog.targetStatus === APPLICATION_STATUS.PASSED_CV
            ? "Accept Candidate CV"
            : "Reject Candidate CV"
        }
        message={
          confirmDialog.targetStatus === APPLICATION_STATUS.PASSED_CV
            ? `Are you sure you want to accept the CV submitted by "${confirmDialog.application?.applicantName}"? This will advance their application to Accepted CV.`
            : `Are you sure you want to reject the CV submitted by "${confirmDialog.application?.applicantName}"? This will set the status to Rejected CV.`
        }
        confirmText={
          confirmDialog.targetStatus === APPLICATION_STATUS.PASSED_CV ? "Accept CV" : "Reject CV"
        }
        variant={
          confirmDialog.targetStatus === APPLICATION_STATUS.PASSED_CV ? "success" : "danger"
        }
      />

      {/* CV Preview Modal */}
      <Modal
        isOpen={cvModal.isOpen}
        onClose={() => setCvModal({ isOpen: false, loading: false, fileName: "", url: "", error: "" })}
        title={`CV Preview: ${cvModal.fileName}`}
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
                  Secure download preview (link active for 5 minutes)
                </span>
                <a
                  href={cvModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-600 hover:text-teal-800"
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
                    In-browser inline preview is supported for PDF files. Word and DOC files can be downloaded directly.
                  </p>
                  <a
                    href={cvModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm"
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
      <Modal isOpen={scheduleOpen} onClose={() => !scheduleBusy && setScheduleOpen(false)} title="Set Scheduler Interview" maxWidth="max-w-2xl">
        <form onSubmit={submitSchedule} className="space-y-4">
          <p className="text-sm text-slate-600">Scheduling {selectedIds.length} candidate{selectedIds.length === 1 ? "" : "s"} for <strong>{jobInfo?.title}</strong>. Each candidate will receive an individual interview record.</p>
          {scheduleError && <p role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{scheduleError}</p>}
          <div className="grid sm:grid-cols-3 gap-3"><Input label="Interview date" type="date" required value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} /><Input label="Start time" type="time" required value={scheduleForm.start} onChange={e => setScheduleForm({ ...scheduleForm, start: e.target.value })} /><Input label="End time" type="time" required value={scheduleForm.end} onChange={e => setScheduleForm({ ...scheduleForm, end: e.target.value })} /></div>
          <Select label="Interview format" options={[{ value: "ONLINE", label: "Online" }, { value: "ONSITE", label: "Offline" }]} value={scheduleForm.interviewType} onChange={e => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })} />
          {scheduleForm.interviewType === "ONLINE" ? <Input label="Meeting URL" type="url" required placeholder="https://meet.google.com/..." value={scheduleForm.meetingUrl} onChange={e => setScheduleForm({ ...scheduleForm, meetingUrl: e.target.value })} /> : <Input label="Office / interview address" required value={scheduleForm.officeAddress} onChange={e => setScheduleForm({ ...scheduleForm, officeAddress: e.target.value })} />}
          <div><label htmlFor="schedule-notes" className="block text-sm font-medium text-slate-700 mb-1">Instructions or private notes (optional)</label><textarea id="schedule-notes" rows="3" className="w-full border rounded-lg p-3 text-sm" value={scheduleForm.notes} onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" disabled={scheduleBusy} onClick={() => setScheduleOpen(false)}>Cancel</Button><Button type="submit" loading={scheduleBusy} disabled={!selectedIds.length}>Schedule {selectedIds.length} candidate{selectedIds.length === 1 ? "" : "s"}</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default JobApplications;
