"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import { authReducer } from "./Slices/auth";
import { blogsReducer } from "./Slices/blogs";
import { bootstrapReducer } from "./Slices/bootstrap";
import { branchesReducer } from "./Slices/branches";
import { brandsReducer } from "./Slices/brands";
import { cartsReducer } from "./Slices/carts";
import { categoryReducer } from "./Slices/categories";
import { colorsReducer } from "./Slices/colors";
import { commentsReducer } from "./Slices/comments";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { likesReducer } from "./Slices/likes";
import { ordersReducer } from "./Slices/orders";
import { productsReducer } from "./Slices/products";
import { searchReducer } from "./Slices/search";
import { sizesReducer } from "./Slices/sizes";
import { sliderReducer } from "./Slices/sliders";
import storage from "redux-persist/lib/storage"; // localStorage cho web
import { storesReducer } from "./Slices/stores";
import { targetsReducer } from "./Slices/targets";
import { usersReducer } from "./Slices/users";
import { warehousesReducer } from "./Slices/warehouses";

const encryptor = encryptTransform({
  secretKey: process.env.NEXT_PUBLIC_KEY_STORAGE || "super-secret-key", // Đổi thành biến môi trường thật sự khi deploy
  onError: (err) => console.error("Encrypt error:", err),
});

// Persist config (chỉ cho auth)
const authPersistConfig = {
  key: "auth",
  storage,
  transforms: [encryptor],
  whitelist: [
    "activeVerifyCodeSignID",
    "isAuthenticated",
    "role",
    "user",
    "forgetPassState",
    "orderCode",
    "orderData",
  ], // tuỳ slice của bạn
};

// Gộp reducer
const rootReducer = combineReducers({
  bootstrap: bootstrapReducer,
  auth: persistReducer(authPersistConfig, authReducer), // áp dụng mã hóa + persist riêng cho auth
  category: categoryReducer,
  branches: branchesReducer,
  brands: brandsReducer,
  colors: colorsReducer,
  targets: targetsReducer,
  products: productsReducer,
  sizes: sizesReducer,
  stores: storesReducer,
  search: searchReducer,
  carts: cartsReducer,
  users: usersReducer,
  sliders: sliderReducer,
  blogs: blogsReducer,
  comments: commentsReducer,
  likes: likesReducer,
  orders: ordersReducer,
  warehouses: warehousesReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // cần tắt để redux-persist không lỗi
    }),
});

export const persistor = persistStore(store);

export default store;
