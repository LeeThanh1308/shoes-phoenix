"use client";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  authSelector,
  handleChangeStatusVerify,
  handleRefreshOtpCode,
  handleVerifyOtpCode,
} from "@/services/redux/Slices/auth";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { Button } from "antd";
import { ChangePassSchemaForget } from "@/services/schema/changePassSchema";
import { ForgotPasswordSchema } from "@/services/schema/forgotPasswordSchema";
import FormOtp from "@/components/sections/FormOtp";
import Image from "next/image";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import Link from "next/link";
import Toastify from "@/components/sections/Toastify";
import { formartHouseMinutesSeconds } from "@/services/utils";
import { handleForgotPassword } from "@/services/redux/Slices/auth/forgotPasswordApi";
import { handleGetInfoVerifyCodeSign } from "@/services/redux/Slices/auth/registerApi";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import useGuestOnly from "@/hooks/useGuestOnly";
import { zodResolver } from "@hookform/resolvers/zod";

function ForgotPassword() {
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
    resolver: zodResolver(ForgotPasswordSchema),
  });
  const {
    register: registerChangePass,
    handleSubmit: handleSubmitChangePass,
    watch: watchChangePass,
    setValue: setValueChangePass,
    formState: { errors: errorsChangePass },
    clearErrors: clearErrorsChangePass,
    reset: resetChangePass,
    setError: setErrorChangePass,
  } = useForm({
    resolver: zodResolver(ChangePassSchemaForget),
  });
  const dispatch = useDispatch();
  const { forgetPassState, dataVerifyCode, statusVerify } =
    useSelector(authSelector);
  const [countDown, setCountDown] = useState(0);
  const [showPassword, setShowPassword] = useState();

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (countDown <= 0) {
      } else if (countDown) {
        setCountDown(countDown - 1);
      }
    }, 1000);
    return () => clearTimeout(timerId);
  }, [countDown]);

  useEffect(() => {
    if (forgetPassState?.exp) {
      setCountDown(+forgetPassState?.exp);
    }
    if (Number(forgetPassState?.token)) {
      dispatch(handleGetInfoVerifyCodeSign(forgetPassState?.token));
    }
  }, [forgetPassState]);

  useEffect(() => {
    const currentTime = new Date().getTime();
    const { expRefreshToken, expVerify } = dataVerifyCode;
    const dateExpRefresh = Math.floor(
      (new Date(expRefreshToken).getTime() - currentTime) / 1000
    );
    const dateExpVerify = Math.floor(
      (new Date(expVerify).getTime() - currentTime) / 1000
    );
    setCountDown(dateExpRefresh);
  }, [dataVerifyCode]);

  useEffect(() => {
    if (statusVerify?.state) {
      Toastify(1, "Đổi mật khẩu thành công.");
      dispatch(handleChangeStatusVerify({}));
      redirect("/login");
    } else if (Number(forgetPassState?.token)) {
      dispatch(handleGetInfoVerifyCodeSign(forgetPassState?.token));
    }
  }, [statusVerify]);
  const onSubmit = (data) => {
    dispatch(handleForgotPassword(data));
    reset();
    resetChangePass();
  };
  const onSubmitChangePass = (data) => {
    dispatch(handleVerifyOtpCode({ id: forgetPassState?.token, ...data }));
  };

  const handleRefreshCode = async () => {
    dispatch(handleRefreshOtpCode(forgetPassState?.token));
  };
  return (
    <div className="w-full h-screen flex ">
      <div className=" w-1/5 text-center text-slate-950 bg-white/90 shadow-xl m-auto p-4 rounded-md relative ">
        <div className="pb-4">
          <div className=" w-20 h-20 relative mx-auto">
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
          {forgetPassState?.token ? (
            <>
              <h2 className="text-3xl">Đổi mật khẩu</h2>
              <form onSubmit={handleSubmitChangePass(onSubmitChangePass)}>
                <div className="mx-auto mb-2">
                  <InputFormAdmin
                    classNameDiv={` text-start`}
                    className={`text-slate-900 placeholder:text-slate-900 ${
                      errorsChangePass.password?.message
                        ? "!border-red-500"
                        : null
                    }`}
                    placeholder="Mật khẩu"
                    warn={errorsChangePass.password?.message}
                    title="Mật khẩu"
                    type={showPassword ? "text" : "password"}
                    {...registerChangePass("password")}
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
                <div className="mx-auto mb-1 relative">
                  <InputFormAdmin
                    classNameDiv={` text-start`}
                    className={`text-slate-900 relative placeholder:text-slate-900 ${
                      errorsChangePass.confirmPassword?.message
                        ? "!border-red-500"
                        : null
                    }`}
                    placeholder="Nhập lại mật khẩu"
                    warn={errorsChangePass.confirmPassword?.message}
                    title="Nhập lại mật khẩu"
                    type={"password"}
                    {...registerChangePass("confirmPassword")}
                  />
                </div>
                <div className="mx-auto mb-2 flex gap-2 items-center">
                  <div className=" flex-[0.9]">
                    <InputFormAdmin
                      classNameDiv={` text-start`}
                      className={`text-slate-900 relative placeholder:text-slate-900 ${
                        dataVerifyCode.total <= 0 && "opacity-25"
                      } ${
                        errorsChangePass.code?.message
                          ? "!border-red-500"
                          : null
                      }`}
                      placeholder="Mã OTP được gửi ở email của quý khách."
                      warn={errorsChangePass.code?.message}
                      // title="Mã OTP"
                      disabled={dataVerifyCode.total <= 0}
                      type={"text"}
                      {...registerChangePass("code")}
                    />
                  </div>
                  <div className="flex-[0.1]">
                    <Button
                      className="w-full h-full text-slate-900"
                      disabled={countDown > 0}
                      onClick={() => handleRefreshCode(forgetPassState?.token)}
                      type="primary"
                    >
                      {countDown > 0
                        ? "Gửi lại sau " + countDown + "s"
                        : "Gửi lại."}
                    </Button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 text-white font-bold px-4 py-1 rounded-md hover:opacity-75"
                >
                  Xác nhận
                </button>
              </form>

              <div className="mt-3 p-1">
                <p className="text-sm cursor-default image-shadow">
                  Bạn chưa có tài khoản?{" "}
                  <Link href="/register">
                    <span className="text-blue-700 cursor-pointer">
                      Đăng ký
                    </span>
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl">Quên mật khẩu?</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mx-auto mb-2">
                  <InputFormAdmin
                    classNameDiv={` text-start`}
                    className={`text-slate-900 placeholder:text-slate-900 ${
                      errors.email?.message ? "!border-red-500" : null
                    }`}
                    placeholder="Email"
                    warn={errors.email?.message}
                    title="Email"
                    type="text"
                    {...register("email")}
                  />
                </div>
                <div className="mx-auto mb-1 relative">
                  <InputFormAdmin
                    classNameDiv={` text-start`}
                    className={`text-slate-900 relative placeholder:text-slate-900 ${
                      errors.phone?.message ? "!border-red-500" : null
                    }`}
                    placeholder="Số điện thoại"
                    warn={errors.phone?.message}
                    title="Số điện thoại"
                    type={"text"}
                    {...register("phone")}
                  />
                </div>
                <div>
                  <span className="text-xs text-rose-700 image-shadow">
                    {countDown
                      ? `Vui lòng thử lại sau ${formartHouseMinutesSeconds(
                          countDown
                        )}`
                      : forgetPassState?.message}
                  </span>
                </div>

                <button
                  type="submit"
                  className="border border-solid px-4 py-1 rounded-md hover:opacity-75"
                >
                  Xác nhận
                </button>
              </form>

              <div className="mt-3 p-1">
                <p className="text-sm cursor-default image-shadow">
                  Bạn chưa có tài khoản?{" "}
                  <Link href="/register">
                    <span className="text-blue-700 cursor-pointer">
                      Đăng ký
                    </span>
                  </Link>
                </p>
              </div>
              <div className="p-1">
                <Link
                  className="text-sm text-blue-700 cursor-pointer image-shadow"
                  href={"forgot-password"}
                >
                  Bạn quên mật khẩu ư?{" "}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default useGuestOnly(ForgotPassword);
