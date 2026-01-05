import apiClient from "./axios";

export const bookingAPI = {
 
  createBooking: async (data) => {
    const response = await apiClient.post("bookings", data);
    return response.data;
  },

  
  getMyBookings: async () => {
    const response = await apiClient.get("bookings");
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`bookings/${id}`);
    return response.data;
  },
};