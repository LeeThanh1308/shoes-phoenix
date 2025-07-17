import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetCategory = createAsyncThunk(
  "category/handleGetCategory",
  async ({ id, childrenId }) => {
    const response = await GuestRequest.get("categories", {
      params: {
        id: id,
        parent: childrenId,
      },
    });
    return { data: response.data };
  }
);
export const handleGetCategories = createAsyncThunk(
  "category/handleGetCategories",
  async () => {
    const response = await GuestRequest.get("categories");
    return { data: response.data };
  }
);

export const handleCreateCategory = createAsyncThunk(
  "category/handleCreateCategory",
  async ({ name, slug, icon, file, parentId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      if (file && file[0]) formData.append("file", file[0]);
      if (parentId) formData.append("parentId", parentId);
      const response = await GuestRequest.post("categories", formData);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteCategory = createAsyncThunk(
  "category/handleDeleteCategory",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.delete("categories", {
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

export const handleUpadateCategory = createAsyncThunk(
  "category/handleUpadateCategory",
  async (
    { id, name, slug, parentId, icon, file, isActive },
    { rejectWithValue }
  ) => {
    try {
      console.log(file);
      const formData = new FormData();
      if (id) formData.append("id", id);
      if (name) formData.append("name", name);
      if (slug) formData.append("slug", slug);
      formData.append("isActive", JSON.stringify(isActive));
      if (parentId) formData.append("parentId", parentId);
      if (file && typeof file !== "string" && file[0] instanceof File)
        formData.append("file", file[0]);
      const response = await GuestRequest.patch(`categories/${id}`, formData);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

const initialState = {
  categorys: {
    data: [],
    depth: 0,
  },
  category: {},
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    // clearValidators: (state) => {
    //   state.validators = {};
    // },
    findParentCategory: (state, action) => {
      state.categorys.data.some((_) => _?.id);
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetCategory.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetCategory.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetCategory.fulfilled, (state, action) => {
      state.isLoading = false;
      state.category = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetCategories.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetCategories.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.categorys = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleCreateCategory.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateCategory.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateCategory.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpadateCategory.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleUpadateCategory.rejected, (state, action) => {
      console.log("faler");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpadateCategory.fulfilled, (state, action) => {
      console.log("success");
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteCategory.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteCategory.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteCategory.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const categorySelector = (store) => store.category;
export const categoryReducer = categorySlice.reducer;

export default categorySlice;
