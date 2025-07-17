import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");
export const handleGetWhereComments = createAsyncThunk(
  "comments/handleGetWhereComments",
  async (data = {}) => {
    const response = await GuestRequest.get("comments", {
      params: data,
    });
    return response.data;
  }
);

export const handleCreateComment = createAsyncThunk(
  "comments/handleCreateComment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("comments", data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleCreateReplyComment = createAsyncThunk(
  "comments/handleCreateReplyComment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("replies", data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteComment = createAsyncThunk(
  "comments/handleDeleteComment",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.delete("comments", {
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

export const handleUpdateComment = createAsyncThunk(
  "comments/handleUpdateComment",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.patch(`comments/${id}`, data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

const initialState = {
  comments: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetWhereComments.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetWhereComments.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetWhereComments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.comments = Array.isArray(action.payload) ? action.payload : [];
    });
    //#################################################################
    builder.addCase(handleCreateComment.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateComment.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateComment.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    builder.addCase(handleCreateReplyComment.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateReplyComment.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateReplyComment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateComment.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleUpdateComment.rejected, (state, action) => {
      console.log("faler");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateComment.fulfilled, (state, action) => {
      console.log("success");
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteComment.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteComment.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteComment.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const commentsSelector = (store) => store.comments;
export const commentsReducer = commentsSlice.reducer;

export default commentsSlice;
