// components/withAuth.tsx
"use client";

import {
  authSelector,
  handleChangeLoading,
} from "@/services/redux/Slices/auth";
import { useDispatch, useSelector } from "react-redux";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

const withRoleGuard = (Component, allowedRoles) => {
  return function RoleProtected() {
    const { role, isAuthenticated } = useSelector(authSelector);
    const router = useRouter();

    useLayoutEffect(() => {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (role && !allowedRoles.includes(role)) {
        router.replace("/");
      }
    }, [role, isAuthenticated]);

    if (!isAuthenticated || (role && !allowedRoles.includes(role))) {
      return null;
    }
    if (isAuthenticated && role && allowedRoles.includes(role)) {
      return <Component />;
    }

    return;
  };
};

export { withRoleGuard };
export default withRoleGuard;
