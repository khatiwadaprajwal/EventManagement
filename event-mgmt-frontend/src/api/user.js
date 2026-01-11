import apiClient from "./axios";

export const userAPI = {
  
  getProfile: async () => {
    const response = await apiClient.get("users/me");
    return response.data;
  },

  // PATCH /v1/users/me (Multipart for Avatar)
  updateProfile: async (formData) => {
    const response = await apiClient.patch("users/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // POST /v1/users/change-password
  changePassword: async (data) => {
    const response = await apiClient.post("users/change-password", data);
    return response.data;
  },

  // POST /v1/password/setup (Security Questions)
  setupSecurityQuestions: async (data) => {
    const response = await apiClient.post("password/setup", data);
    return response.data;
  }
};