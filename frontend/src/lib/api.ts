import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Send HTTPOnly cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept responses to handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // If we receive a 401, clear local state or trigger a redirect
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('unauthorized'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
