import axios from "axios";
import { isRejectedWithValue } from "@reduxjs/toolkit";

const GuestRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DOMAIN_API,
});

GuestRequest.interceptors.response.use(
  function (response) {
    // Do something with response data
    return response;
  },
  function (error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

export default GuestRequest;
