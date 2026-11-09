# TalentPulse — Candidate Management & Recruitment Platform

TalentPulse is a recruitment platform connecting Job Candidates and Recruiters with role-based dashboards, verified job postings, application pipeline tracking, and secure CV document previewing.

---

## 1. System Architecture

The application is structured as a decoupled full-stack architecture:

- **Backend**: Node.js & Express (ES Modules), MongoDB & Mongoose, JWT HTTP-only cookie authentication, Multer & Cloudinary authenticated storage.
- **Frontend**: React (Vite), React Router DOM, Tailwind CSS, Lucide Icons, Axios, React Hot Toast.

```
candidate-management/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment & database configuration
│   │   ├── constants/      # Enums (Role, Job, Application, etc.) & Messages
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Authentication, role authorization, upload, errors
│   │   ├── models/         # Mongoose models (User, Job, Application, Interview, EmailLog)
│   │   ├── routes/         # Express API routes
│   │   ├── schedulers/     # Cron scheduler (auto-closing expired jobs)
│   │   ├── services/       # Business logic layer
│   │   ├── utils/          # JWT, bcrypt, AppError, helpers
│   │   └── validators/     # express-validator schemas
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/styles/  # Tailwind CSS base & utilities
    │   ├── components/
    │   │   └── common/     # Reusable UI (Button, Input, Select, Modal, StatusBadge, etc.)
    │   ├── contexts/       # AuthContext for session management
    │   ├── hooks/          # useAuth, usePagination
    │   ├── layouts/        # CandidateLayout, RecruiterLayout, AdminLayout, AuthLayout
    │   ├── pages/
    │   │   ├── auth/       # Login, RegisterCandidate, RegisterRecruiter
    │   │   ├── candidate/  # Dashboard, BrowseJobs, JobDetails, MyApplications, Profile, ChangePassword
    │   │   ├── recruiter/  # Dashboard, ManageJobs, JobForm, JobApplications
    │   │   └── admin/      # Admin console (MVP unsupported status)
    │   ├── routes/         # ProtectedRoute, AppRoutes
    │   ├── services/       # Centralized API layer (api, authService, jobService, applicationService, userService)
    │   └── utils/          # Constants, validation helpers
    ├── .env
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 2. Environment Variables

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=8080
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/candidate_management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d

# Optional / Service Integrations
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8080/api
```

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB server running locally or via MongoDB Atlas

### 3.1. Start Backend
```bash
cd backend
npm install
npm run dev
# Server will run on http://localhost:8080
```

### 3.2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend will be live on http://localhost:5173
```

### 3.3. Build Frontend for Production
```bash
cd frontend
npm run build
```
Production assets are output to `frontend/dist/`.

---

## 4. Features Implemented

### Candidate
- **Authentication**: Register with Vietnamese mobile validation, secure login, persistent HTTP-only cookie session.
- **Browse Jobs**: Search by title, keyword, or location; filter by category; responsive cards with compensation & deadline.
- **Job Details**: View verified responsibilities, requirements, position counts, and working location type.
- **Apply for Position**: Multipart form submission with name, email, phone, and CV upload (PDF/DOC/DOCX up to 5MB).
- **Candidate Workspace**: Dashboard summarizing total applied, screening status, interviews, offers, and recent submissions.
- **My Applications**: Filter submissions by status, inspect timestamps, view attached CV filenames, and view detailed records.
- **Profile**: View and edit personal contact information (`fullName`, `email`, `phone`, `address`).
- **Security**: Change account password with current password verification.

### Recruiter
- **Registration**: Company details, business registration number, and corporate certificate URL; pending status tracking.
- **Recruiter Dashboard**: Job statistics (active openings, drafts, closed), status alerts, and quick actions.
- **Job Management**: Create vacancies, edit draft jobs, publish drafts to candidate board, close active vacancies, and delete jobs.
- **Applications Received**: Filter candidates by recruitment stage, view contact details, update status along allowed transition stages.
- **CV Viewer**: Secure inline preview for PDF CVs via signed 5-minute Cloudinary URLs, and direct download for Word documents without exposing credentials.

### Admin
- Dedicated Admin Layout and status reporting acknowledging that backend administrative management endpoints are deferred to subsequent releases.
