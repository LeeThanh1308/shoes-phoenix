import AuthRequest from "@/services/axios/AuthRequest";

const { createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetInfoMyUser = createAsyncThunk(
  "auth/handleGetInfoMyUser",
  async () => {
    const response = await AuthRequest.get("accounts/info");
    return response.data;
  }
);

export const handleUpdateInfoMyUser = createAsyncThunk(
  "auth/handleUpdateInfoUser",
  async (data, { rejectWithValue }) => {
    try {
      const { file, birthday, ...rest } = data;
      const formData = new FormData();
      if (file) formData.append("avatar", file);
      formData.append("birthday", new Date(birthday).toISOString());
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const response = await AuthRequest.post("accounts/info", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleChangeMyPass = createAsyncThunk(
  "auth/handleChangeMyPass",
  async (data, { rejectWithValue }) => {
    try {
      const res = await AuthRequest.post("accounts/change-password", {
        pass: data?.prevPassword + "</>+" + data?.newPassword,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
