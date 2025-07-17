import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetSearch = createAsyncThunk(
  "search/handleGetSearch",
  async (data) => {
    const response = await GuestRequest.post(`products/search`, data);
    return { data: response.data };
  }
);

export const handleGetSearchFilter = createAsyncThunk(
  "search/handleGetSearchFilter",
  async (data) => {
    const response = await GuestRequest.post(`products/search`, data);
    return { data: response.data };
  }
);
const initialState = {
  search: {
    products: [],
    totalPage: 0,
  },
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetSearch.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetSearch.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetSearch.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.search = action.payload?.data;
    });

    //#################################################################
    builder.addCase(handleGetSearchFilter.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetSearchFilter.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetSearchFilter.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.search.products = action.payload?.data?.products ?? [];
      state.search.totalPage = action.payload?.data?.totalPage;
      state.search.limit = action.payload?.data?.limit;
    });
  },
});

export const searchSelector = (store) => store.search;
export const searchReducer = searchSlice.reducer;

export default searchSlice;
