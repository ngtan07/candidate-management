import api from "./api";

export const jobService = {
  // Public & Candidate
  getPublicJobs: async (params = {}) => {
    return await api.get("/jobs", { params });
  },

  getPublicJobById: async (jobId) => {
    return await api.get(`/jobs/${jobId}`);
  },

  // Recruiter
  getMyJobs: async (params = {}) => {
    return await api.get("/jobs/my-jobs", { params });
  },

  getMyJobById: async (id) => {
    return await api.get(`/jobs/my-jobs/${id}`);
  },

  createJob: async (jobData) => {
    return await api.post("/jobs", jobData);
  },

  updateJob: async (id, jobData) => {
    return await api.patch(`/jobs/${id}`, jobData);
  },

  publishJob: async (id) => {
    return await api.patch(`/jobs/${id}/publish`);
  },

  closeJob: async (id) => {
    return await api.patch(`/jobs/${id}/close`);
  },

  deleteJob: async (id) => {
    return await api.delete(`/jobs/${id}`);
  }
};

export default jobService;

