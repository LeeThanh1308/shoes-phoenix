import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const handleForgotPassword = createAsyncThunk(
  "auth/handleForgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.post("accounts/forget", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
