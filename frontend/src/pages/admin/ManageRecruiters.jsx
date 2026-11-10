import React, { useState, useEffect, useCallback } from "react";
import adminService from "../../services/adminService";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";

export const ManageRecruiters = () => {
  const [tab, setTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [recruiters, setRecruiters] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, active: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionBusyId, setActionBusyId] = useState(null);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Rejection Reason Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const {
    page,
    limit,
    total,
    totalPages,
    setPaginationData,
    goToPage,
  } = usePagination(1, 10);

  const fetchRecruiters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit, tab };
      if (appliedSearch.trim()) params.search = appliedSearch.trim();

      const res = await adminService.recruiters(params);
      if (res?.data) {
        setRecruiters(res.data.recruiters || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
        setPaginationData(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to load recruiters.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, tab, appliedSearch, setPaginationData]);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
    goToPage(1);
  };

  const handleViewDetail = async (recruiterId) => {
    try {
      setLoadingDetail(true);
      setDetailModalOpen(true);
      const res = await adminService.recruiter(recruiterId);
      if (res?.data) {
        setSelectedRecruiter(res.data.recruiter);
        setRecruiterJobs(res.data.jobs || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load recruiter details.");
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionBusyId(id);
      await adminService.review(id, "APPROVED");
      toast.success("Recruiter registration approved successfully.");
      if (detailModalOpen && selectedRecruiter?._id === id) {
        setSelectedRecruiter((prev) => ({ ...prev, registrationStatus: "APPROVED" }));
      }
      fetchRecruiters();
    } catch (err) {
      toast.error(err.message || "Failed to approve recruiter.");
    } finally {
      setActionBusyId(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectTargetId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      setRejectSubmitting(true);
      await adminService.review(rejectTargetId, "REJECTED", rejectionReason.trim());
      toast.success("Recruiter registration rejected.");
      setRejectModalOpen(false);
      if (detailModalOpen && selectedRecruiter?._id === rejectTargetId) {
        setSelectedRecruiter((prev) => ({ ...prev, registrationStatus: "REJECTED" }));
      }
      fetchRecruiters();
    } catch (err) {
      toast.error(err.message || "Failed to reject recruiter.");
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleToggleSuspend = async (recruiter) => {
    const isSuspending = recruiter.isActive;
    const actionText = isSuspending ? "suspend" : "reactivate";

    if (!window.confirm(`Are you sure you want to ${actionText} "${recruiter.companyName}"?`)) {
      return;
    }

    try {
      setActionBusyId(recruiter._id);
      if (isSuspending) {
        await adminService.suspend(recruiter._id);
        toast.success(`Account for "${recruiter.companyName}" suspended.`);
      } else {
        await adminService.reactivate(recruiter._id);
        toast.success(`Account for "${recruiter.companyName}" reactivated.`);
      }

      if (detailModalOpen && selectedRecruiter?._id === recruiter._id) {
        setSelectedRecruiter((prev) => ({ ...prev, isActive: !isSuspending }));
      }
      fetchRecruiters();
    } catch (err) {
      toast.error(err.message || `Failed to ${actionText} recruiter account.`);
    } finally {
      setActionBusyId(null);
    }
  };

  const TABS = [
    { key: "all", label: "All Recruiters", count: counts.all },
    { key: "pending", label: "Pending Approvals", count: counts.pending },
    { key: "active", label: "Active", count: counts.active },
    { key: "suspended", label: "Suspended", count: counts.suspended },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Recruiters"
        subtitle="Verify recruiter registrations, review business documentation, and manage platform accounts."
      />

      {/* Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              goToPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-200/60 text-current">
              {t.count || 0}
            </span>
          </button>
        ))}
      </div>

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
            placeholder="Search by company name, email, or tax/registration number..."
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

      {/* Main Table */}
      {loading ? (
        <div className="py-24 bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner text="Loading recruiter records..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRecruiters} />
      ) : recruiters.length === 0 ? (
        <EmptyState
          title="No recruiters found"
          description={
            appliedSearch
              ? `No recruiters match your search "${appliedSearch}".`
              : `There are currently no recruiters in the "${tab}" category.`
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
                  <th scope="col" className="px-6 py-4">Company & Recruiter</th>
                  <th scope="col" className="px-6 py-4">Contact</th>
                  <th scope="col" className="px-6 py-4">Business Reg No</th>
                  <th scope="col" className="px-6 py-4">Verification</th>
                  <th scope="col" className="px-6 py-4">Account Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recruiters.map((r) => {
                  const isBusy = actionBusyId === r._id;
                  const isPending = r.registrationStatus === "PENDING";
                  const isApproved = r.registrationStatus === "APPROVED";
                  const isRejected = r.registrationStatus === "REJECTED";

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-sm shrink-0">
                            {r.companyName?.charAt(0).toUpperCase() || "R"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {r.companyName}
                            </span>
                            <span className="text-xs text-slate-400">
                              Registered: {new Date(r.createdAt).toLocaleDateString("en-GB")}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{r.email}</span>
                        </div>
                        {r.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{r.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-slate-700">
                        {r.businessRegistrationNumber || "—"}
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Pending
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {r.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                            <ShieldAlert className="w-4 h-4 text-rose-600" />
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewDetail(r._id)}
                          >
                            Details
                          </Button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleApprove(r._id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50"
                                title="Approve recruiter registration"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => openRejectModal(r._id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs disabled:opacity-50"
                                title="Reject recruiter registration"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {!isPending && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleToggleSuspend(r)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                                r.isActive
                                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                              }`}
                            >
                              {r.isActive ? "Suspend" : "Reactivate"}
                            </button>
                          )}
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

      {/* Recruiter Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedRecruiter ? `${selectedRecruiter.companyName} — Details` : "Recruiter Details"}
        maxWidth="max-w-3xl"
      >
        {loadingDetail || !selectedRecruiter ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching full recruiter dossier..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800 font-bold text-lg">
                  {selectedRecruiter.companyName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedRecruiter.companyName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Account Status: {selectedRecruiter.isActive ? "Active" : "Suspended"} · Verification:{" "}
                    {selectedRecruiter.registrationStatus}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedRecruiter.registrationStatus === "PENDING" ? (
                  <>
                    <button
                      type="button"
                      disabled={actionBusyId === selectedRecruiter._id}
                      onClick={() => handleApprove(selectedRecruiter._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionBusyId === selectedRecruiter._id}
                      onClick={() => openRejectModal(selectedRecruiter._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={actionBusyId === selectedRecruiter._id}
                    onClick={() => handleToggleSuspend(selectedRecruiter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      selectedRecruiter.isActive
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                    }`}
                  >
                    {selectedRecruiter.isActive ? "Suspend Account" : "Reactivate Account"}
                  </button>
                )}
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                  Email Address
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedRecruiter.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                  Phone Number
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedRecruiter.phone || "Not provided"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                  Company Address
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedRecruiter.address || "Not provided"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                  Company Website
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {selectedRecruiter.website ? (
                    <a
                      href={selectedRecruiter.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:underline truncate"
                    >
                      {selectedRecruiter.website}
                    </a>
                  ) : (
                    <span>Not provided</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                  Tax / Business Registration No.
                </span>
                <p className="font-mono text-slate-800 font-semibold">
                  {selectedRecruiter.businessRegistrationNumber || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                  Business License Document
                </span>
                {selectedRecruiter.businessLicenseUrl ? (
                  <a
                    href={selectedRecruiter.businessLicenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs border border-teal-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View License Document
                  </a>
                ) : (
                  <span className="text-slate-400 italic">No document attached</span>
                )}
              </div>
            </div>

            {/* Associated Jobs */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">
                Posted Jobs ({recruiterJobs.length})
              </h4>
              {recruiterJobs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No jobs posted yet by this recruiter.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {recruiterJobs.map((j) => (
                    <div
                      key={j._id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 block">{j.title}</span>
                        <span className="text-slate-400 text-[11px]">
                          Status: {j.status} · Visibility: {j.isVisible ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-[11px]">
                        {j.workLocation || "On-site"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => !rejectSubmitting && setRejectModalOpen(false)}
        title="Reject Recruiter Registration"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please enter a clear explanation for rejecting this recruiter's registration.
          </p>
          <div>
            <label
              htmlFor="rejection-reason"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejection-reason"
              rows={4}
              required
              className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
              placeholder="e.g. Invalid business registration document, unverifiable company entity..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={rejectSubmitting}
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={rejectSubmitting}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageRecruiters;
