import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api', // Đường dẫn tới Backend Laravel của bạn
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