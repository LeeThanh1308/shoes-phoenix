import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");
export const handleGetProducts = createAsyncThunk(
  "products/handleGetProducts",
  async () => {
    const response = await GuestRequest.get("products");
    return { data: response.data };
  }
);

export const handleGetProduct = createAsyncThunk(
  "products/handleGetProduct",
  async (data = {}) => {
    const response = await GuestRequest.get("products", {
      params: data,
    });
    return response.data;
  }
);

export const handleCreateProduct = createAsyncThunk(
  "products/handleCreateProduct",
  async (data, { rejectWithValue }) => {
    try {
      const { colors, sizes, ...rest } = data;
      const formData = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      formData.append("sizes", JSON.stringify(sizes));
      formData.append(
        "colors",
        JSON.stringify(
          colors.map((_) => ({ id: _.id, lengImage: _.files.length }))
        )
      );
      await Promise.all(
        colors.map(async (_) => {
          return await Promise.all(
            _?.files.map((file) => {
              formData.append("files", file);
            })
          );
        })
      );
      const response = await GuestRequest.post("products", formData);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteProduct = createAsyncThunk(
  "products/handleDeleteProduct",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.delete("products", {
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

export const handleUpdateProduct = createAsyncThunk(
  "products/handleUpdateProduct",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const { colors, sizes, removes, ...rest } = data;
      const formData = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      formData.append("sizes", JSON.stringify(sizes));
      formData.append(
        "colors",
        JSON.stringify(
          colors.map((_) => ({ id: _.id, lengImage: _.files.length }))
        )
      );
      formData.append("removes", JSON.stringify(removes ?? {}));
      await Promise.all(
        colors.map(async (_) => {
          return await Promise.all(
            _?.files.map((file) => {
              formData.append("files", file);
            })
          );
        })
      );
      const response = await GuestRequest.patch(`products/${id}`, formData);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleFindProductByCashiers = createAsyncThunk(
  "products/handleFindProductByCashiers",
  async (search, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.get("products/cashiers", {
        params: {
          search,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
const initialState = {
  product: {},
  products: [],
  search: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    handleChangeLoading(state, action) {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetProducts.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetProducts.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.products = Array.isArray(action.payload?.data)
        ? action.payload?.data
        : [];
    });
    //#################################################################
    builder.addCase(handleGetProduct.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetProduct.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.product = action.payload ?? {};
    });
    //#################################################################
    builder.addCase(handleFindProductByCashiers.pending, (state, action) => {
      state.isLoading = true;
      state.search = [];
    });
    builder.addCase(handleFindProductByCashiers.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleFindProductByCashiers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.search = Array.isArray(action.payload) ? action.payload : [];
    });
    //#################################################################
    builder.addCase(handleCreateProduct.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateProduct.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateProduct.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateProduct.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleUpdateProduct.rejected, (state, action) => {
      console.log("faler");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateProduct.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteProduct.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteProduct.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteProduct.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const productsSelector = (store) => store.products;
export const productsReducer = productsSlice.reducer;
export const { handleChangeLoading } = productsSlice.actions;
export default productsSlice;
