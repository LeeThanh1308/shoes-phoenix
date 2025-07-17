import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const handleCreatePayment = createAsyncThunk(
  "auth/handleCreatePayment",
  async ({ data, callback = () => {} }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("payment", data, {
        withCredentials: true,
      });
      callback(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleUpdateStatusPayment = createAsyncThunk(
  "auth/handleUpdateStatusPayment",
  async ({ orderCode, callback = () => {} }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post(`payment/orders/${orderCode}`);
      callback(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetDetailOrder = createAsyncThunk(
  "auth/handleGetDetailOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.get(`payment/orders/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleCreateOrderByCashier = createAsyncThunk(
  "auth/handleCreateOrderByCashier",
  async ({ data, callback = () => {} }, { rejectWithValue }) => {
    try {
      const res = await AuthRequest.post("payment/cashier", data);
      callback(res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleCheckOutOrderPayment = createAsyncThunk(
  "auth/handleCheckoutOrderPayment",
  async ({ orderCode, callback = () => {} }, { rejectWithValue }) => {
    try {
      const res = await AuthRequest.get(`payment/orders/${orderCode}/checkout`);
      callback(res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
