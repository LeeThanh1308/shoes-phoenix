// warehousesSlice.js

import AuthRequest from "@/services/axios/AuthRequest";
import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

// Async thunks
export const handleGetWarehouses = createAsyncThunk(
  "warehouses/handleGetWarehouses",
  async () => {
    const response = await GuestRequest.get("warehouses");
    return { data: response.data };
  }
);

export const handleGetWarehouseById = createAsyncThunk(
  "warehouses/handleGetWarehouseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get(`warehouses/${id}`);
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleCreateWarehouse = createAsyncThunk(
  "warehouses/handleCreateWarehouse",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("warehouses", data);
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleUpdateWarehouse = createAsyncThunk(
  "warehouses/handleUpdateWarehouse",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.patch(`warehouses/${id}`, data);
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteWarehouse = createAsyncThunk(
  "warehouses/handleDeleteWarehouse",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.delete("warehouses", {
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

export const handleReceiveStock = createAsyncThunk(
  "warehouses/handleReceiveStock",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("warehouses/receive", data);
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleIssueStock = createAsyncThunk(
  "warehouses/handleIssueStock",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("warehouses/issue", data);
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleTransferStock = createAsyncThunk(
  "warehouses/handleTransferStock",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthRequest.post("warehouses/transfer", data);
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetInventory = createAsyncThunk(
  "warehouses/handleGetInventory",
  async (warehouseId, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get(
        `warehouses/${warehouseId}/inventory`
      );
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetStockMovements = createAsyncThunk(
  "warehouses/handleGetStockMovements",
  async (warehouseId, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.get(
        `warehouses/${warehouseId}/movements`
      );
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetSummaryReport = createAsyncThunk(
  "warehouses/handleGetSummaryReport",
  async ({ warehouseId, params }, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append("from", params.from);
      if (params.to) searchParams.append("to", params.to);

      const response = await GuestRequest.get(
        `warehouses/${warehouseId}/report/summary?${searchParams}`
      );
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleGetProductReport = createAsyncThunk(
  "warehouses/handleGetProductReport",
  async ({ warehouseId, productId, params }, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append("from", params.from);
      if (params.to) searchParams.append("to", params.to);

      const response = await GuestRequest.get(
        `warehouses/${warehouseId}/report/product/${productId}?${searchParams}`
      );
      return { data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

const initialState = {
  warehouses: [],
  currentWarehouse: null,
  inventory: [],
  movements: [],
  summaryReport: null,
  productReport: null,
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const warehousesSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {
    handleChangeRefreshWarehouse: (state) => {
      state.onRefresh = !state.onRefresh;
    },
    handleClearCurrentWarehouse: (state) => {
      state.currentWarehouse = null;
    },
    handleClearInventory: (state) => {
      state.inventory = [];
    },
    handleClearMovements: (state) => {
      state.movements = [];
    },
    handleClearReports: (state) => {
      state.summaryReport = null;
      state.productReport = null;
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetWarehouses.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetWarehouses.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetWarehouses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.warehouses = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetWarehouseById.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetWarehouseById.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetWarehouseById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentWarehouse = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleCreateWarehouse.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateWarehouse.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateWarehouse.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateWarehouse.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleUpdateWarehouse.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateWarehouse.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteWarehouse.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteWarehouse.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteWarehouse.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleReceiveStock.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleReceiveStock.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleReceiveStock.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleIssueStock.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleIssueStock.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleIssueStock.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleTransferStock.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleTransferStock.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleTransferStock.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleGetInventory.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetInventory.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetInventory.fulfilled, (state, action) => {
      state.isLoading = false;
      state.inventory = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetStockMovements.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetStockMovements.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetStockMovements.fulfilled, (state, action) => {
      state.isLoading = false;
      state.movements = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetSummaryReport.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetSummaryReport.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetSummaryReport.fulfilled, (state, action) => {
      state.isLoading = false;
      state.summaryReport = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetProductReport.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetProductReport.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetProductReport.fulfilled, (state, action) => {
      state.isLoading = false;
      state.productReport = action.payload?.data;
    });
  },
});

export const {
  handleChangeRefreshWarehouse,
  handleClearCurrentWarehouse,
  handleClearInventory,
  handleClearMovements,
  handleClearReports,
} = warehousesSlice.actions;

export const warehousesSelector = (store) => store.warehouses;
export const warehousesReducer = warehousesSlice.reducer;

export default warehousesSlice;
