import api from "./api";

export const applicationService = {
  // Candidate apply for a job (multipart/form-data)
  applyForJob: async (jobId, formData) => {
    return await api.post(`/applications/${jobId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Candidate view own applications
  getMyApplications: async (params = {}) => {
    return await api.get("/applications/my-applications", { params });
  },

  // Candidate & Recruiter view details
  getApplicationById: async (applicationId) => {
    return await api.get(`/applications/${applicationId}`);
  },

  // Recruiter view applications for a specific job
  getApplicationsByJob: async (jobId, params = {}) => {
    return await api.get(`/applications/job/${jobId}`, { params });
  },

  // Recruiter update status
  updateApplicationStatus: async (applicationId, status) => {
    return await api.patch(`/applications/${applicationId}/status`, { status });
  },

  // Recruiter view / download CV
  getApplicationCv: async (applicationId, disposition = "inline") => {
    return await api.get(`/applications/${applicationId}/cv`, { params: { disposition }, responseType: "blob" });
  },
  downloadCv: async (applicationId, fileName) => {
    const blob = await applicationService.getApplicationCv(applicationId, "attachment");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = fileName || "candidate-cv"; document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  previewCv: async (applicationId) => {
    const blob = await applicationService.getApplicationCv(applicationId, "inline");
    return URL.createObjectURL(blob);
  }
};

export default applicationService;

