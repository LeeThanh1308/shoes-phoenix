import AuthRequest from "@/services/axios/AuthRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");
export const handleGetAdminOrders = createAsyncThunk(
  "orders/handleGetAdminOrders",
  async (data = {}) => {
    const response = await AuthRequest.get("payment/admin/orders", {
      params: data,
    });
    return response.data;
  }
);

export const handleUpdatedAdminOrders = createAsyncThunk(
  "orders/handleUpdatedAdminOrders",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.patch(`payment/admin/orders`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
const initialState = {
  orders: [],
  ordersWhere: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    handlePushOrders(state, action) {
      state.orders.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetAdminOrders.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetAdminOrders.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetAdminOrders.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.orders = action.payload;
    });
    //#################################################################
    builder.addCase(handleUpdatedAdminOrders.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleUpdatedAdminOrders.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      Toastify(0, "Cập nhật thất bại.");
      state.isLoading = false;
    });
    builder.addCase(handleUpdatedAdminOrders.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const { handlePushOrders } = ordersSlice.actions;
export const ordersSelector = (store) => store.orders;
export const ordersReducer = ordersSlice.reducer;

export default ordersSlice;
