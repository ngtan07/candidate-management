import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import jobService from "../../services/jobService";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  ArrowRight,
  SlidersHorizontal,
  X,
  RotateCcw,
} from "lucide-react";
import {
  JOB_CATEGORY,
  JOB_CATEGORY_LABELS,
  EMPLOYMENT_TYPE,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL,
  EXPERIENCE_LEVEL_LABELS,
  WORK_LOCATION_TYPE,
  WORK_LOCATION_TYPE_LABELS,
  SALARY_CURRENCY,
} from "../../utils/constants";

export const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter state
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [workLocationType, setWorkLocationType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");

  const {
    page,
    limit,
    total,
    totalPages,
    setPaginationData,
    goToPage,
  } = usePagination(1, 9);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (category) params.category = category;
      if (employmentType) params.employmentType = employmentType;
      if (experienceLevel) params.experienceLevel = experienceLevel;
      if (workLocationType) params.workLocationType = workLocationType;
      if (salaryMin) params.salaryMin = salaryMin;

      const res = await jobService.getPublicJobs(params);
      if (res?.data) {
        setJobs(res.data.jobs || []);
        setPaginationData(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to load job listings.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    keyword,
    category,
    employmentType,
    experienceLevel,
    workLocationType,
    salaryMin,
    setPaginationData,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    goToPage(1);
  };

  const handleResetFilters = () => {
    setKeyword("");
    setCategory("");
    setEmploymentType("");
    setExperienceLevel("");
    setWorkLocationType("");
    setSalaryMin("");
    goToPage(1);
  };

  const hasActiveFilters =
    Boolean(keyword || category || employmentType || experienceLevel || workLocationType || salaryMin);

  const categoryOptions = Object.values(JOB_CATEGORY).map((cat) => ({
    value: cat,
    label: JOB_CATEGORY_LABELS[cat] || cat,
  }));

  const employmentTypeOptions = Object.values(EMPLOYMENT_TYPE).map((t) => ({
    value: t,
    label: EMPLOYMENT_TYPE_LABELS[t] || t,
  }));

  const experienceLevelOptions = Object.values(EXPERIENCE_LEVEL).map((l) => ({
    value: l,
    label: EXPERIENCE_LEVEL_LABELS[l] || l,
  }));

  const workLocationOptions = Object.values(WORK_LOCATION_TYPE).map((w) => ({
    value: w,
    label: WORK_LOCATION_TYPE_LABELS[w] || w,
  }));

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
    <div className="space-y-6">
      <PageHeader
        title="Explore Career Opportunities"
        subtitle="Discover verified roles matching your expertise, experience, and location preferences."
      />

      {/* Main Filter & Search Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Top Search Line */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by job title, skill, or location..."
              icon={Search}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-60">
            <Select
              placeholder="All Categories"
              options={categoryOptions}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                goToPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center gap-1.5 ${
                showAdvanced || (hasActiveFilters && !category && !keyword)
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              title="Toggle Advanced Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Filters</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Expandable Advanced Filters */}
        {showAdvanced && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              label="Employment Type"
              placeholder="All Types"
              options={employmentTypeOptions}
              value={employmentType}
              onChange={(e) => {
                setEmploymentType(e.target.value);
                goToPage(1);
              }}
            />

            <Select
              label="Experience Level"
              placeholder="All Levels"
              options={experienceLevelOptions}
              value={experienceLevel}
              onChange={(e) => {
                setExperienceLevel(e.target.value);
                goToPage(1);
              }}
            />

            <Select
              label="Work Arrangement"
              placeholder="All Arrangements"
              options={workLocationOptions}
              value={workLocationType}
              onChange={(e) => {
                setWorkLocationType(e.target.value);
                goToPage(1);
              }}
            />

            <Input
              label="Min Salary (VND/USD)"
              type="number"
              placeholder="e.g. 15000000"
              value={salaryMin}
              onChange={(e) => {
                setSalaryMin(e.target.value);
                goToPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Results State */}
      {loading ? (
        <div className="py-24 bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner text="Searching for opportunities..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchJobs} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description={
            hasActiveFilters
              ? "No job vacancies match your specific search criteria. Try broadening your filters."
              : "There are currently no active job openings available. Please check back soon!"
          }
          actionLabel={hasActiveFilters ? "Reset Filters" : null}
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>
              Showing {jobs.length} of {total} open position{total !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                      {JOB_CATEGORY_LABELS[job.category] || job.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {WORK_LOCATION_TYPE_LABELS[job.workLocationType] || job.workLocationType}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5">
                    <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-4 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.recruiterId?.companyName || "Confidential Company"}</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-5">
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType} •{" "}
                        {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {formatSalary(
                          job.salaryMin,
                          job.salaryMax,
                          job.salaryCurrency,
                          job.salaryPeriod
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Deadline:{" "}
                    {job.applicationEndDate
                      ? new Date(job.applicationEndDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "Open"}
                  </span>

                  <Link
                    to={`/jobs/${job._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default BrowseJobs;
