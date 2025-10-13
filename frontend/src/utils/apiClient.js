import axios from 'axios';

/**
 * Creates a pre-configured instance of axios.
 *
 * The baseURL is determined by the REACT_APP_API_URL environment variable.
 * For local development, this will be 'http://localhost:5000/api'.
 * For production, this will be your Vercel URL, e.g., 'https://service-sphere.vercel.app/api'.
 */
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Optional: Interceptor to add the auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;