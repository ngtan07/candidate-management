import api from "./api";

export const authService = {
  login: async (credentials) => {
    return await api.post("/auth/login", credentials);
  },

  registerCandidate: async (candidateData) => {
    return await api.post("/auth/register/candidate", candidateData);
  },

  registerRecruiter: async (recruiterData) => {
    return await api.post("/auth/register/recruiter", recruiterData);
  },

  logout: async () => {
    return await api.post("/auth/logout");
  },

  getCurrentUser: async () => {
    return await api.get("/my-profile");
  },
  requestPasswordReset: async (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: async (token, password) => api.post("/auth/reset-password", { token, password })
};

export default authService;

