import AuthRequest from "@/services/axios/AuthRequest";

// import GuestRequest from "@/services/axios/GuestRequest";
// import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");
export const handleGetListAccountCustomers = createAsyncThunk(
  "users/handleGetListAccountCustomers",
  async () => {
    const response = await AuthRequest.get("accounts/users");
    return response.data;
  }
);

export const handleCreateAccountByAdmin = createAsyncThunk(
  "users/handleCreateAccountByAdmin",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("accounts", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleChangeBanAccounts = createAsyncThunk(
  "users/handleChangeBanAccounts",
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.patch("accounts/ban/" + id, body);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleUpdateInfoCustomers = createAsyncThunk(
  "users/handleUpdateInfoCustomers",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.patch("accounts/edit", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
const initialState = {
  users: {
    data: [],
    count: 0,
    roleSet: [],
  },
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetListAccountCustomers.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetListAccountCustomers.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(
      handleGetListAccountCustomers.fulfilled,
      (state, action) => {
        state.isLoading = false;
        state.onRefresh = false;
        state.users = action.payload;
      }
    );
    //#################################################################
    builder.addCase(handleCreateAccountByAdmin.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateAccountByAdmin.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateAccountByAdmin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleChangeBanAccounts.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleChangeBanAccounts.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleChangeBanAccounts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateInfoCustomers.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleUpdateInfoCustomers.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateInfoCustomers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
  },
});

export const usersSelector = (store) => store.users;
export const usersReducer = usersSlice.reducer;

export default usersSlice;
