import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import applicationService from "../../services/applicationService";
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
        setPaginationData(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to load job applicants.");
    } finally {
      setLoading(false);
    }
  }, [jobId, page, limit, statusFilter, searchInput, setPaginationData]);

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

  // Only APPLIED, PASSED_CV, REJECTED_CV are supported in this simplified screening scope
  const filterOptions = [
    { value: APPLICATION_STATUS.APPLIED, label: "Applied" },
    { value: APPLICATION_STATUS.PASSED_CV, label: "Accepted CV" },
    { value: APPLICATION_STATUS.REJECTED_CV, label: "Rejected CV" },
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
          <Select
            placeholder="All Statuses"
            options={filterOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              goToPage(1);
            }}
          />
        </div>
      </div>

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
                  <th scope="col" className="px-6 py-4">Applicant</th>
                  <th scope="col" className="px-6 py-4">Contact Info</th>
                  <th scope="col" className="px-6 py-4">Attached CV</th>
                  <th scope="col" className="px-6 py-4">Applied Date</th>
                  {/* Combined Status & Action column (no separate Actions column) */}
                  <th scope="col" className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {applications.map((app) => {
                  const isApplied = app.status === APPLICATION_STATUS.APPLIED;
                  const isUpdating = updatingId === app._id;

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {app.applicantName}
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCv(app._id, app.cv?.fileName)}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                            title="Preview CV"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View CV
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => handleDownloadCv(app._id, app.cv?.fileName)}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700"
                            title="Download CV"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                        </div>
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
                        ) : (
                          <StatusBadge status={app.status} type="application" />
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
                  className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-800"
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
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

export default JobApplications;
