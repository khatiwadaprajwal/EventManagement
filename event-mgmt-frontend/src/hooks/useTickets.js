import { useMutation } from "@tanstack/react-query";
import { ticketAPI } from "@/api/tickets";
import { toast } from "sonner";

export const useVerifyTicket = () => {
  return useMutation({
    mutationFn: ticketAPI.verify,
    onSuccess: (data) => {
      // You can handle side effects here if needed
      toast.success("Ticket verified successfully!");
    },
    onError: (error) => {
      // Error is handled in the UI for specific display, but we can toast generic failures
      if (error.response?.status >= 500) {
        toast.error("Server error during verification");
      }
    }
  });
};