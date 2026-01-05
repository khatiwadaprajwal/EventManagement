import apiClient from "./axios";

export const ticketAPI = {
  // GET /tickets/verify/:qrCode
  verify: async (qrCode) => {
    // We encode the QR code just in case it contains special URL characters
    const encodedQr = encodeURIComponent(qrCode);
    const response = await apiClient.get(`tickets/verify/${encodedQr}`);
    return response.data;
  }
};