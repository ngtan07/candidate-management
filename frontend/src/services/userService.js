import api from "./api";

export const userService = {
  getMyProfile: async () => {
    return await api.get("/my-profile");
  },

  updateMyProfile: async (data) => {
    return await api.patch("/my-profile", data);
  },

  changePassword: async (passwords) => {
    return await api.patch("/change-password", passwords);
  }
};

export default userService;

