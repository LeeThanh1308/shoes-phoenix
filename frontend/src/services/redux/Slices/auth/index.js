import {
  handleChangeMyPass,
  handleGetInfoMyUser,
  handleUpdateInfoMyUser,
} from "./userApi";
import {
  handleCreateAccountVerify,
  handleGetInfoVerifyCodeSign,
} from "./registerApi";
import {
  handleCreateOrderByCashier,
  handleCreatePayment,
  handleGetDetailOrder,
  handleUpdateStatusPayment,
} from "./paymentApi";
import { handleLogin, handleLogout } from "./loginApi";

import AuthRequest from "@/services/axios/AuthRequest";
import Cookies from "js-cookie";
import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";
import { handleForgotPassword } from "./forgotPasswordApi";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");
export const handleRefreshOtpCode = createAsyncThunk(
  "auth/handleRefreshOtpCode",
  async (ID, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get("verifications/refresh/" + ID);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleVerifyOtpCode = createAsyncThunk(
  "auth/handleVerifyOtpCode",
  async ({ id, code, ...data }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.post(
        `verifications/accounts/${id}/${code}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetInfoUser = createAsyncThunk(
  "auth/handleGetInfoUser",
  async () => {
    async (data, { rejectWithValue }) => {
      try {
        const response = await AuthRequest.post(`verifications/accounts/info`);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Request failed");
      }
    };
  }
);
const initialState = {
  user: {},
  role: undefined,
  isAuthenticated: false,
  isShowLoginRequiredPrompt: false,
  isLoading: false,
  validators: {},
  onRefresh: false,
  orderCode: null,
  orderData: null,
  activeVerifyCodeSignID: false,
  forgetPassState: {
    message: undefined,
    token: undefined,
  },
  dataVerifyCode: {
    email: "",
    total: "",
    expRefreshToken: "",
    expVerify: "",
  },
  statusVerify: {
    state: undefined,
    message: "",
  },
  loginState: {
    message: "",
  },
};

const authSlice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    handleChangeStateActiveVerify(state, action) {
      state.activeVerifyCodeSignID = action.payload;
    },
    handleChangeStatusVerify(state, action) {
      state.statusVerify = action.payload;
    },
    handleChangeLoginState(state, action) {
      state.loginState = action.payload;
    },
    handleChangeLoading(state, action) {
      state.isLoading = action.payload;
    },
    handleChangeForgetPassState(state, action) {
      state.forgetPassState = {
        ...state.forgetPassState,
        ...(action.payload ?? {}),
      };
    },
    handleLogoutState(state) {
      state.user = {};
      state.role = null;
      state.isAuthenticated = false;
      Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_KEY);
    },
    handleToggleLoginRequiredPrompt(state) {
      state.isShowLoginRequiredPrompt = !state.isShowLoginRequiredPrompt;
    },
    handleChangeOrderCode(state, action) {
      state.orderCode = action.payload;
    },
    handleChangeOrderData(state, action) {
      state.orderData = action.payload;
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleCreatePayment.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreatePayment.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleCreatePayment.fulfilled, (state, action) => {
      state.isLoading = false;
    });
    //#################################################################
    builder.addCase(handleCreateOrderByCashier.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateOrderByCashier.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleCreateOrderByCashier.fulfilled, (state, action) => {
      state.isLoading = false;
      if (Number(action.payload?.orderCode)) {
        state.orderCode = action.payload.orderCode;
      }
    });
    //#################################################################
    builder.addCase(handleGetDetailOrder.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetDetailOrder.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetDetailOrder.fulfilled, (state, action) => {
      state.isLoading = false;
    });
    //#################################################################
    builder.addCase(handleUpdateStatusPayment.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleUpdateStatusPayment.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleUpdateStatusPayment.fulfilled, (state, action) => {
      state.isLoading = false;
    });
    //#################################################################
    builder.addCase(handleCreateAccountVerify.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateAccountVerify.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateAccountVerify.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.activeVerifyCodeSignID = +action.payload.id;
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleGetInfoVerifyCodeSign.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetInfoVerifyCodeSign.rejected, (state, action) => {
      state.isLoading = false;
      state.dataVerifyCode = {
        email: "",
        total: "",
        expRefreshToken: "",
        expVerify: "",
      };
      state.activeVerifyCodeSignID = false;
      state.forgetPassState = {};
      state.statusVerify = {};
    });
    builder.addCase(handleGetInfoVerifyCodeSign.fulfilled, (state, action) => {
      state.isLoading = false;
      state.dataVerifyCode = action.payload;
    });
    //#################################################################
    builder.addCase(handleRefreshOtpCode.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleRefreshOtpCode.rejected, (state, action) => {
      Toastify(0, action.payload?.message);
      state.isLoading = false;
    });
    builder.addCase(handleRefreshOtpCode.fulfilled, (state, action) => {
      state.isLoading = false;
      Toastify(1, "Refresh Otp thành công.");
      state.dataVerifyCode = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleVerifyOtpCode.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleVerifyOtpCode.rejected, (state, action) => {
      state.isLoading = false;
      Toastify(0, action.payload?.message);
      state.statusVerify = {
        state: false,
        message: action.payload?.message,
      };
    });
    builder.addCase(handleVerifyOtpCode.fulfilled, (state, action) => {
      state.isLoading = false;
      state.statusVerify = {
        state: true,
        message: action.payload?.message,
      };
    });
    //#################################################################
    builder.addCase(handleLogin.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleLogin.rejected, (state, action) => {
      state.isLoading = false;
      state.loginState = action.payload;
      state.isAuthenticated = false;
    });
    builder.addCase(handleLogin.fulfilled, (state, action) => {
      const { user, role, token } = action.payload;
      state.isLoading = false;
      state.user = user;
      state.role = role;
      state.isAuthenticated = true;
      Cookies.set(process.env.NEXT_PUBLIC_TOKEN_KEY, token?.token, {
        sameSite: "Strict",
        expires: (1 / 24 / 60 / 60) * token?.exp,
      });
    });
    //#################################################################
    builder.addCase(handleLogout.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleLogout.rejected, (state, action) => {
      state.isLoading = false;
      state.user = {};
      state.role = null;
      state.isAuthenticated = false;
      Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_KEY);
    });
    builder.addCase(handleLogout.fulfilled, (state, action) => {
      Toastify(1, "Đăng xuất tài khoản thành công.");
      state.isLoading = false;
      state.user = {};
      state.role = null;
      state.isAuthenticated = false;
      Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_KEY);
    });
    //#################################################################
    builder.addCase(handleGetInfoUser.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetInfoUser.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetInfoUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.role = null;
      state.isAuthenticated = false;
      Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_KEY);
    });
    //#################################################################
    builder.addCase(handleForgotPassword.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleForgotPassword.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleForgotPassword.fulfilled, (state, action) => {
      state.isLoading = false;
      state.forgetPassState = action.payload;
    });
    //#################################################################
    builder.addCase(handleGetInfoMyUser.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetInfoMyUser.rejected, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
    });
    builder.addCase(handleGetInfoMyUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.user = action.payload;
    });
    //#################################################################
    builder.addCase(handleUpdateInfoMyUser.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleUpdateInfoMyUser.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleUpdateInfoMyUser.fulfilled, (state, action) => {
      Toastify(1, action?.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleChangeMyPass.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleChangeMyPass.rejected, (state, action) => {
      state.isLoading = false;
      state.validators = action.payload?.validators ?? {};
    });
    builder.addCase(handleChangeMyPass.fulfilled, (state, action) => {
      Toastify(1, action?.payload?.message);
      state.isLoading = false;
      state.isAuthenticated = false;
      state.role = undefined;
      state.user = {};
    });
    //#################################################################
  },
});

export const {
  handleChangeStateActiveVerify,
  handleChangeStatusVerify,
  handleChangeLoginState,
  handleChangeLoading,
  handleChangeForgetPassState,
  handleLogoutState,
  handleToggleLoginRequiredPrompt,
  handleChangeOrderCode,
  handleChangeOrderData,
} = authSlice.actions;
export const authSelector = (store) => store.auth;
export const authReducer = authSlice.reducer;
export default authSlice;
