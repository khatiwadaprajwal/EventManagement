import { createContext, useContext, useState, useEffect } from "react";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } 
    }
    setIsLoading(false);
  }, []);

  const setAuth = (newToken, newUser) => {
    localStorage.setItem("accessToken", newToken);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    }
    setToken(newToken);
  };

  const fetchUser = async () => {
    try {
      const storedToken = localStorage.getItem("accessToken");
      if (!storedToken) return;


      const response = await fetch("https://eventmanagement-7axu.onrender.com/v1/auth/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user");

      const userData = await response.json();
      
      // Update state and storage
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      
    }
  };


  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      setAuth, 
      fetchUser, 
      updateUser, 
      logout, 
      isLoading, 
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);