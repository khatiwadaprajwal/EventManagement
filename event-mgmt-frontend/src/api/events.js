import apiClient from "./axios";

export const eventAPI = {
  // GET /v1/events?page=1&limit=10
  getAll: async (params = {}) => {
    const response = await apiClient.get("events", { params });
    return response.data;
  },

  // GET /v1/events/:id
  getById: async (id) => {
    const response = await apiClient.get(`events/${id}`);
    return response.data;
  },

  // POST /v1/events (Admin Only)
  create: async (formData) => {
    // Axios automatically sets Content-Type to multipart/form-data when body is FormData
    const response = await apiClient.post("events", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
};