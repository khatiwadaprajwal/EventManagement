import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
   
      
      localStorage.setItem("accessToken", token);
      
      
      
      toast.success("Google Login Successful!");
      
      
      
      window.location.href = "/"; 
    } else {
      toast.error("Google Login failed. No token received.");
      navigate("/login");
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="h2 animate-pulse">Authenticating...</h2>
        <p className="p1">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthSuccess;