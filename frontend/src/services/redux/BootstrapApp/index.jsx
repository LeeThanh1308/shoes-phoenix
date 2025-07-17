"use client";

import "@ant-design/v5-patch-for-react-19";

import { blogsSelector, handleGetBlogs } from "../Slices/blogs";
import {
  bootstrapSelector,
  handleGetBootstrapBrands,
  handleGetBootstrapCategories,
  handleGetBootstrapTargetGroups,
} from "../Slices/bootstrap";
import { branchesSelector, handleGetBranches } from "../Slices/branches";
import { brandsSelector, handleGetBrands } from "../Slices/brands";
import {
  cartsSelector,
  handleClearCart,
  handleGetCarts,
} from "../Slices/carts";
import { categorySelector, handleGetCategories } from "../Slices/categories";
import { colorsSelector, handleGetColors } from "../Slices/colors";
import { commentsSelector, handleGetComments } from "../Slices/comments";
import { handleGetListAccountCustomers, usersSelector } from "../Slices/users";
import { handleGetProducts, productsSelector } from "../Slices/products";
import { handleGetSearch, searchSelector } from "../Slices/search";
import { handleGetSliders, sliderSelector } from "../Slices/sliders";
import { handleGetStores, storesSelector } from "../Slices/stores";
import { handleGetTargets, targetsSelector } from "../Slices/targets";
import { redirect, useParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useLayoutEffect, useState } from "react";

import { authSelector } from "../Slices/auth";
import { handleGetInfoMyUser } from "../Slices/auth/userApi";
import { handleGetInfoVerifyCodeSign } from "../Slices/auth/registerApi";
import { likesSelector } from "../Slices/likes";
import { ordersSelector } from "../Slices/orders";

function BootStrapApp() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [showLoading, setShowLoading] = useState(false);
  const { onRefresh: onRefreshBootstrap, isLoading: isLoadingBootstrap } =
    useSelector(bootstrapSelector);
  const {
    onRefresh: onRefreshAuth,
    isLoading: isLoadingAuth,
    activeVerifyCodeSignID,
    isAuthenticated,
    user,
  } = useSelector(authSelector);
  const { onRefresh: onRefreshCate, isLoading: isLoadingCate } =
    useSelector(categorySelector);
  const { onRefresh: onRefreshBrench, isLoading: isLoadingBrench } =
    useSelector(branchesSelector);
  const { onRefresh: onRefreshBrand, isLoading: isLoadingBrand } =
    useSelector(brandsSelector);
  const { onRefresh: onRefreshColor, isLoading: isLoadingColor } =
    useSelector(colorsSelector);
  const { onRefresh: onRefreshTarget, isLoading: isLoadingTarget } =
    useSelector(targetsSelector);
  const { onRefresh: onRefreshProducts, isLoading: isLoadingProducts } =
    useSelector(productsSelector);
  const { onRefresh: onRefreshStores, isLoading: isLoadingStores } =
    useSelector(storesSelector);
  const { onRefresh: onRefreshSearch, isLoading: isLoadingSearch } =
    useSelector(searchSelector);
  const { onRefresh: onRefreshCart, isLoading: isLoadingCart } =
    useSelector(cartsSelector);
  const { onRefresh: onRefreshUsers, isLoading: isLoadingUsers } =
    useSelector(usersSelector);
  const { onRefresh: onRefreshSliders, isLoading: isLoadingSliders } =
    useSelector(sliderSelector);
  const { onRefresh: onRefreshBlogs, isLoading: isLoadingBlogs } =
    useSelector(blogsSelector);
  const { onRefresh: onRefreshComments, isLoading: isLoadingComments } =
    useSelector(commentsSelector);
  const { isLoading: isLoadingLikes } = useSelector(likesSelector);
  const { isLoading: isLoadingOrders } = useSelector(ordersSelector);

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (onRefreshCate) dispatch(handleGetCategories());
      if (onRefreshBrench) dispatch(handleGetBranches());
      if (onRefreshBrand) dispatch(handleGetBrands());
      if (onRefreshColor) dispatch(handleGetColors());
      if (onRefreshTarget) dispatch(handleGetTargets());
      if (onRefreshProducts) dispatch(handleGetProducts());
      if (onRefreshStores) dispatch(handleGetStores({ branchID: params?.id }));
      if (onRefreshSliders) dispatch(handleGetSliders());
      if (isAuthenticated) {
        if (onRefreshCart) dispatch(handleGetCarts());
        if (onRefreshUsers) dispatch(handleGetListAccountCustomers());
        if (onRefreshAuth) dispatch(handleGetInfoMyUser());
      }
    }, 500);

    return () => clearTimeout(timerID);
  }, [
    onRefreshBootstrap,
    onRefreshCate,
    onRefreshBrench,
    onRefreshBrand,
    onRefreshColor,
    onRefreshTarget,
    onRefreshProducts,
    onRefreshStores,
    onRefreshCart,
    onRefreshUsers,
    onRefreshSliders,
    onRefreshAuth,
    onRefreshBlogs,
  ]);

  useLayoutEffect(() => {
    const timerID = setTimeout(() => {
      if (
        isLoadingCate ||
        isLoadingBrench ||
        isLoadingBrand ||
        isLoadingColor ||
        isLoadingTarget ||
        isLoadingProducts ||
        isLoadingBootstrap ||
        isLoadingAuth ||
        isLoadingStores ||
        isLoadingSearch ||
        isLoadingCart ||
        isLoadingUsers ||
        isLoadingSliders ||
        isLoadingBlogs ||
        isLoadingComments ||
        isLoadingLikes ||
        isLoadingOrders
      ) {
        setShowLoading(true);
      } else {
        setShowLoading(false);
      }
    }, 50);

    return () => clearTimeout(timerID);
  }, [
    isLoadingAuth,
    isLoadingCate,
    isLoadingBrench,
    isLoadingBrand,
    isLoadingColor,
    isLoadingTarget,
    isLoadingProducts,
    isLoadingBootstrap,
    isLoadingStores,
    isLoadingSearch,
    isLoadingCart,
    isLoadingUsers,
    isLoadingSliders,
    isLoadingBlogs,
    isLoadingComments,
    isLoadingLikes,
    isLoadingOrders,
  ]);

  useEffect(() => {
    dispatch(handleGetBootstrapBrands());
    dispatch(handleGetBootstrapCategories());
    dispatch(handleGetBootstrapTargetGroups());
    if (isAuthenticated) {
      dispatch(handleGetCarts());
      if (!user?.fullname) {
        dispatch(handleGetInfoMyUser());
      }
    }
  }, []);

  useEffect(() => {
    if (Number(activeVerifyCodeSignID)) {
      dispatch(handleGetInfoVerifyCodeSign(+activeVerifyCodeSignID));
    }
  }, [activeVerifyCodeSignID]);

  useEffect(() => {
    // if (isAuthenticated && pathname == "/login" && user && !isLoadingAuth) {
    //   redirect("/");
    // }
    // if (!isAuthenticated && pathname !== "/" && !isLoadingAuth) {
    //   redirect("/");
    // }
    if (isAuthenticated) {
      dispatch(handleGetCarts());
      if (!user?.fullname) {
        dispatch(handleGetInfoMyUser());
      }
    } else {
      // if (document.referrer) {
      //   router.back();
      // } else {
      //   router.replace("/");
      // }
      dispatch(handleClearCart());
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    showLoading
      ? (document.body.style.overflow = "hidden")
      : (document.body.style.overflow = "auto");
    return () => {
      document.body.style.overflow = "auto"; // Bật lại khi đóng modal
    };
  }, [showLoading]);

  return (
    showLoading && (
      <div className=" fixed top-0 right-0 left-0 bottom-0 bg-white/80 backdrop-blur-3xl z-[9999] flex justify-center items-center">
        <div className="loader">
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  );
}

export default BootStrapApp;
