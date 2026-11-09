export const ROLE = Object.freeze({
  CANDIDATE: "CANDIDATE",
  RECRUITER: "RECRUITER",
  ADMIN: "ADMIN"
});

export const REGISTRATION_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
});

export const JOB_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  OPENING: "OPENING",
  CLOSED: "CLOSED"
});

export const EMPLOYMENT_TYPE = Object.freeze({
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  INTERNSHIP: "INTERNSHIP",
  CONTRACT: "CONTRACT",
  FREELANCE: "FREELANCE"
});

export const EXPERIENCE_LEVEL = Object.freeze({
  INTERN: "INTERN",
  FRESHER: "FRESHER",
  JUNIOR: "JUNIOR",
  MIDDLE: "MIDDLE",
  SENIOR: "SENIOR",
  LEADER: "LEADER"
});

export const WORK_LOCATION_TYPE = Object.freeze({
  ONSITE: "ONSITE",
  REMOTE: "REMOTE",
  HYBRID: "HYBRID"
});

export const JOB_CATEGORY = Object.freeze({
  IT_SOFTWARE: "IT_SOFTWARE",
  BUSINESS: "BUSINESS",
  MARKETING: "MARKETING",
  DESIGN: "DESIGN",
  FINANCE_ACCOUNTING: "FINANCE_ACCOUNTING",
  HUMAN_RESOURCES: "HUMAN_RESOURCES",
  SALES: "SALES",
  CUSTOMER_SERVICE: "CUSTOMER_SERVICE",
  ENGINEERING: "ENGINEERING",
  EDUCATION: "EDUCATION",
  LOGISTICS: "LOGISTICS",
  OTHER: "OTHER"
});

export const SALARY_PERIOD = Object.freeze({
  HOUR: "HOUR",
  MONTH: "MONTH",
  YEAR: "YEAR"
});

export const SALARY_CURRENCY = Object.freeze({
  VND: "VND",
  USD: "USD"
});

export const APPLICATION_STATUS = Object.freeze({
  APPLIED: "APPLIED",
  PASSED_CV: "PASSED_CV",
  REJECTED_CV: "REJECTED_CV",
  WAITING_INTERVIEW: "WAITING_INTERVIEW",
  INTERVIEWED: "INTERVIEWED",
  PASSED: "PASSED",
  REJECTED_INTERVIEW: "REJECTED_INTERVIEW"
});

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.APPLIED]: "Applied",
  [APPLICATION_STATUS.PASSED_CV]: "Accepted CV",
  [APPLICATION_STATUS.REJECTED_CV]: "Rejected CV",
  [APPLICATION_STATUS.WAITING_INTERVIEW]: "Waiting for Interview",
  [APPLICATION_STATUS.INTERVIEWED]: "Interviewed",
  [APPLICATION_STATUS.PASSED]: "Accepted / Offer",
  [APPLICATION_STATUS.REJECTED_INTERVIEW]: "Rejected (Interview)"
};

export const APPLICATION_STATUS_COLORS = {
  [APPLICATION_STATUS.APPLIED]: "bg-blue-50 text-blue-700 border-blue-200",
  [APPLICATION_STATUS.PASSED_CV]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [APPLICATION_STATUS.REJECTED_CV]: "bg-rose-50 text-rose-700 border-rose-200",
  [APPLICATION_STATUS.WAITING_INTERVIEW]: "bg-amber-50 text-amber-700 border-amber-200",
  [APPLICATION_STATUS.INTERVIEWED]: "bg-purple-50 text-purple-700 border-purple-200",
  [APPLICATION_STATUS.PASSED]: "bg-green-100 text-green-800 border-green-300",
  [APPLICATION_STATUS.REJECTED_INTERVIEW]: "bg-red-50 text-red-700 border-red-200"
};

export const JOB_STATUS_COLORS = {
  [JOB_STATUS.DRAFT]: "bg-slate-100 text-slate-700 border-slate-200",
  [JOB_STATUS.OPENING]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [JOB_STATUS.CLOSED]: "bg-rose-50 text-rose-700 border-rose-200"
};

export const REGISTRATION_STATUS_COLORS = {
  [REGISTRATION_STATUS.PENDING]: "bg-amber-50 text-amber-700 border-amber-200",
  [REGISTRATION_STATUS.APPROVED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [REGISTRATION_STATUS.REJECTED]: "bg-rose-50 text-rose-700 border-rose-200"
};

export const EMPLOYMENT_TYPE_LABELS = {
  [EMPLOYMENT_TYPE.FULL_TIME]: "Full Time",
  [EMPLOYMENT_TYPE.PART_TIME]: "Part Time",
  [EMPLOYMENT_TYPE.INTERNSHIP]: "Internship",
  [EMPLOYMENT_TYPE.CONTRACT]: "Contract",
  [EMPLOYMENT_TYPE.FREELANCE]: "Freelance"
};

export const EXPERIENCE_LEVEL_LABELS = {
  [EXPERIENCE_LEVEL.INTERN]: "Intern",
  [EXPERIENCE_LEVEL.FRESHER]: "Fresher",
  [EXPERIENCE_LEVEL.JUNIOR]: "Junior",
  [EXPERIENCE_LEVEL.MIDDLE]: "Middle",
  [EXPERIENCE_LEVEL.SENIOR]: "Senior",
  [EXPERIENCE_LEVEL.LEADER]: "Leader / Lead"
};

export const WORK_LOCATION_TYPE_LABELS = {
  [WORK_LOCATION_TYPE.ONSITE]: "On-site",
  [WORK_LOCATION_TYPE.REMOTE]: "Remote",
  [WORK_LOCATION_TYPE.HYBRID]: "Hybrid"
};

export const JOB_CATEGORY_LABELS = {
  [JOB_CATEGORY.IT_SOFTWARE]: "IT & Software",
  [JOB_CATEGORY.BUSINESS]: "Business & Strategy",
  [JOB_CATEGORY.MARKETING]: "Marketing & Communication",
  [JOB_CATEGORY.DESIGN]: "UI/UX & Creative Design",
  [JOB_CATEGORY.FINANCE_ACCOUNTING]: "Finance & Accounting",
  [JOB_CATEGORY.HUMAN_RESOURCES]: "Human Resources",
  [JOB_CATEGORY.SALES]: "Sales & Business Development",
  [JOB_CATEGORY.CUSTOMER_SERVICE]: "Customer Service & Support",
  [JOB_CATEGORY.ENGINEERING]: "Engineering & Architecture",
  [JOB_CATEGORY.EDUCATION]: "Education & Training",
  [JOB_CATEGORY.LOGISTICS]: "Logistics & Supply Chain",
  [JOB_CATEGORY.OTHER]: "Other Professions"
};

export const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

