"use client";

import { authSelector } from "@/services/redux/Slices/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

// Kiểm tra đăng nhập
export default function useRequireAuth(Component) {
  return function RequireAuth() {
    const router = useRouter();
    const { isAuthenticated } = useSelector(authSelector);
    useEffect(() => {
      if (!isAuthenticated) {
        if (document.referrer) {
          router.back();
        } else {
          router.replace("/login");
        }
      }
    }, [isAuthenticated]);
    if (!isAuthenticated) return null;
    return <Component />;
  };
}
