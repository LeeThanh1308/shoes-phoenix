import GuestRequest from "@/services/axios/GuestRequest";
import Toastify from "@/components/sections/Toastify";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

export const handleGetSlider = createAsyncThunk(
  "slider/handleGetSlider",
  async ({ id, childrenId }) => {
    const response = await GuestRequest.get("sliders", {
      params: {
        id: id,
        parent: childrenId,
      },
    });
    return { data: response.data };
  }
);
export const handleGetSliders = createAsyncThunk(
  "slider/handleGetSliders",
  async () => {
    const response = await GuestRequest.get("sliders");
    return { data: response.data };
  }
);

export const handleCreateSlider = createAsyncThunk(
  "slider/handleCreateSlider",
  async ({ name, slug, file, href }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("href", href);
      if (file) formData.append("file", file);
      const response = await GuestRequest.post("sliders", formData);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);

export const handleDeleteSlider = createAsyncThunk(
  "slider/handleDeleteSlider",
  async ({ id, ids }, { rejectWithValue }) => {
    try {
      const response = await GuestRequest.delete("sliders", {
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

export const handleUpdateSlider = createAsyncThunk(
  "slider/handleUpdateSlider",
  async ({ name, slug, file, href, id }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("id", id);
      formData.append("slug", slug);
      formData.append("href", href);
      if (file) formData.append("file", file);
      const response = await GuestRequest.patch(`sliders/${id}`, formData);
      return { data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Request failed");
    }
  }
);
const initialState = {
  slider: {},
  sliders: [],
  isLoading: false,
  onRefresh: false,
  validators: {},
};

const sliderSlice = createSlice({
  name: "slider",
  initialState,
  reducers: {
    // clearValidators: (state) => {
    //   state.validators = {};
    // },
    findParentSlider: (state, action) => {
      state.sliders.data.some((_) => _?.id);
    },
  },
  extraReducers: (builder) => {
    //#################################################################
    builder.addCase(handleGetSlider.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetSlider.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetSlider.fulfilled, (state, action) => {
      state.isLoading = false;
      state.slider = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleGetSliders.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleGetSliders.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleGetSliders.fulfilled, (state, action) => {
      state.isLoading = false;
      state.onRefresh = false;
      state.sliders = action.payload?.data;
    });
    //#################################################################
    builder.addCase(handleCreateSlider.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleCreateSlider.rejected, (state, action) => {
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleCreateSlider.fulfilled, (state, action) => {
      Toastify(1, action.payload?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleUpdateSlider.pending, (state, action) => {
      console.log("pending");
      state.isLoading = true;
    });
    builder.addCase(handleUpdateSlider.rejected, (state, action) => {
      console.log("faler");
      state.validators = action.payload?.validators ?? {};
      state.isLoading = false;
    });
    builder.addCase(handleUpdateSlider.fulfilled, (state, action) => {
      console.log("success");
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
    //#################################################################
    builder.addCase(handleDeleteSlider.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(handleDeleteSlider.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(handleDeleteSlider.fulfilled, (state, action) => {
      Toastify(action.payload?.data?.type, action.payload?.data?.message);
      state.isLoading = false;
      state.onRefresh = true;
    });
  },
});

export const sliderSelector = (store) => store.sliders;
export const sliderReducer = sliderSlice.reducer;

export default sliderSlice;
