import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getErrorMessage } from "./apiHelpers";

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
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// 3. Change Password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: userAPI.changePassword,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// 4. Setup Security Questions
export const useSetupSecurityQuestions = () => {
  return useMutation({
    mutationFn: userAPI.setupSecurityQuestions,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};