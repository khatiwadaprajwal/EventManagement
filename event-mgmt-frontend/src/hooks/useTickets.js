import { useMutation } from "@tanstack/react-query";
import { ticketAPI } from "@/api/tickets";
import { toast } from "sonner";

export const useVerifyTicket = () => {
  return useMutation({
    mutationFn: ticketAPI.verify,
    onSuccess: (data) => {
      toast.success("Ticket verified successfully!");
    },
    onError: (error) => {
    
      console.error("Verification failed", error);
    }
  });
};