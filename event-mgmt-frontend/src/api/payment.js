import apiClient from "./axios";

export const paymentAPI = {
  // POST /v1/payments/initiate
  // Body: { bookingId: 1, gateway: "KHALTI" }
  initiatePayment: async (data) => {
    const response = await apiClient.post("payments/initiate", data);
    return response.data; // Expects: { data: { url: "https://khalti.com/..." } }
  },

  verifyTicket: async (qrCode) => {
    const response = await apiClient.get(`tickets/verify/${qrCode}`);
    return response.data;
  }
};