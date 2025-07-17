import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetBrands = createAsyncThunk(
  "brands/handleGetBrands",
  async () => {
    const response = await GuestRequest.get("product-brands");
    return { data: response.data };
  }
);

export const handleCreateBrand = createAsyncThunk(
  "brands/handleCreateBrand",
  async ({ name, slug, description, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (slug) formData.append("slug", slug);
      if (description) formData.append("description", description);
      if (file && typeof file !== "string" && file[0] instanceof File)
        formData.append("file", file[0]);
      const response = await GuestRequest.post("product-brands", formData);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteBrand = createAsyncThunk(
  "brands/handleDeleteBrand",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.delete("product-brands", {
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

export const handleUpdateBrand = createAsyncThunk(
  "brands/handleUpdateBrand",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "file") {
          if (value && typeof value !== "string" && value[0] instanceof File)
            formData.append("file", value[0]);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const response = await GuestRequest.patch(
        `product-brands/${id}`,
        formData
      );
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

const initialState = {
  brands: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetBrands.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetBrands.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetBrands.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.brands = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleCreateBrand.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateBrand.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateBrand.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateBrand.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleUpdateBrand.rejected, (state, action) => {
      console.log("faler");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateBrand.fulfilled, (state, action) => {
      console.log("success");
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteBrand.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteBrand.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteBrand.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const brandsSelector = (store) => store.brands;
export const brandsReducer = brandsSlice.reducer;

export default brandsSlice;
