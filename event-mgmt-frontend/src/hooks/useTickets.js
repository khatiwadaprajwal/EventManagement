import { useMutation } from "@tanstack/react-query";
import { ticketAPI } from "@/api/tickets";
import { toast } from "sonner";
import { getErrorMessage } from "./apiHelpers";
export const useVerifyTicket = () => {
  return useMutation({
    mutationFn: ticketAPI.verify,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
    
      toast.error(getErrorMessage(error));
    }
  });
};