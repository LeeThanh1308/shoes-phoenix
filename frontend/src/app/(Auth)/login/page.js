"use client";

import { FaEye, FaEyeSlash } from "react-icons/fa6";
import {
  authSelector,
  handleChangeLoginState,
} from "@/services/redux/Slices/auth";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import Image from "next/image";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import Link from "next/link";
import { LoginAccountSchema } from "@/services/schema/loginSchema";
import { handleLogin } from "@/services/redux/Slices/auth/loginApi";
import { useForm } from "react-hook-form";
import useGuestOnly from "@/hooks/useGuestOnly";
import { zodResolver } from "@hookform/resolvers/zod";

function LoginPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(LoginAccountSchema),
  });
  const dispatch = useDispatch();
  const { loginState } = useSelector(authSelector);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitLogin = async (data) => {
    dispatch(handleLogin(data));
  };

  useEffect(() => {
    if (loginState.message) {
      dispatch(
        handleChangeLoginState({
          message: "",
        })
      );
    }
  }, [watch("emailAndPhone"), watch("password")]);
  return (
    <div className="w-full h-screen flex">
      <div className="w-96 text-center text-slate-950 m-auto p-4 rounded-md relative shadow-sm shadow-black bg-white/90">
        <div className="">
          <div className="">
            <div className=" w-20 h-20 mx-auto relative">
              <Link href="/">
                <Image
                  fill
                  src={`/images/logo.png`}
                  className="w-full h-full logo"
                  priority
                  alt="logo"
                />
              </Link>
            </div>
            <h2 className="text-3xl text-shadow font-dancing-script font-bold">
              Đăng nhập
            </h2>
          </div>

          <form
            className=" mb-8 font-bold"
            onSubmit={handleSubmit(onSubmitLogin)}
          >
            <div className="mx-auto mb-2">
              <InputFormAdmin
                classNameDiv={` text-start`}
                classNameLable={`image-shadow`}
                className={`rounded-md w-full border border-solid border-slate-400 outline-none focus:bg-white image-shadow text-blue-700 placeholder:font-dancing-script ${
                  errors.emailAndPhone?.message ? "!border-red-500" : null
                }`}
                title="Email of Phone"
                placeholder="Email of Phone"
                warn={errors.emailAndPhone?.message}
                type="text"
                {...register("emailAndPhone")}
              />
            </div>
            <div className="mx-auto mb-1 relative">
              <InputFormAdmin
                classNameDiv={` text-start image-shadow`}
                classNameLable={`image-shadow`}
                className={`rounded-md w-full border border-solid border-slate-400 outline-none focus:bg-white image-shadow text-blue-700 placeholder:font-dancing-script ${
                  errors.password?.message ? "!border-red-500" : null
                }`}
                placeholder="Password"
                warn={errors.password?.message}
                title="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              >
                <div className="absolute right-3 top-0 bottom-0 flex items-center cursor-pointer">
                  {showPassword ? (
                    <FaEye
                      className="image-shadow"
                      onClick={(e) => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <FaEyeSlash
                      className="image-shadow"
                      onClick={(e) => setShowPassword(!showPassword)}
                    />
                  )}
                </div>
              </InputFormAdmin>
            </div>
            <div>
              <span className="text-xs text-rose-700 image-shadow">
                {loginState?.message}
              </span>
            </div>

            <button
              type="submit"
              className="px-4 py-1 w-1/2 rounded-md hover:opacity-75 bg-blue-500 text-white font-bold"
            >
              Xác nhận
            </button>
          </form>

          <div className="">
            <p className="text-sm cursor-default text-shadow">
              Bạn chưa có tài khoản?{" "}
              <Link href="/register">
                <span className="text-blue-700 cursor-pointer font-bold">
                  Đăng ký
                </span>
              </Link>
            </p>
            <Link
              className="text-sm text-blue-700 cursor-pointer text-shadow font-bold"
              href={"forgot-password"}
            >
              Bạn quên mật khẩu ư?{" "}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default useGuestOnly(LoginPage);
