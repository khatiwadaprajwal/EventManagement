import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { bookingAPI } from "@/api/bookings";
import { eventAPI } from "@/api/events";
import { getErrorMessage } from "./apiHelpers"; 

export const useEventDetails = (id) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => eventAPI.getById(id),
    enabled: !!id, 
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingAPI.createBooking,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["event"]); 
    },
    onError: (error) => {

      toast.error(getErrorMessage(error));
    },
  });
};

export const useBookingDetails = (bookingId) => {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingAPI.getById(bookingId),
    enabled: !!bookingId, 
  });
};