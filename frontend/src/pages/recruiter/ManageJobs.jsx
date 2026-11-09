import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import jobService from "../../services/jobService";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import usePagination from "../../hooks/usePagination";
import {
  PlusCircle,
  Eye,
  Edit3,
  XCircle,
  Trash2,
  CheckCircle,
  Users,
} from "lucide-react";
import { JOB_STATUS } from "../../utils/constants";
import toast from "react-hot-toast";

const TABS = [
  { key: "", label: "All" },
  { key: JOB_STATUS.OPENING, label: "Opening" },
  { key: JOB_STATUS.CLOSED, label: "Closed" },
  { key: JOB_STATUS.DRAFT, label: "Draft" },
];

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "–";

export const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    job: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const { page, limit, total, totalPages, setPaginationData, goToPage } =
    usePagination(1, 10);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit };
      if (activeTab) params.status = activeTab;
      const res = await jobService.getMyJobs(params);
      if (res?.data) {
        setJobs(res.data.jobs || []);
        setPaginationData(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to load job postings.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeTab, setPaginationData]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    goToPage(1);
  };

  const handleActionConfirm = async () => {
    const { type, job } = confirmModal;
    if (!job) return;
    try {
      setActionLoading(true);
      if (type === "publish") {
        await jobService.publishJob(job._id);
        toast.success(`"${job.title}" published!`);
      } else if (type === "close") {
        await jobService.closeJob(job._id);
        toast.success(`"${job.title}" closed.`);
      } else if (type === "delete") {
        await jobService.deleteJob(job._id);
        toast.success(`"${job.title}" deleted.`);
      }
      setConfirmModal({ isOpen: false, type: null, job: null });
      fetchJobs();
    } catch (err) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Manage Job Postings"
          subtitle="Create, publish, and monitor your job listings."
        />
        <Link to="/recruiter/jobs/new">
          <Button variant="primary" size="md" icon={PlusCircle}>
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner text="Loading job postings..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchJobs} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title={activeTab ? `No ${activeTab.toLowerCase()} jobs` : "No job postings yet"}
          description={
            activeTab
              ? "No job postings match this status."
              : "Create your first job posting to start receiving applications."
          }
          actionLabel={activeTab ? "View All" : "Create Job"}
          onAction={() => {
            if (activeTab) handleTabChange("");
            else window.location.assign("/recruiter/jobs/new");
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                  <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{job.title}</div>
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
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Detail */}
                        <Link
                          to={`/recruiter/jobs/${job._id}/detail`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="View Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit (DRAFT only) */}
                        {job.status === JOB_STATUS.DRAFT && (
                          <Link
                            to={`/recruiter/jobs/${job._id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Job"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                        )}

                        {/* Publish (DRAFT only) */}
                        {job.status === JOB_STATUS.DRAFT && (
                          <button
                            onClick={() =>
                              setConfirmModal({ isOpen: true, type: "publish", job })
                            }
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                            title="Publish Job"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Close (OPENING only) */}
                        {job.status === JOB_STATUS.OPENING && (
                          <button
                            onClick={() =>
                              setConfirmModal({ isOpen: true, type: "close", job })
                            }
                            className="p-1.5 text-amber-600 hover:text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                            title="Close Job"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() =>
                            setConfirmModal({ isOpen: true, type: "delete", job })
                          }
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() =>
          !actionLoading && setConfirmModal({ isOpen: false, type: null, job: null })
        }
        onConfirm={handleActionConfirm}
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
            ? `Publish "${confirmModal.job?.title}"? Candidates will be able to apply.`
            : confirmModal.type === "close"
            ? `Close "${confirmModal.job?.title}"? No new applications will be accepted.`
            : `Delete "${confirmModal.job?.title}"? This action cannot be undone.`
        }
        confirmText={
          confirmModal.type === "publish"
            ? "Publish Now"
            : confirmModal.type === "close"
            ? "Close Job"
            : "Delete"
        }
        variant={confirmModal.type === "publish" ? "success" : "danger"}
      />
    </div>
  );
};

export default ManageJobs;
