import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { bookingAPI } from "@/api/bookings";
import { eventAPI } from "@/api/events";


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
      // Backend returns: { success: true, data: { booking: {...}, seats: [...] } }
      toast.success("Booking successful! Redirecting to payment...");
      // Invalidate queries to refresh seat status if we come back
      queryClient.invalidateQueries(["event"]); 
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Booking failed. Seats might be taken.");
    },
  });
};

export const useBookingDetails = (bookingId) => {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingAPI.getById(bookingId),
    enabled: !!bookingId, // Only fetch if ID exists
  });
};