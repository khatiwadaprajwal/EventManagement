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
    const response = await apiClient.post("events", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // DELETE /v1/events/:id
  delete: async (id) => {
    const response = await apiClient.delete(`events/${id}`);
    return response.data;
  },

  // PATCH /v1/events/:id
  // 🛠️ FIX: Used apiClient instead of axiosClient
  update: async ({ id, formData }) => {
    const response = await apiClient.patch(`events/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};