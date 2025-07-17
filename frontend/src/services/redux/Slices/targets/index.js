import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetTargets = createAsyncThunk(
  "targets/handleGetTargets",
  async () => {
    const response = await GuestRequest.get("target-groups");
    return { data: response.data };
  }
);

export const handleCreateTarget = createAsyncThunk(
  "targets/handleCreateTarget",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.post("target-groups", data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteTarget = createAsyncThunk(
  "targets/handleDeleteTarget",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.delete("target-groups", {
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

export const handleUpdateTarget = createAsyncThunk(
  "targets/handleUpdateTarget",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.patch(`target-groups/${id}`, data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
const initialState = {
  targets: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const targetsSlice = createSlice({
  name: "targets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetTargets.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetTargets.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetTargets.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.targets = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleCreateTarget.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateTarget.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateTarget.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateTarget.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleUpdateTarget.rejected, (state, action) => {
      console.log("faler");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateTarget.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteTarget.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteTarget.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteTarget.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const targetsSelector = (store) => store.targets;
export const targetsReducer = targetsSlice.reducer;

export default targetsSlice;
