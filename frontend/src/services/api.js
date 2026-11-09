import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // Send and receive HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Extract server message or fallback
    let message = "An unexpected error occurred. Please try again.";
    let validationErrors = null;

    if (error.response) {
      const data = error.response.data;
      if (data) {
        if (data.message) {
          message = data.message;
        }
        if (data.errors && Array.isArray(data.errors)) {
          validationErrors = data.errors;
        }
      }
    } else if (error.request) {
      message = "Unable to connect to the server. Please check your network or server status.";
    }

    const enhancedError = new Error(message);
    enhancedError.status = error.response ? error.response.status : null;
    enhancedError.validationErrors = validationErrors;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api;

