import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetSizes = createAsyncThunk(
  "sizes/handleGetSizes",
  async () => {
    const response = await GuestRequest.get("product-sizes");
    return { data: response.data };
  }
);

export const handleCreateSize = createAsyncThunk(
  "sizes/handleCreateSize",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.post("product-sizes", data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteSize = createAsyncThunk(
  "sizes/handleDeleteSize",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.delete("product-sizes", {
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

export const handleUpdateSize = createAsyncThunk(
  "sizes/handleUpdateSize",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.patch(`product-sizes/${id}`, data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetSizeWhereProductID = createAsyncThunk(
  "sizes/handleGetSizeWhereProductID",
  async ({ id, ...query }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get(`product-sizes/products/${id}`, {
        params: query,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
const initialState = {
  sizes: [],
  sizesWhere: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const sizesSlice = createSlice({
  name: "sizes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetSizes.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetSizes.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetSizes.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.sizes = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleCreateSize.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateSize.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateSize.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateSize.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleUpdateSize.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateSize.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteSize.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteSize.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteSize.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });

    //#################################################################
    builder.addCase(handleGetSizeWhereProductID.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetSizeWhereProductID.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetSizeWhereProductID.fulfilled, (state, action) => {
      state.isLoading = false;
      state.sizesWhere = action.payload ?? [];
    });
  },
});

export const sizesSelector = (store) => store.sizes;
export const sizesReducer = sizesSlice.reducer;

export default sizesSlice;
