"use client";

import { useEffect, useLayoutEffect } from "react";

import { handleLogout } from "@/services/redux/Slices/auth/loginApi";
import { handleLogoutState } from "@/services/redux/Slices/auth";
import { useDispatch } from "react-redux";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";

function LogoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(handleLogout());
    dispatch(handleLogoutState());
    const timerID = setTimeout(() => {
      router.replace("/");
    }, 500);

    return () => clearTimeout(timerID);
  }, []);
  return <div></div>;
}

export default useRequireAuth(LogoutPage);
