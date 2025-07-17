import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetDetailBlog = createAsyncThunk(
  "blogs/handleGetDetailBlog",
  async ({ isLogin, slug }) => {
    const response = isLogin
      ? await AuthRequest.get(`blogs/list-blogs/${slug}`)
      : await GuestRequest.get(`blogs/list-blogs/${slug}`);
    return response.data;
  }
);

export const handleGetListBlogs = createAsyncThunk(
  "blogs/handleGetListBlogs",
  async ({ isLogin = false, ...args }) => {
    const response = isLogin
      ? await AuthRequest.get("blogs/list-blogs", {
          params: args,
        })
      : await GuestRequest.get("blogs/list-blogs", {
          params: args,
        });
    return response.data;
  }
);

export const handleGetBlogs = createAsyncThunk(
  "blogs/handleGetBlogs",
  async () => {
    const response = await GuestRequest.get("blogs");
    return { data: response.data };
  }
);

export const handleCreateBlog = createAsyncThunk(
  "blogs/handleCreateBlog",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("blogs", data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteBlog = createAsyncThunk(
  "blogs/handleDeleteBlog",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.delete("blogs", {
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

export const handleUpdateBlog = createAsyncThunk(
  "blogs/handleUpdateBlog",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.patch(`blogs/${id}`, data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

// My blog post
export const handleGetMyBlogs = createAsyncThunk(
  "blogs/handleGetMyBlogs",
  async () => {
    const response = await AuthRequest.get("blogs/me/posts");
    return response.data;
  }
);

export const handleDeleteMyBlog = createAsyncThunk(
  "blogs/handleDeleteMyBlog",
  async (id, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.delete("blogs/me/posts/" + id);
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleUpdateMyBlog = createAsyncThunk(
  "blogs/handleUpdateMyBlog",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.patch(
        "blogs/me/posts/" + data.id,
        data
      );
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
// My blog post

const initialState = {
  blog: {},
  blogs: [],
  listBlogs: {
    data: [],
  },
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const blogsSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    handleChangeRefreshBlog(state, action) {
      state.onRefresh = action.payload;
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetDetailBlog.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetDetailBlog.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetDetailBlog.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.blog = action.payload ?? {};
    });
    //#################################################################
    builder.addCase(handleGetListBlogs.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetListBlogs.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetListBlogs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.listBlogs = action.payload ?? [];
    });
    //#################################################################
    builder.addCase(handleGetBlogs.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetBlogs.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetBlogs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.blogs = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetMyBlogs.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetMyBlogs.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetMyBlogs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.blogs = action.payload;
    });
    //#################################################################
    builder.addCase(handleCreateBlog.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateBlog.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateBlog.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateBlog.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleUpdateBlog.rejected, (state, action) => {
      console.log("faler");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateBlog.fulfilled, (state, action) => {
      console.log("success");
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateMyBlog.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleUpdateMyBlog.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateMyBlog.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteBlog.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteBlog.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteBlog.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteMyBlog.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteMyBlog.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteMyBlog.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const { handleChangeRefreshBlog } = blogsSlice.actions;
export const blogsSelector = (store) => store.blogs;
export const blogsReducer = blogsSlice.reducer;

export default blogsSlice;
