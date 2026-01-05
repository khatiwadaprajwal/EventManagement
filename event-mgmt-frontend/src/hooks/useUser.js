import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// 1. Get Profile
export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: userAPI.getProfile,
  });
};

// 2. Update Profile (Syncs AuthContext)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (response) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries(["profile"]);
      
      // Sync Context
      const updatedUser = response?.data?.user;
      if (updatedUser) {
        updateUser(updatedUser); 
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });
};

// 3. Change Password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: userAPI.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to change password");
    },
  });
};

// 4. Setup Security Questions
export const useSetupSecurityQuestions = () => {
  return useMutation({
    mutationFn: userAPI.setupSecurityQuestions,
    onSuccess: () => {
      toast.success("Security questions saved!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save security questions");
    },
  });
};