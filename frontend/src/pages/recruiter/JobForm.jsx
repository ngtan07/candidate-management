import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import jobService from "../../services/jobService";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { ArrowLeft, AlertCircle, Save, CheckCircle } from "lucide-react";
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
  SALARY_PERIOD,
  JOB_STATUS,
} from "../../utils/constants";
import toast from "react-hot-toast";

export const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    employmentType: "",
    experienceLevel: "",
    workLocationType: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: SALARY_CURRENCY.VND,
    salaryPeriod: SALARY_PERIOD.MONTH,
    numberOfPositions: "1",
    applicationStartDate: new Date().toISOString().split("T")[0],
    applicationEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  useEffect(() => {
    if (isEditing) {
      const fetchJobToEdit = async () => {
        try {
          setLoading(true);
          const res = await jobService.getMyJobById(id);
          if (res?.data?.job) {
            const j = res.data.job;
            if (j.status !== JOB_STATUS.DRAFT) {
              toast.error("Only draft jobs can be edited.");
              navigate("/recruiter/jobs");
              return;
            }
            setFormData({
              title: j.title || "",
              description: j.description || "",
              category: j.category || "",
              employmentType: j.employmentType || "",
              experienceLevel: j.experienceLevel || "",
              workLocationType: j.workLocationType || "",
              location: j.location || "",
              salaryMin: j.salaryMin != null ? String(j.salaryMin) : "",
              salaryMax: j.salaryMax != null ? String(j.salaryMax) : "",
              salaryCurrency: j.salaryCurrency || SALARY_CURRENCY.VND,
              salaryPeriod: j.salaryPeriod || SALARY_PERIOD.MONTH,
              numberOfPositions: String(j.numberOfPositions || 1),
              applicationStartDate: j.applicationStartDate
                ? new Date(j.applicationStartDate).toISOString().split("T")[0]
                : "",
              applicationEndDate: j.applicationEndDate
                ? new Date(j.applicationEndDate).toISOString().split("T")[0]
                : "",
            });
          }
        } catch (err) {
          toast.error(err.message || "Failed to load job for editing.");
          navigate("/recruiter/jobs");
        } finally {
          setLoading(false);
        }
      };

      fetchJobToEdit();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim() || formData.title.trim().length < 2) {
      newErrors.title = "Job title must be between 2 and 150 characters.";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required.";
    }
    if (!formData.category) {
      newErrors.category = "Job category is required.";
    }
    if (!formData.employmentType) {
      newErrors.employmentType = "Employment type is required.";
    }
    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Experience level is required.";
    }
    if (!formData.workLocationType) {
      newErrors.workLocationType = "Work location type is required.";
    }
    if (!formData.applicationStartDate) {
      newErrors.applicationStartDate = "Start date is required.";
    }
    if (!formData.applicationEndDate) {
      newErrors.applicationEndDate = "End date is required.";
    } else if (
      formData.applicationStartDate &&
      new Date(formData.applicationEndDate) <= new Date(formData.applicationStartDate)
    ) {
      newErrors.applicationEndDate = "End date must be strictly after start date.";
    }

    const min = formData.salaryMin ? Number(formData.salaryMin) : null;
    const max = formData.salaryMax ? Number(formData.salaryMax) : null;

    if (min != null && min < 0) newErrors.salaryMin = "Salary minimum cannot be negative.";
    if (max != null && max < 0) newErrors.salaryMax = "Salary maximum cannot be negative.";
    if (min != null && max != null && max < min) {
      newErrors.salaryMax = "Salary maximum cannot be less than minimum.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (targetStatus) => {
    setServerError("");
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        workLocationType: formData.workLocationType,
        location: formData.location.trim() || null,
        salaryMin: formData.salaryMin !== "" ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax !== "" ? Number(formData.salaryMax) : null,
        salaryCurrency: formData.salaryCurrency,
        salaryPeriod: formData.salaryPeriod,
        numberOfPositions: Number(formData.numberOfPositions) || 1,
        applicationStartDate: new Date(formData.applicationStartDate).toISOString(),
        applicationEndDate: new Date(formData.applicationEndDate).toISOString(),
      };

      if (!isEditing) {
        payload.status = targetStatus;
        await jobService.createJob(payload);
        toast.success(
          targetStatus === JOB_STATUS.OPENING
            ? "Job posted and published successfully!"
            : "Job saved as draft."
        );
      } else {
        await jobService.updateJob(id, payload);
        if (targetStatus === JOB_STATUS.OPENING) {
          await jobService.publishJob(id);
          toast.success("Job updated and published!");
        } else {
          toast.success("Job draft updated.");
        }
      }

      navigate("/recruiter/jobs");
    } catch (err) {
      if (err.validationErrors) {
        const fieldErrors = {};
        err.validationErrors.forEach((ve) => {
          fieldErrors[ve.field] = ve.message;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(err.message || "Failed to save job posting.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setCancelConfirmOpen(true);
    } else {
      navigate("/recruiter/jobs");
    }
  };

  const categoryOptions = Object.values(JOB_CATEGORY).map((c) => ({
    value: c,
    label: JOB_CATEGORY_LABELS[c] || c,
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

  if (loading) {
    return (
      <div className="py-24 bg-white rounded-2xl border border-slate-200">
        <LoadingSpinner text="Loading job data..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Manage Jobs
        </button>
      </div>

      <PageHeader
        title={isEditing ? "Edit Job Posting" : "Post New Job"}
        subtitle="Fill in the job details, requirements, compensation, and application period."
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Basic Details
            </h3>

            <Input
              label="Job Title"
              name="title"
              placeholder="e.g. Senior Fullstack Engineer"
              required
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              disabled={submitting}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Job Category"
                name="category"
                required
                options={categoryOptions}
                value={formData.category}
                onChange={handleChange}
                error={errors.category}
                disabled={submitting}
              />

              <Select
                label="Employment Type"
                name="employmentType"
                required
                options={employmentTypeOptions}
                value={formData.employmentType}
                onChange={handleChange}
                error={errors.employmentType}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Experience Level"
                name="experienceLevel"
                required
                options={experienceLevelOptions}
                value={formData.experienceLevel}
                onChange={handleChange}
                error={errors.experienceLevel}
                disabled={submitting}
              />

              <Select
                label="Work Location Type"
                name="workLocationType"
                required
                options={workLocationOptions}
                value={formData.workLocationType}
                onChange={handleChange}
                error={errors.workLocationType}
                disabled={submitting}
              />
            </div>

            <Input
              label="Specific Location / Address"
              name="location"
              placeholder="e.g. District 1, Ho Chi Minh City"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700">
              Job Description & Requirements <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={8}
              className={`w-full rounded-xl border text-sm p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.description
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
              placeholder="Outline responsibilities, required skills, qualifications, benefits..."
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.description && (
              <p className="text-xs text-red-600 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Compensation & Positions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Compensation & Capacity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Salary Min"
                name="salaryMin"
                type="number"
                placeholder="e.g. 20000000"
                value={formData.salaryMin}
                onChange={handleChange}
                error={errors.salaryMin}
                disabled={submitting}
              />

              <Input
                label="Salary Max"
                name="salaryMax"
                type="number"
                placeholder="e.g. 35000000"
                value={formData.salaryMax}
                onChange={handleChange}
                error={errors.salaryMax}
                disabled={submitting}
              />

              <Select
                label="Currency"
                name="salaryCurrency"
                options={[
                  { value: SALARY_CURRENCY.VND, label: "VND (₫)" },
                  { value: SALARY_CURRENCY.USD, label: "USD ($)" },
                ]}
                value={formData.salaryCurrency}
                onChange={handleChange}
                disabled={submitting}
              />

              <Select
                label="Period"
                name="salaryPeriod"
                options={[
                  { value: SALARY_PERIOD.MONTH, label: "Per Month" },
                  { value: SALARY_PERIOD.HOUR, label: "Per Hour" },
                  { value: SALARY_PERIOD.YEAR, label: "Per Year" },
                ]}
                value={formData.salaryPeriod}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="w-full sm:w-1/2">
              <Input
                label="Number of Positions"
                name="numberOfPositions"
                type="number"
                min="1"
                required
                value={formData.numberOfPositions}
                onChange={handleChange}
                error={errors.numberOfPositions}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Application Period
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                name="applicationStartDate"
                type="date"
                required
                value={formData.applicationStartDate}
                onChange={handleChange}
                error={errors.applicationStartDate}
                disabled={submitting}
              />

              <Input
                label="End Date"
                name="applicationEndDate"
                type="date"
                required
                value={formData.applicationEndDate}
                onChange={handleChange}
                error={errors.applicationEndDate}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                icon={Save}
                onClick={() => handleSave(JOB_STATUS.DRAFT)}
                loading={submitting}
              >
                Save as Draft
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                icon={CheckCircle}
                onClick={() => handleSave(JOB_STATUS.OPENING)}
                loading={submitting}
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={() => navigate("/recruiter/jobs")}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes. Are you sure you want to discard them and return to Manage Jobs?"
        confirmText="Discard Changes"
        variant="danger"
      />
    </div>
  );
};

export default JobForm;
