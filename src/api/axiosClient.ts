import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

const RENDER_BASE_URL = "https://workout-app-backend-1hjq.onrender.com/api/v1";

// Tự động lấy IP LAN của Laptop khi chạy qua Expo Go; fallback về localhost / 10.0.2.2
function getLocalBaseUrl(): string {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const lanIp = debuggerHost.split(":")[0];
    return `http://${lanIp}:5000/api/v1`;
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api/v1";
  }
  return "http://localhost:5000/api/v1";
}

const LOCAL_BASE_URL = getLocalBaseUrl();

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// eslint-disable-next-line import/no-named-as-default-member
const axiosClient = axios.create({
  baseURL: RENDER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Bắt lỗi toàn cục & tự động fallback sang server Localhost:5000 nếu Render không phản hồi
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    const isNetworkOrServerDown =
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.response.status >= 500;

    if (
      originalRequest &&
      !originalRequest._retry &&
      isNetworkOrServerDown &&
      originalRequest.baseURL !== LOCAL_BASE_URL
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = LOCAL_BASE_URL;
      axiosClient.defaults.baseURL = LOCAL_BASE_URL;

      console.warn(
        `Render không phản hồi, đã chuyển sang Localhost: ${LOCAL_BASE_URL}`,
      );
      return axiosClient(originalRequest);
    }

    if (error.response?.status !== 404) {
      console.error("API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
