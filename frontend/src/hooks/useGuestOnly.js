"use client";

import { useEffect, useLayoutEffect } from "react";

import { authSelector } from "@/services/redux/Slices/auth";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

// Kiểm tra ngược lại → nếu login rồi thì không vào login/register nữa
export default function useGuestOnly(Component) {
  return function GuestOnly() {
    const router = useRouter();
    const { isAuthenticated } = useSelector(authSelector);

    useEffect(() => {
      if (isAuthenticated) {
        if (document.referrer) {
          router.back();
        } else {
          router.push("/");
        }
      }
    }, [isAuthenticated]);

    if (isAuthenticated) return null;
    return <Component />;
  };
}
