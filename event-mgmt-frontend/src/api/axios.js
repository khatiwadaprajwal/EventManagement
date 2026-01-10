import axios from "axios";

// Defined in Master Context
const BACKEND_URL = "http://localhost:8000/v1" || process.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: BACKEND_URL, 
  withCredentials: true, // Critical for HttpOnly Cookies (Refresh Token)
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes("auth/login") && 
      !originalRequest.url.includes("auth/refresh") 
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.get("auth/refresh", {
           headers: { Authorization: "" } 
        });

        // 🛠️ FIX IS HERE: Use 'token', not 'accessToken'
        // Backend returns: { success: true, token: "..." }
        const { token } = response.data; 

        if (!token) throw new Error("No token returned from refresh");

        localStorage.setItem("accessToken", token);
        
        apiClient.defaults.headers.common["Authorization"] = "Bearer " + token;
        originalRequest.headers["Authorization"] = "Bearer " + token;

        processQueue(null, token);
        return apiClient(originalRequest);

      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;