import axios from 'axios';

const api = axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('liser_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
            localStorage.removeItem('liser_token');
            window.location.href = '/auth';
        }
        return Promise.reject(err);
    }
);

export default api;