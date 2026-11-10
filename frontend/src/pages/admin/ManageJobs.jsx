import React, { useState, useEffect, useCallback } from "react";
import adminService from "../../services/adminService";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import {
  Briefcase,
  Search,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  JOB_CATEGORY_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  SALARY_CURRENCY,
} from "../../utils/constants";
import toast from "react-hot-toast";

export const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Detail Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const {
    page,
    limit,
    total,
    totalPages,
    setPaginationData,
    goToPage,
  } = usePagination(1, 10);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit };
      if (appliedSearch.trim()) params.search = appliedSearch.trim();

      const res = await adminService.jobs(params);
      if (res?.data) {
        setJobs(res.data.jobs || []);
        setPaginationData(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to load platform jobs.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, appliedSearch, setPaginationData]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
    goToPage(1);
  };

  const handleToggleVisibility = async (job) => {
    const isVisible = job.isVisible;
    const actionLabel = isVisible ? "hide" : "restore";

    try {
      setTogglingId(job._id);
      if (isVisible) {
        await adminService.hideJob(job._id);
        toast.success(`Job "${job.title}" is now hidden from public listings.`);
      } else {
        await adminService.restoreJob(job._id);
        toast.success(`Job "${job.title}" has been restored to public listings.`);
      }

      // Update local state
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, isVisible: !isVisible } : j))
      );
      if (selectedJob?._id === job._id) {
        setSelectedJob((prev) => ({ ...prev, isVisible: !isVisible }));
      }
    } catch (err) {
      toast.error(err.message || `Failed to ${actionLabel} job.`);
    } finally {
      setTogglingId(null);
    }
  };

  const formatSalary = (min, max, currency) => {
    if (min == null && max == null) return "Negotiable";
    const curr = currency === SALARY_CURRENCY.USD ? "$" : "₫";
    if (min != null && max != null) {
      return `${curr}${min.toLocaleString()} – ${curr}${max.toLocaleString()}`;
    }
    if (min != null) return `From ${curr}${min.toLocaleString()}`;
    return `Up to ${curr}${max.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Job Postings"
        subtitle="Oversee all platform job vacancies, monitor candidate application activity, and moderate job visibility."
      />

      {/* Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-slate-400"
            placeholder="Search jobs by title or company name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setAppliedSearch("");
              goToPage(1);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
          >
            Clear
          </button>
        )}
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="py-24 bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner text="Loading jobs catalog..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchJobs} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description={
            appliedSearch
              ? `No jobs match your search "${appliedSearch}".`
              : "No jobs have been posted on the platform yet."
          }
          actionLabel={appliedSearch ? "Reset Search" : null}
          onAction={() => {
            setSearchInput("");
            setAppliedSearch("");
            goToPage(1);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Job Title & Category</th>
                  <th scope="col" className="px-6 py-4">Company / Recruiter</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Posted Date</th>
                  <th scope="col" className="px-6 py-4 text-center">Applications</th>
                  <th scope="col" className="px-6 py-4 text-center">Visibility</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {jobs.map((job) => {
                  const isBusy = togglingId === job._id;

                  return (
                    <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{job.title}</span>
                        <span className="text-xs text-teal-700 font-semibold">
                          {JOB_CATEGORY_LABELS[job.category] || job.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.recruiterId?.companyName || "Unknown Company"}</span>
                        </div>
                        <span className="text-slate-400 block text-[11px] mt-0.5">
                          {job.recruiterId?.email}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            job.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : job.status === "CLOSED"
                              ? "bg-slate-100 text-slate-700 border-slate-300"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(job.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 text-xs text-center font-bold text-slate-800">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          {job.applicationCount || 0}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-center">
                        {job.isVisible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Eye className="w-3.5 h-3.5" />
                            Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <EyeOff className="w-3.5 h-3.5" />
                            Hidden
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedJob(job);
                              setDetailModalOpen(true);
                            }}
                          >
                            Details
                          </Button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleToggleVisibility(job)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                              job.isVisible
                                ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
                                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                            }`}
                          >
                            {job.isVisible ? "Hide" : "Restore"}
                          </button>
                        </div>
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

      {/* Job Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedJob ? selectedJob.title : "Job Posting Details"}
        maxWidth="max-w-2xl"
      >
        {selectedJob && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-teal-700 font-semibold block mb-0.5">
                  {JOB_CATEGORY_LABELS[selectedJob.category] || selectedJob.category}
                </span>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">
                  {selectedJob.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Posted by {selectedJob.recruiterId?.companyName} ({selectedJob.recruiterId?.email})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={togglingId === selectedJob._id}
                  onClick={() => handleToggleVisibility(selectedJob)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    selectedJob.isVisible
                      ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                  }`}
                >
                  {selectedJob.isVisible ? "Hide from Candidates" : "Restore Visibility"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">Compensation</span>
                <span className="font-semibold text-emerald-700">
                  {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.salaryCurrency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="font-semibold text-slate-800">
                  {selectedJob.location || "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Arrangement</span>
                <span className="font-semibold text-slate-800">
                  {selectedJob.workLocationType || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Employment Type</span>
                <span className="font-semibold text-slate-800">
                  {EMPLOYMENT_TYPE_LABELS[selectedJob.employmentType] || selectedJob.employmentType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Experience</span>
                <span className="font-semibold text-slate-800">
                  {EXPERIENCE_LEVEL_LABELS[selectedJob.experienceLevel] || selectedJob.experienceLevel}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Applications</span>
                <span className="font-bold text-teal-700">
                  {selectedJob.applicationCount || 0} candidate(s)
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Job Description
              </h4>
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                {selectedJob.description || "No description provided."}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageJobs;
