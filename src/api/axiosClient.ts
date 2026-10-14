import axios from "axios";

// eslint-disable-next-line import/no-named-as-default-member
const axiosClient = axios.create({
  baseURL: "https://workout-app-backend-1hjq.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Bắt lỗi toàn cục để tránh crash app
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default axiosClient;
