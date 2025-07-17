import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetCarts = createAsyncThunk(
  "carts/handleGetCarts",
  async () => {
    const response = await AuthRequest.get("carts/me");
    return { data: response.data };
  }
);

export const handleCreateCart = createAsyncThunk(
  "carts/handleCreateCart",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("carts", data);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetCashiersCarts = createAsyncThunk(
  "carts/handleGetCashiersCarts",
  async () => {
    const response = await AuthRequest.get("carts/cashiers");
    return { data: response.data };
  }
);

export const handleCreateCashiersCarts = createAsyncThunk(
  "carts/handleCreateCashiersCarts",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("carts/cashiers", data);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteCart = createAsyncThunk(
  "carts/handleDeleteCart",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.delete("carts", {
        data,
      });
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleUpdateCart = createAsyncThunk(
  "carts/handleUpdateCart",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.patch(`carts/${id}`, data);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

const initialState = {
  carts: [],
  cashiersCarts: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const cartsSlice = createSlice({
  name: "carts",
  initialState,
  reducers: {
    handleClearCart(state) {
      state.carts = [];
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetCarts.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetCarts.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetCarts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.carts = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetCashiersCarts.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetCashiersCarts.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetCashiersCarts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.cashiersCarts = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleCreateCart.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateCart.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateCart.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleCreateCashiersCarts.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateCashiersCarts.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      Toastify(0, action.payload?.message);
      state.isLoading = false;
    });
    builder.addCase(handleCreateCashiersCarts.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateCart.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleUpdateCart.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateCart.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteCart.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteCart.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteCart.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const { handleClearCart } = cartsSlice.actions;
export const cartsSelector = (store) => store.carts;
export const cartsReducer = cartsSlice.reducer;

export default cartsSlice;
