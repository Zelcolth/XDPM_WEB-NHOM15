import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api', // Đường dẫn tới Backend Laravel của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosClient;