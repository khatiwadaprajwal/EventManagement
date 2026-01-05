import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { eventAPI } from "@/api/events";
import { toast } from "sonner";

// 1. Fetch all events
export const useEvents = (filters = {}) => {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => eventAPI.getAll(filters),
    staleTime: 1000 * 60 * 5, 
    keepPreviousData: true,
  });
};

// 2. Fetch Single Event Details (Used in Edit Page)
export const useEventDetails = (id) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => eventAPI.getById(id), // ✅ Matches API
    enabled: !!id, 
  });
};

// 3. Create event
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
    },
  });
};

// 4. Update event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: eventAPI.update, // ✅ Matches API name
    onSuccess: (_, variables) => {
      const { id } = variables.formData; // Note: variables is { id, formData }
      toast.success("Event updated successfully!");

      // Refetch list and specific event to ensure fresh data
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["event", id]);

      navigate("/admin/events"); // Redirect to list
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to update event";
      toast.error(msg);
    },
  });
};

// 5. Delete event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventAPI.delete,
    onSuccess: () => {
      toast.success("Event deleted successfully");
      queryClient.invalidateQueries(["events"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete event");
    },
  });
};