"use client";

import {
  authSelector,
  handleChangeStateActiveVerify,
} from "@/services/redux/Slices/auth";
import { useDispatch, useSelector } from "react-redux";
import { useLayoutEffect, useState } from "react";

import { FaCircleCheck } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { handleGetInfoVerifyCodeSign } from "@/services/redux/Slices/auth/registerApi";
import { redirect } from "next/navigation";
import useGuestOnly from "@/hooks/useGuestOnly";

function VerifyEmail() {
  const dispatch = useDispatch();
  const { statusVerify, activeVerifyCodeSignID } = useSelector(authSelector);
  const [count, setCount] = useState(3);
  useLayoutEffect(() => {
    const TimeId = setInterval(() => {
      if (statusVerify?.message) {
        setCount((prev) => {
          if (prev <= 1) {
            setCount(0);
            clearInterval(TimeId);
            if (statusVerify?.state) {
              dispatch(handleChangeStateActiveVerify(undefined));
              redirect("/login");
            } else {
              dispatch(handleGetInfoVerifyCodeSign(activeVerifyCodeSignID));
              redirect("/register");
            }
          } else {
            return prev - 1;
          }
        });
      } else {
        clearInterval(TimeId);
      }
    }, 1000);

    return () => clearInterval(TimeId);
  }, [statusVerify?.message]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      {statusVerify.state ? (
        <div className="w-96 h-64 border shadow-md rounded-md text-emerald-600 flex justify-center items-center text-center">
          <div>
            <div className="flex justify-center mb-2">
              <FaCircleCheck className=" text-5xl" />
            </div>
            <h1 className=" text-xl font-bold">{statusVerify?.message}</h1>
            <p className="text-sm">
              Hệ thống sẽ chuyển sang trang đăng nhập sau {count}s.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-96 h-64 border shadow-md rounded-md text-red-600 flex justify-center items-center text-center">
          <div>
            <div className="flex justify-center mb-2">
              <IoCloseCircle className=" text-5xl" />
            </div>
            <h1 className=" text-xl font-bold">{statusVerify?.message}</h1>
            <p className="text-sm">
              Hệ thống sẽ chuyển sang trang verify {count}s.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default useGuestOnly(VerifyEmail);
