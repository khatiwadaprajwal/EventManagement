import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { authAPI } from "@/api/auth"
import { useAuth } from "@/context/AuthContext"
import { getErrorMessage } from "./apiHelpers"; 

export const useLoginMutation = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      // Backend: { success: true, token: "...", data: { user: ... } }
      if (data.success) {
        setAuth(data.token, data.data.user)
        toast.success(data.message)
        navigate("/") 
      }
    },
    onError: (error) => {
      
      toast.error(getErrorMessage(error));
    },
  })
}

export const useRegisterMutation = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      if (data.success || data.token) {
        setAuth(data.token, data.data.user) 
        toast.success(data.message)
        navigate("/")
      }
    },
    onError: (error) => {
      
      toast.error(getErrorMessage(error));
    },
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authAPI.getSecurityQuestions,
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authAPI.resetPassword,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  })
}