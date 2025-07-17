import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetColors = createAsyncThunk(
  "colors/handleGetColors",
  async () => {
    const response = await GuestRequest.get("product-colors");
    return { data: response.data };
  }
);

export const handleCreateColor = createAsyncThunk(
  "colors/handleCreateColor",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.post("product-colors", data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteColor = createAsyncThunk(
  "colors/handleDeleteColor",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.delete("product-colors", {
        data: {
          ids: ids,
          id: id,
        },
      });
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleUpdateColor = createAsyncThunk(
  "colors/handleUpdateColor",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.patch(`product-colors/${id}`, data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

const initialState = {
  colors: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const colorsSlice = createSlice({
  name: "colors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetColors.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetColors.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetColors.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.colors = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleCreateColor.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateColor.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateColor.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateColor.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleUpdateColor.rejected, (state, action) => {
      console.log("faler");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateColor.fulfilled, (state, action) => {
      console.log("success");
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteColor.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteColor.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteColor.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const colorsSelector = (store) => store.colors;
export const colorsReducer = colorsSlice.reducer;

export default colorsSlice;
