import apiClient from "./axios";

export const authAPI = {
  login: async (credentials) => {
    // FIX: Remove leading slash. "auth/login" appends to baseURL.
    // "/auth/login" might reset to root (5173).
    const response = await apiClient.post("auth/login", credentials);
    return response.data; 
  },
  
  register: async (data) => {
    // FIX: Remove leading slash
    const response = await apiClient.post("auth/register", data);
    return response.data;
  },

  getGoogleLoginUrl: () => {
    return "http://localhost:8000/v1/auth/google";
  },

  getSecurityQuestions: async (email) => {
 
    const response = await apiClient.post("password/forgot", { email });
    return response.data; 
  },
  resetPassword: async (payload) => {

    const response = await apiClient.post("password/reset", payload);
    return response.data;
  }

};