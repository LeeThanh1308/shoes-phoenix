"use client";

import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useLayoutEffect, useState } from "react";

import { Button } from "antd";
import Image from "next/image";
import Link from "next/link";
import { authSelector } from "@/services/redux/Slices/auth";
import { handleCreateAccountVerify } from "@/services/redux/Slices/auth/registerApi";
import { redirect } from "next/navigation";
import { registerSchema } from "@/services/schema/registerSchema";
import { useForm } from "react-hook-form";
import useGuestOnly from "@/hooks/useGuestOnly";
import { zodResolver } from "@hookform/resolvers/zod";

function Regsister() {
  const { validators, activeVerifyCodeSignID } = useSelector(authSelector);
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
    resolver: zodResolver(registerSchema),
  });
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const onSubmit = (data) => {
    dispatch(handleCreateAccountVerify(data));
  };

  useLayoutEffect(() => {
    if (Number(activeVerifyCodeSignID)) {
      redirect("/verify-code");
    }
  }, [activeVerifyCodeSignID]);

  useEffect(() => {
    Object.entries(validators).forEach(([field, message]) => {
      setError(field, { type: "server", message });
    });
  }, [validators]);
  console.log(errors);
  return (
    <div className="w-full h-screen flex text-center relative">
      <div className="w-3/12 text-slate-950 m-auto rounded-lg  font-bold p-3 px-4 shadow-sm shadow-black bg-white/90">
        <div>
          <div className=" w-20 h-20 mx-auto z-10 relative">
            <Link href="/" className="">
              <Image
                fill
                src={`/images/logo.png`}
                className="w-full h-full object-contain"
                priority
                alt="logo"
              />
            </Link>
          </div>
          <h2 className="text-3xl font-dancing-script text-shadow">
            Đăng ký tài khoản.
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-4 mb-3">
              <div className="mb-2 w-full mr-1">
                <input
                  type="text"
                  name="fullname"
                  placeholder="Họ và tên"
                  className={`p-2 rounded-md w-full border border-solid border-slate-400 outline-none focus:bg-white image-shadow text-blue-700 placeholder:text-slate-700 ${
                    !errors.fullname?.message ? null : "!border-red-500"
                  }`}
                  {...register("fullname")}
                />
                <p className=" indent-1 warn w-full mb-1 text-start text-xs text-red-600 text-shadow">
                  {errors.fullname?.message}
                </p>
              </div>
              <div className="w-full flex justify-between">
                <div className="mb-2 w-3/6 mr-1">
                  <div className="w-full mx-auto mb-2">
                    <input
                      type="text"
                      name="phone"
                      placeholder="Số điện thoại"
                      className={`p-2 rounded-md w-full border border-solid border-slate-400 outline-none focus:bg-white image-shadow text-blue-700 placeholder:text-slate-700 ${
                        !errors.phone?.message ? null : "!border-red-500"
                      }`}
                      {...register("phone")}
                    />
                    <p className=" indent-1 warn w-full mb-1 text-start text-xs text-red-600 text-shadow">
                      {errors.phone?.message}
                    </p>
                  </div>
                </div>
                <div className="mb-2 w-3/6">
                  <div className="w-full mx-auto mb-2">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className={`p-2 rounded-md w-full border border-solid border-slate-400 outline-none focus:bg-white image-shadow text-blue-700 placeholder:text-slate-700 ${
                        !errors.email?.message ? null : "!border-red-500"
                      }`}
                      {...register("email")}
                    />
                    <p className=" indent-1 warn w-full mb-1 text-start text-xs text-red-600 text-shadow">
                      {errors.email?.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-2 w-full mr-1">
                <input
                  type="date"
                  name="birthday"
                  className={`p-2 rounded-md w-full border border-solid border-slate-400 outline-none focus:bg-white image-shadow text-blue-700 placeholder:text-slate-700 ${
                    !watch("birthday") ? "!text-slate-700" : "text-black"
                  } ${!errors.birthday?.message ? "" : "!border-red-500"}`}
                  {...register("birthday")}
                />
                <p className=" indent-1 warn w-full mb-1 text-start text-xs text-red-600 text-shadow">
                  {errors.birthday?.message}
                </p>
              </div>

              <div className="w-full mx-auto mb-2">
                <select
                  name="gender"
                  className={`p-2 rounded-md w-full border border-solid border-slate-400 outline-none focus:bg-white image-shadow text-blue-700 placeholder:text-slate-700 ${
                    !watch("gender") ? "!text-slate-700" : "text-black"
                  } ${!errors.gender?.message ? null : "!border-red-500"}`}
                  defaultValue={""}
                  {...register("gender")}
                >
                  <option value="" disabled hidden className="">
                    Giới tính
                  </option>
                  <option value="x">Nam</option>
                  <option value="y">Nữ</option>
                  <option value="z">Khác</option>
                </select>
                <p className=" indent-1 warn w-full mb-1 text-start text-xs text-red-600 text-shadow">
                  {errors.gender?.message}
                </p>
              </div>

              <div className="w-full flex justify-between">
                <div className="mb-2 w-3/6 mr-1 relative">
                  <div className=" relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Mật khẩu"
                      className={`p-2 rounded-md w-full border border-solid border-slate-400 outline-none focus:bg-white image-shadow text-blue-700 placeholder:text-slate-700 ${
                        !errors.password?.message ? null : "!border-red-500"
                      }`}
                      {...register("password")}
                    />
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
                  </div>

                  <p className=" indent-1 warn w-full mb-1 text-start text-xs text-red-600 text-shadow">
                    {errors.password?.message}
                  </p>
                </div>

                <div className="w-3/6 mx-auto mb-2">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    className={`p-2 rounded-md w-full border border-solid border-slate-400 outline-none focus:bg-white image-shadow text-blue-700 placeholder:text-slate-700 ${
                      !errors.confirmPassword?.message
                        ? null
                        : "!border-red-500"
                    }`}
                    {...register("confirmPassword")}
                  />
                  <p className=" indent-1 warn w-full mb-1 text-start text-xs text-red-600 text-shadow">
                    {errors.confirmPassword?.message}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-1 rounded-md hover:opacity-75 w-1/2 bg-rose-500 text-white"
            >
              Đăng ký
            </button>
          </form>
          <div className="mt-3 py-1 text-shadow">
            <p className="text-sm cursor-default">
              Bạn đã có tài khoản?{" "}
              <Link href="/login">
                <span className="text-blue-500 cursor-pointer">Đăng nhập.</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default useGuestOnly(Regsister);
