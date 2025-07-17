import GuestRequest from "@/services/axios/GuestRequest";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetBootstrapBrands = createAsyncThunk(
  "bootstrap/handleGetBrands",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get("product-brands");
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetBootstrapCategories = createAsyncThunk(
  "bootstrap/handleGetCategories",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get("categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetBootstrapTargetGroups = createAsyncThunk(
  "bootstrap/handleGetBootstrapTargetGroups",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get("target-groups");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetTrendingProducts = createAsyncThunk(
  "bootstrap/handleGetTrendingProducts",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get("products/trendings");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetProductBrands = createAsyncThunk(
  "bootstrap/handleGetProductBrands",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get("products/brands");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

const initialState = {
  brands: [],
  categories: [],
  targetGroups: [],
  trendings: {
    products: [],
    totalPage: 0,
  },
  productBrands: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const bootstrapSlice = createSlice({
  name: "bootstrap",
  initialState,
  reducers: {
    handleChangeLoadingApp(state, action) {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetBootstrapBrands.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetBootstrapBrands.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetBootstrapBrands.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.brands = Array.isArray(action.payload) ? action.payload : [];
    });
    //#################################################################
    builder.addCase(handleGetBootstrapCategories.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetBootstrapCategories.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetBootstrapCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.categories = Array.isArray(action.payload.data)
        ? action.payload.data
        : [];
    });
    //#################################################################
    builder.addCase(handleGetBootstrapTargetGroups.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(
      handleGetBootstrapTargetGroups.rejected,
      (state, action) => {
        state.isLoading = false;
      }
    );
    builder.addCase(
      handleGetBootstrapTargetGroups.fulfilled,
      (state, action) => {
        state.isLoading = false;
        state.onRefresh = false;
        state.targetGroups = Array.isArray(action.payload)
          ? action.payload
          : [];
      }
    );
    //#################################################################
    builder.addCase(handleGetTrendingProducts.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetTrendingProducts.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetTrendingProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.trendings = {
        products: Array.isArray(action.payload?.products)
          ? action.payload?.products
          : [],
        totalPage: action.payload?.totalPage,
      };
    });
    //#################################################################
    builder.addCase(handleGetProductBrands.pending, (state, action) => {
      // state.isLoading = true;
    });
    builder.addCase(handleGetProductBrands.rejected, (state, action) => {
      // state.isLoading = false;
    });
    builder.addCase(handleGetProductBrands.fulfilled, (state, action) => {
      // state.isLoading = false;
      state.productBrands = action.payload;
    });
    //#################################################################
  },
});

export const { handleChangeLoadingApp } = bootstrapSlice.actions;
export const bootstrapSelector = (store) => store.bootstrap;
export const bootstrapReducer = bootstrapSlice.reducer;

export default bootstrapSlice;
