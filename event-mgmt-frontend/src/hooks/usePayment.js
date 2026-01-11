import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentAPI } from "@/api/payment";
import { getErrorMessage } from "./apiHelpers";
export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: paymentAPI.initiatePayment,
    onSuccess: (response) => {
      // Context says backend returns: { data: { url: "..." } }
      const paymentUrl = response?.data?.url;
      
      if (paymentUrl) {
        toast.success("Redirecting to payment gateway...");
       
        window.location.href = paymentUrl;
      } else {
        toast.error("Payment URL not received from server.");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};