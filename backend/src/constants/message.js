export const MESSAGES = Object.freeze({
    // System
    API_RUNNING: "Candidate Management API is running",
    API_ENDPOINT_NOT_FOUND: "API endpoint not found",
    INTERNAL_SERVER_ERROR: "Internal server error",

    // Authentication
    EMAIL_ALREADY_REGISTERED: "Email is already registered",
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_INACTIVE: "Your account is inactive",
    USER_NOT_FOUND: "User not found",
    REGISTRATION_SUCCESS: "Registered successfully",
    LOGIN_SUCCESS: "Login successfully",
    LOGOUT_SUCCESS: "Logout successfully",

    // Recruiter
    RECRUITER_NOT_APPROVED: "Your recruiter account is not approved yet by admin",
    REGISTRATION_PENDING: "Your registration is pending approval",
    REGISTRATION_REJECTED: "Your registration has been rejected",
    CANNOT_UPDATE_REGISTRATION: "You cannot update this registration",

    // Job
    JOB_NOT_FOUND: "Job not found",
    JOB_CLOSED: "This job is closed",
    JOB_NOT_PUBLISHED: "This job is not published",
    CANNOT_UPDATE_JOB: "Only draft jobs can be updated",
    CANNOT_PUBLISH_JOB: "Only draft jobs can be published",
    CANNOT_CLOSE_JOB: "Only opening jobs can be closed",
    JOB_STATUS_REQUIRED: "Job status is required",
    JOB_STATUS_INVALID: "Invalid initial job status",
    APPLICATION_NOT_STARTED: "The application period has not started",
    APPLICATION_DEADLINE_PASSED: "The application deadline has passed",

    // Job response messages
    JOB_CREATED: "Job created successfully",
    JOBS_RETRIEVED: "Jobs retrieved successfully",
    JOB_RETRIEVED: "Job retrieved successfully",
    JOB_UPDATED: "Job updated successfully",
    JOB_PUBLISHED: "Job published successfully",
    JOB_CLOSED: "Job closed successfully",
    JOB_DELETED: "Job deleted successfully",

    // Application
    ALREADY_APPLIED: "You have already applied for this job",
    APPLICATION_NOT_FOUND: "Application not found",
    APPLICATION_SUBMITTED: "Application submitted successfully",

    // Common
    UNAUTHORIZED: "Authentication is required",
    FORBIDDEN: "You do not have permission to perform this action",

    // Validation
    VALIDATION_FAILED: "Validation failed",
    FULL_NAME_REQUIRED: "Full name is required",
    FULL_NAME_LENGTH: "Full name must be between 2 and 100 characters",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Invalid email format",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_LENGTH: "Password must be between 8 and 72 characters",
    PHONE_INVALID: "Invalid Vietnamese phone number",
    COMPANY_NAME_REQUIRED: "Company name is required",
    COMPANY_NAME_LENGTH: "Company name must not exceed 150 characters",
    WEBSITE_INVALID: "Invalid website URL",
    BUSINESS_REGISTRATION_NUMBER_REQUIRED: "Business registration number is required",
    BUSINESS_LICENSE_URL_REQUIRED: "Business license URL is required",
    BUSINESS_LICENSE_URL_INVALID: "Invalid business license URL",

    RECRUITER_REQUIRED: "Recruiter is required",
    JOB_TITLE_REQUIRED: "Job title is required",
    JOB_TITLE_LENGTH: "Job title must not exceed 150 characters",
    JOB_DESCRIPTION_REQUIRED: "Job description is required",
    JOB_CATEGORY_REQUIRED: "Job category is required",
    JOB_CATEGORY_INVALID: "Invalid job category",
    EMPLOYMENT_TYPE_REQUIRED: "Employment type is required",
    EMPLOYMENT_TYPE_INVALID: "Invalid employment type",
    EXPERIENCE_LEVEL_REQUIRED: "Experience level is required",
    EXPERIENCE_LEVEL_INVALID: "Invalid experience level",
    WORK_LOCATION_TYPE_REQUIRED: "Work location type is required",
    WORK_LOCATION_TYPE_INVALID: "Invalid work location type",
    SALARY_MIN_INVALID: "Minimum salary cannot be negative",
    SALARY_MAX_INVALID: "Maximum salary cannot be negative",
    SALARY_CURRENCY_INVALID: "Invalid salary currency",
    SALARY_PERIOD_INVALID: "Invalid salary period",
    SALARY_RANGE_INVALID: "Maximum salary must be greater than or equal to minimum salary",
    NUMBER_OF_POSITIONS_REQUIRED: "Number of positions is required",
    NUMBER_OF_POSITIONS_INVALID: "Number of positions must be at least 1",
    APPLICATION_START_DATE_REQUIRED: "Application start date is required",
    APPLICATION_START_DATE_INVALID: "Invalid application start date format",
    APPLICATION_END_DATE_REQUIRED: "Application end date is required",
    APPLICATION_END_DATE_INVALID: "Invalid application end date format",
    APPLICATION_DATE_INVALID: "Application end date must be after application start date",

    ROLE_REQUIRED: "Role is required",
    CANDIDATE_REQUIRED: "Candidate is required",
    JOB_REQUIRED: "Job is required",
    APPLICANT_NAME_REQUIRED: "Applicant name is required",
    APPLICANT_EMAIL_REQUIRED: "Applicant email is required",
    CV_REQUIRED: "CV is required",
    CV_PUBLIC_REQUIRED: "CV public ID is required",
    CV_FILE_NAME_REQUIRED: "CV file name is required",

    SENDER_REQUIRED: "Sender is required",
    EMAIL_TYPE_REQUIRED: "Email type is required",
    RECIPIENT_EMAIL_REQUIRED: "Recipient email is required",
    EMAIL_SUBJECT_REQUIRED: "Email subject is required",
    EMAIL_BODY_REQUIRED: "Email body is required",

    APPLICATION_REQUIRED: "Email body is required",
    START_TIME_REQUIRED: "Start time is required",
    END_TIME_REQUIRED: "End time is required",
    END_TIME_INVALID: "End time must be after start time",
    INTERVIEW_TYPE_REQUIRED: "Interview type is required",
    MEETING_URL_REQUIRED: "Meeting URL is required for online interviews",
    OFFICE_ADDRESS_REQUIRED: "Office address is required for onsite interviews",

    // CV Upload
    CV_FORMAT_INVALID: "Only PDF, DOC and DOCX files are allowed",
    CV_SIZE_EXCEEDED: "CV file size must not exceed 5MB",
    CV_UPLOAD_INVALID: "Invalid CV upload",
    FILE_UPLOAD_FAILED: "Failed to upload CV file"



});