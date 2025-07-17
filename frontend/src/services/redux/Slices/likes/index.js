import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");
export const handleToggleLike = createAsyncThunk(
  "likes/handleToggleLike",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("likes", data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetLikeCountOptions = createAsyncThunk(
  "likes/handleGetLikeCountOptions",
  async ({ isLogin, ...args }, { rejectWithValue }) => {
    try {
      const response = isLogin
        ? await AuthRequest.get("likes/count", {
            params: args,
          })
        : await GuestRequest.get("likes/count", {
            params: args,
          });
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
const initialState = {
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const likesSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {
    handleChangeRefreshLike(state, action) {
      state.onRefresh = !state.onRefresh;
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleToggleLike.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleToggleLike.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleToggleLike.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleGetLikeCountOptions.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetLikeCountOptions.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetLikeCountOptions.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
    });
    //#################################################################
  },
});

export const { handleChangeRefreshLike } = likesSlice.actions;
export const likesSelector = (store) => store.likes;
export const likesReducer = likesSlice.reducer;

export default likesSlice;
