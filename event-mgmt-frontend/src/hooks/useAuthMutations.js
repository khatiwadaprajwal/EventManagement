import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authAPI } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      // Backend: { success: true, token: "...", data: { user: ... } }
      if (data.success) {
        setAuth(data.token, data.data.user);
        toast.success("Welcome back!");
        navigate("/"); // Redirect to Home/Dashboard
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });
};

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      if (data.success || data.token) {
        setAuth(data.token, data.data.user); // Auto-login after register
        toast.success("Account created successfully!");
        navigate("/");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });
};