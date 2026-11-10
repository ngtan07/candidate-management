import api from "./api";

export const interviewService = {
  list: (params) => api.get("/interviews", { params }),
  detail: (id) => api.get(`/interviews/${id}`),
  getByApplication: (applicationId) => api.get(`/interviews/applications/${applicationId}`),
  evaluateInterview: (applicationId, notes) => api.post(`/interviews/applications/${applicationId}/evaluate`, { notes }),
  notes: (id, notes) => api.patch(`/interviews/${id}/notes`, { notes }),
  schedule: (applicationId, data) => api.post(`/interviews/applications/${applicationId}/schedule`, data),
  bulkSchedule: (applicationIds, interview) => api.post("/interviews/bulk-schedule", { applicationIds, interview }),
  passed: () => api.get("/interviews/passed-candidates"),
};

export default interviewService;
