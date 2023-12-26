import axios from "axios";

const instance = axios.create({
  baseURL: "http://43.206.194.232/api",
  timeout: 5 * 1000,
});

instance.interceptors.request.use(
  (config) => {
    const access_token = localStorage.getItem("accessToken", null);
    if (access_token) {
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
