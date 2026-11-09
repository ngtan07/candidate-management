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
  getApplicationCv: async (applicationId) => {
    return await api.get(`/applications/${applicationId}/cv`);
  }
};

export default applicationService;

