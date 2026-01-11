import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { eventAPI } from "@/api/events";
import { toast } from "sonner";
import { getErrorMessage } from "./apiHelpers"; 

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
    queryFn: () => eventAPI.getById(id), 
    enabled: !!id, 
  });
};

// 3. Create event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventAPI.create,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["events"]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// 4. Update event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: eventAPI.update, 
    onSuccess: (_, variables) => {
      const { id } = variables.formData; // Note: variables is { id, formData }
      toast.success("Event updated successfully!");

      // Refetch list and specific event to ensure fresh data
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["event", id]);

      navigate("/admin/events"); // Redirect to list
    },
    onError: (error) => {
     toast.error(getErrorMessage(error));
    },
  });
};


export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventAPI.delete,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["events"]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};