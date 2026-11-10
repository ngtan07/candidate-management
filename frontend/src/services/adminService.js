import api from "./api";

export const adminService = {
  pending: () => api.get("/admin/recruiters/pending"),
  recruiters: (params) => api.get("/admin/recruiters", { params }),
  recruiter: (id) => api.get(`/admin/recruiters/${id}`),
  review: (id, status, reason) => api.patch(`/admin/recruiters/${id}/review`, { status, reason }),
  suspend: (id) => api.patch(`/admin/recruiters/${id}/suspend`),
  reactivate: (id) => api.patch(`/admin/recruiters/${id}/reactivate`),
  jobs: (params) => api.get("/admin/jobs", { params }),
  hideJob: (id) => api.patch(`/admin/jobs/${id}/hide`),
  restoreJob: (id) => api.patch(`/admin/jobs/${id}/restore`),
};

export default adminService;
