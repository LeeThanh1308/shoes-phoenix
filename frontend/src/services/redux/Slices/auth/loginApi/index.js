import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const handleLogin = createAsyncThunk(
  "auth/handleLogin",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.post("accounts/login", data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleLogout = createAsyncThunk(
  "auth/handleLogout",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.get("accounts/logout", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
