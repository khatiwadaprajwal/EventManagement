import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 
import { eventAPI } from "@/api/events";
import { toast } from "sonner"
export const useEvents = (filters = {}) => {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => eventAPI.getAll(filters),
    staleTime: 1000 * 60 * 5, 
    keepPreviousData: true,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventAPI.create,
    onSuccess: () => {
      toast.success("Event created successfully!");
      queryClient.invalidateQueries(["events"]);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to create event";
      toast.error(msg);
    }
  });
};