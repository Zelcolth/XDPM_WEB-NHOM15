import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD
    ? 'https://xdpm-web-nhom15.onrender.com/api'
    : 'http://localhost:8000/api';

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export function setAuthToken(token) {
    if (token) {
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosClient.defaults.headers.common['Authorization'];
    }
}

export default axiosClient;