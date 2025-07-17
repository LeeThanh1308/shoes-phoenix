import Cookies from "js-cookie";
import axios from "axios";
import { redirect } from "next/navigation";

const AuthRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DOMAIN_API,
});
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

AuthRequest.interceptors.request.use(
  async function (config) {
    // Do something before request is sent
    const Token = await Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY);
    config.headers.Authorization = "Bearer " + Token;
    return config;
  },
  function (error) {
    // Do something with request error

    return Promise.reject(error);
  }
);

AuthRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu token hết hạn và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(AuthRequest(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const accessToken = await axios
          .post(`${process.env.NEXT_PUBLIC_DOMAIN_API}accounts/refresh`, null, {
            withCredentials: true,
          })
          .then((response) =>
            response?.status === 200 ? response?.data : null
          )
          .then((data) => {
            if (data?.accessToken) {
              Cookies.set(process.env.NEXT_PUBLIC_TOKEN_KEY, data.accessToken, {
                sameSite: "Strict",
                expires: (1 / 24 / 60 / 60) * data?.exp,
              });
              return data.accessToken;
            }
            throw new Error("No accessToken in refresh response");
          })
          .catch((err) => {
            console.log(err);
            if (err?.status == 403 || err?.response?.status == 403) {
              setTimeout(() => {
                redirect("/logout");
              }, 200);
            }
          });

        AuthRequest.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return AuthRequest(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Log error for debugging but don't expose sensitive info
        console.error("Token refresh failed:", err.message);
        console.log(err);

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403 && !originalRequest._retry) {
      console.warn("Access forbidden - redirecting to logout");
      window.location.replace("/logout");
    }

    return Promise.reject(error);
  }
);

export default AuthRequest;
