// socket.js

import Cookies from "js-cookie";
import axios from "axios";
import { io } from "socket.io-client";

let socket = null;

export const initSocket = async () => {
  let token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_KEY);

  if (!token) {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_DOMAIN_API}accounts/refresh`,
        null,
        { withCredentials: true }
      );

      if (response.status === 200 && response.data?.accessToken) {
        const { accessToken, exp } = response.data;
        Cookies.set(process.env.NEXT_PUBLIC_TOKEN_KEY, accessToken, {
          sameSite: "Strict",
          expires: (1 / 24 / 60 / 60) * exp,
        });
        token = accessToken;
      }
    } catch (e) {
      if (e?.response?.status === 403) {
        Toastify(0, "Phiên đăng nhập đã hết hạn vui lòng đăng nhập lại.");
        store.dispatch(handleLogoutState());
        store.dispatch(handleClearCart());

        console.error("Phiên hết hạn, cần đăng nhập lại.");
      }
      return null;
    }
  }

  socket = io(process.env.NEXT_PUBLIC_DOMAIN_API, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });

  return socket;
};
