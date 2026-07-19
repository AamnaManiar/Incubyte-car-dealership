import axios from 'axios';

// 📚 INTERVIEW EXPLANATION:
// We create a central axios instance instead of calling fetch() or axios.get() directly.
// This allows us to:
// 1. Set a base URL (so we don't type http://localhost:5000 every time)
// 2. Add an Interceptor: automatically attach the JWT token to every request

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor: Runs before every request is sent
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Runs after a response is received (useful for global error handling)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns a 401 Unauthorized, it means the token is expired/invalid
    if (error.response && error.response.status === 401) {
      // Clear token and force logout (could redirect to login page here)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // In a real app, you might want to use a global event or history to redirect
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosClient;