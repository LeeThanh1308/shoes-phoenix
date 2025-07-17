import GuestRequest from "@/services/axios/GuestRequest";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const handleCreateAccountVerify = createAsyncThunk(
  "auth/handleCreateAccountVerify",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.post("accounts/signup", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetInfoVerifyCodeSign = createAsyncThunk(
  "auth/handleGetInfoVerifyCodeSign",
  async (id, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get(
        "verifications/checkVerify/" + id
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
