import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import applicationService from "../../services/applicationService";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import {
  Search,
  Building,
  Calendar,
  ArrowRight,
  Eye,
  Download,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "../../utils/constants";
import toast from "react-hot-toast";

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and status filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // CV Preview Modal
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
      const res = await applicationService.getMyApplications(params);
      if (res?.data) {
        setApplications(res.data.applications || []);
        setPaginationData(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, setPaginationData]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleViewCv = async (applicationId, fileName) => {
    try {
      setCvModal({
        isOpen: true,
        loading: true,
        fileName: fileName || "My CV",
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

  // Filter applications by search query (job title / company name)
  const filteredApplications = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const title = app.jobId?.title?.toLowerCase() || "";
    const company = app.jobId?.recruiterId?.companyName?.toLowerCase() || "";
    return title.includes(q) || company.includes(q);
  });

  const statusOptions = [
    { value: APPLICATION_STATUS.APPLIED, label: "Applied" },
    { value: APPLICATION_STATUS.PASSED_CV, label: "Accepted CV" },
    { value: APPLICATION_STATUS.REJECTED_CV, label: "Rejected CV" },
  ];

  const isPdf = cvModal.fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Job Applications"
        subtitle="Track the status of your applications and manage your submitted CVs."
      />

      {/* Search & Filter Bar Directly Above Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by job title or company name..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56 shrink-0">
          <Select
            placeholder="All Statuses"
            options={statusOptions}
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
          <LoadingSpinner text="Fetching your application history..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchApplications} />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          title={searchQuery || statusFilter ? "No matching applications" : "No applications submitted"}
          description={
            searchQuery || statusFilter
              ? "You do not have any applications matching the selected search and filter."
              : "You have not submitted any job applications yet. Explore available openings to apply."
          }
          actionLabel={searchQuery || statusFilter ? "Reset Filters" : "Find Jobs"}
          onAction={() => {
            if (searchQuery || statusFilter) {
              setSearchQuery("");
              setStatusFilter("");
            } else {
              window.location.assign("/jobs");
            }
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Applied Job</th>
                  <th scope="col" className="px-6 py-4">Company</th>
                  <th scope="col" className="px-6 py-4">Submitted CV</th>
                  <th scope="col" className="px-6 py-4">Date Applied</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/candidate/applications/${app._id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                      >
                        {app.jobId?.title || "Job Posting"}
                      </Link>
                      <span className="text-xs text-slate-400 font-normal">
                        {EMPLOYMENT_TYPE_LABELS[app.jobId?.employmentType] || app.jobId?.employmentType}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{app.jobId?.recruiterId?.companyName || "Company"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewCv(app._id, app.cv?.fileName)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                          title="View CV"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
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
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[130px]">
                        {app.cv?.fileName || "CV File"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} type="application" />
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/candidate/applications/${app._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        View Detail
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
                  Secure download link active for 5 minutes
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
                    In-browser preview is available for PDF documents. Word files can be downloaded directly.
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

export default MyApplications;
