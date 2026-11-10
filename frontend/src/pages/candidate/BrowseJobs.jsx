import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import jobService from "../../services/jobService";
import PageHeader from "../../components/common/PageHeader";
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
  Check,
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

const SALARY_PRESETS = [
  { label: "Under 10M", min: 0, max: 10000000 },
  { label: "10M – 20M", min: 10000000, max: 20000000 },
  { label: "20M – 35M", min: 20000000, max: 35000000 },
  { label: "Above 35M", min: 35000000, max: null },
];

export const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Search input
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  // Multi-select filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState([]);
  const [selectedWorkLocationTypes, setSelectedWorkLocationTypes] = useState([]);

  // Salary filters
  const [salaryMinInput, setSalaryMinInput] = useState("");
  const [salaryMaxInput, setSalaryMaxInput] = useState("");
  const [appliedSalaryMin, setAppliedSalaryMin] = useState("");
  const [appliedSalaryMax, setAppliedSalaryMax] = useState("");
  const [selectedSalaryPreset, setSelectedSalaryPreset] = useState(null);

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
      if (appliedKeyword.trim()) params.keyword = appliedKeyword.trim();
      if (selectedCategories.length) params.category = selectedCategories.join(",");
      if (selectedEmploymentTypes.length) params.employmentType = selectedEmploymentTypes.join(",");
      if (selectedExperienceLevels.length) params.experienceLevel = selectedExperienceLevels.join(",");
      if (selectedWorkLocationTypes.length) params.workLocationType = selectedWorkLocationTypes.join(",");
      if (appliedSalaryMin) params.salaryMin = appliedSalaryMin;
      if (appliedSalaryMax) params.salaryMax = appliedSalaryMax;

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
    appliedKeyword,
    selectedCategories,
    selectedEmploymentTypes,
    selectedExperienceLevels,
    selectedWorkLocationTypes,
    appliedSalaryMin,
    appliedSalaryMax,
    setPaginationData,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedKeyword(keyword);
    goToPage(1);
  };

  const toggleArrayFilter = (setter, currentList, value) => {
    setter(
      currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value]
    );
    goToPage(1);
  };

  const handleSalaryPresetClick = (preset) => {
    if (selectedSalaryPreset === preset.label) {
      // Toggle off
      setSelectedSalaryPreset(null);
      setSalaryMinInput("");
      setSalaryMaxInput("");
      setAppliedSalaryMin("");
      setAppliedSalaryMax("");
    } else {
      setSelectedSalaryPreset(preset.label);
      setSalaryMinInput(preset.min ? String(preset.min) : "");
      setSalaryMaxInput(preset.max ? String(preset.max) : "");
      setAppliedSalaryMin(preset.min ? String(preset.min) : "");
      setAppliedSalaryMax(preset.max ? String(preset.max) : "");
    }
    goToPage(1);
  };

  const handleApplyCustomSalary = (e) => {
    e?.preventDefault();
    setSelectedSalaryPreset(null);
    setAppliedSalaryMin(salaryMinInput);
    setAppliedSalaryMax(salaryMaxInput);
    goToPage(1);
  };

  const handleResetFilters = () => {
    setKeyword("");
    setAppliedKeyword("");
    setSelectedCategories([]);
    setSelectedEmploymentTypes([]);
    setSelectedExperienceLevels([]);
    setSelectedWorkLocationTypes([]);
    setSalaryMinInput("");
    setSalaryMaxInput("");
    setAppliedSalaryMin("");
    setAppliedSalaryMax("");
    setSelectedSalaryPreset(null);
    goToPage(1);
  };

  const hasActiveFilters = Boolean(
    appliedKeyword ||
      selectedCategories.length ||
      selectedEmploymentTypes.length ||
      selectedExperienceLevels.length ||
      selectedWorkLocationTypes.length ||
      appliedSalaryMin ||
      appliedSalaryMax
  );

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
        title="Explore Career Opportunities"
        subtitle="Discover verified roles matching your expertise, experience, and location preferences."
      />

      {/* Top Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-slate-400"
            placeholder="Search by job title, company name, or keywords..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary">
            Search Jobs
          </Button>
          <button
            type="button"
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => setShowMobileFilters((v) => !v)}
          >
            <SlidersHorizontal className="w-4 h-4 text-teal-700" />
            {showMobileFilters ? "Hide Filters" : "Filters"}
          </button>
        </div>
      </form>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar (4 cols) */}
        <aside
          className={`${
            showMobileFilters ? "block" : "hidden"
          } lg:block lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-700" />
              Filter Opportunities
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Salary Range Filter (TopCV style) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Salary Range (VND)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SALARY_PRESETS.map((preset) => {
                const isSelected = selectedSalaryPreset === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSalaryPresetClick(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border text-center ${
                      isSelected
                        ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max inputs */}
            <div className="pt-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min salary"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  value={salaryMinInput}
                  onChange={(e) => setSalaryMinInput(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max salary"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  value={salaryMaxInput}
                  onChange={(e) => setSalaryMaxInput(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCustomSalary}
                className="mt-2 w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                Apply Custom Range
              </button>
            </div>
          </div>

          {/* Work Location Arrangement */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Work Arrangement
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(WORK_LOCATION_TYPE).map((w) => {
                const isSelected = selectedWorkLocationTypes.includes(w);
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() =>
                      toggleArrayFilter(
                        setSelectedWorkLocationTypes,
                        selectedWorkLocationTypes,
                        w
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-teal-50 text-teal-800 border-teal-300 font-semibold"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-700" />}
                    {WORK_LOCATION_TYPE_LABELS[w] || w}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employment Type */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Employment Type
            </label>
            <div className="space-y-2">
              {Object.values(EMPLOYMENT_TYPE).map((t) => {
                const isChecked = selectedEmploymentTypes.includes(t);
                return (
                  <label
                    key={t}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        toggleArrayFilter(
                          setSelectedEmploymentTypes,
                          selectedEmploymentTypes,
                          t
                        )
                      }
                      className="rounded border-slate-300 text-teal-700 focus:ring-teal-600 w-4 h-4"
                    />
                    <span>{EMPLOYMENT_TYPE_LABELS[t] || t}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Experience Level
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(EXPERIENCE_LEVEL).map((lvl) => {
                const isSelected = selectedExperienceLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      toggleArrayFilter(
                        setSelectedExperienceLevels,
                        selectedExperienceLevels,
                        lvl
                      )
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-teal-700 text-white border-teal-700 font-semibold"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {EXPERIENCE_LEVEL_LABELS[lvl] || lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Category */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Industry Category
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {Object.values(JOB_CATEGORY).map((cat) => {
                const isChecked = selectedCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        toggleArrayFilter(setSelectedCategories, selectedCategories, cat)
                      }
                      className="rounded border-slate-300 text-teal-700 focus:ring-teal-600 w-4 h-4"
                    />
                    <span className="truncate">{JOB_CATEGORY_LABELS[cat] || cat}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Content Column: Active Badges + Job Cards (8 cols) */}
        <section className="lg:col-span-8 space-y-5">
          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Active:
              </span>

              {appliedKeyword && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200">
                  Keyword: "{appliedKeyword}"
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedKeyword("");
                      setKeyword("");
                    }}
                    className="hover:text-teal-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedSalaryPreset && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200">
                  Salary: {selectedSalaryPreset}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSalaryPreset(null);
                      setSalaryMinInput("");
                      setSalaryMaxInput("");
                      setAppliedSalaryMin("");
                      setAppliedSalaryMax("");
                    }}
                    className="hover:text-teal-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {!selectedSalaryPreset && (appliedSalaryMin || appliedSalaryMax) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200">
                  Salary: {appliedSalaryMin ? `₫${Number(appliedSalaryMin).toLocaleString()}` : "0"} – {appliedSalaryMax ? `₫${Number(appliedSalaryMax).toLocaleString()}` : "∞"}
                  <button
                    type="button"
                    onClick={() => {
                      setSalaryMinInput("");
                      setSalaryMaxInput("");
                      setAppliedSalaryMin("");
                      setAppliedSalaryMax("");
                    }}
                    className="hover:text-teal-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedWorkLocationTypes.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200"
                >
                  {WORK_LOCATION_TYPE_LABELS[w] || w}
                  <button
                    type="button"
                    onClick={() =>
                      toggleArrayFilter(
                        setSelectedWorkLocationTypes,
                        selectedWorkLocationTypes,
                        w
                      )
                    }
                    className="hover:text-teal-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedEmploymentTypes.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200"
                >
                  {EMPLOYMENT_TYPE_LABELS[t] || t}
                  <button
                    type="button"
                    onClick={() =>
                      toggleArrayFilter(
                        setSelectedEmploymentTypes,
                        selectedEmploymentTypes,
                        t
                      )
                    }
                    className="hover:text-teal-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedExperienceLevels.map((lvl) => (
                <span
                  key={lvl}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200"
                >
                  {EXPERIENCE_LEVEL_LABELS[lvl] || lvl}
                  <button
                    type="button"
                    onClick={() =>
                      toggleArrayFilter(
                        setSelectedExperienceLevels,
                        selectedExperienceLevels,
                        lvl
                      )
                    }
                    className="hover:text-teal-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedCategories.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200"
                >
                  {JOB_CATEGORY_LABELS[c] || c}
                  <button
                    type="button"
                    onClick={() =>
                      toggleArrayFilter(setSelectedCategories, selectedCategories, c)
                    }
                    className="hover:text-teal-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
              >
                Clear all
              </button>
            </div>
          )}

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block mb-1.5 border border-teal-100">
                            {JOB_CATEGORY_LABELS[job.category] || job.category}
                          </span>
                          <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1 text-base">
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.recruiterId?.companyName || "Verified Employer"}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        {job.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 font-semibold text-emerald-700">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType} · {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(job.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <Link
                        to={`/jobs/${job._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:text-teal-800 transition-colors"
                      >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
        </section>
      </div>
    </div>
  );
};

export default BrowseJobs;
