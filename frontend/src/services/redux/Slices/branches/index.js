import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetBranches = createAsyncThunk(
  "branches/handleGetBranches",
  async () => {
    const response = await GuestRequest.get("branches");
    return { data: response.data };
  }
);

export const handleGetThisBranches = createAsyncThunk(
  "branches/handleGetThisBranches",
  async () => {
    const response = await AuthRequest.get("branches/this-branches");
    return response.data;
  }
);

export const handleGetBranch = createAsyncThunk(
  "branches/handleGetBranch",
  async (id) => {
    const response = await GuestRequest.get("branches", {
      params: {
        id: id,
      },
    });
    return { data: response.data };
  }
);

export const handleCreateBranch = createAsyncThunk(
  "branches/handleCreateBranch",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.post("branches", data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteBranch = createAsyncThunk(
  "branches/handleDeleteBranch",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.delete("branches", {
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

export const handleUpadateBranch = createAsyncThunk(
  "branches/handleUpadateBranch",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.patch(`branches/${id}`, data);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleSetRoleEmployees = createAsyncThunk(
  "branches/handleSetRoleEmployees",
  async ({ branchID, userID, role }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.patch(
        `branches/${branchID}/employees/${userID}/${role}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteRoleEmployees = createAsyncThunk(
  "branches/handleDeleteRoleEmployees",
  async ({ userID }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.delete(`branches/employees/${userID}`);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetEmployeesBranch = createAsyncThunk(
  "branches/handleGetEmployeesBranch",
  async (id) => {
    const response = await GuestRequest.get(`branches/${id}/employees`, {
      params: {
        id: id,
      },
    });
    return Array.isArray(response.data) ? response.data : [];
  }
);

const initialState = {
  branch: [],
  branches: [],
  thisBranches: [],
  employees: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const branchesSlice = createSlice({
  name: "branches",
  initialState,
  reducers: {
    // clearValidators: (state) => {
    //   state.validators = {};
    // },
    findParentBranch: (state, action) => {
      state.branches.data.some((_) => _?.id);
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetBranch.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetBranch.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetBranch.fulfilled, (state, action) => {
      state.isLoading = false;
      state.branch = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetEmployeesBranch.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetEmployeesBranch.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetEmployeesBranch.fulfilled, (state, action) => {
      state.isLoading = false;
      state.employees = action.payload;
    });
    //#################################################################
    builder.addCase(handleGetBranches.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetBranches.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetBranches.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.branches = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetThisBranches.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetThisBranches.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetThisBranches.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.thisBranches = action.payload;
    });
    //#################################################################
    builder.addCase(handleCreateBranch.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateBranch.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateBranch.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpadateBranch.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleUpadateBranch.rejected, (state, action) => {
      console.log("faler");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpadateBranch.fulfilled, (state, action) => {
      console.log("success");
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleSetRoleEmployees.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleSetRoleEmployees.rejected, (state, action) => {
      Toastify(0, "Cập nhật quyền thất bại");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleSetRoleEmployees.fulfilled, (state, action) => {
      Toastify(action.payload?.type, action.payload.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteRoleEmployees.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleDeleteRoleEmployees.rejected, (state, action) => {
      Toastify(0, "Xóa quyền thất bại");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleDeleteRoleEmployees.fulfilled, (state, action) => {
      Toastify(action.payload?.type, action.payload.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteBranch.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteBranch.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteBranch.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const branchesSelector = (store) => store.branches;
export const branchesReducer = branchesSlice.reducer;

export default branchesSlice;
