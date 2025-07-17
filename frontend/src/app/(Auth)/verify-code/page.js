"use client";

import {
  authSelector,
  handleChangeStateActiveVerify,
  handleRefreshOtpCode,
  handleVerifyOtpCode,
} from "@/services/redux/Slices/auth";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import FormOtp from "@/components/sections/FormOtp";
import Image from "next/image";
import Link from "next/link";
import { formartHouseMinutesSeconds } from "@/services/utils";
import { redirect } from "next/navigation";
import useGuestOnly from "@/hooks/useGuestOnly";

function VerifyCode() {
  const dispatch = useDispatch();
  const { activeVerifyCodeSignID, dataVerifyCode } = useSelector(authSelector);
  const [timeVerify, setTimeVerify] = useState();
  const [timeExpCode, setTimeExpCode] = useState({
    expRefreshToken: 0,
    dateExpVerify: 0,
  });

  const handleVerifyResult = async (code) => {
    await dispatch(handleVerifyOtpCode({ id: activeVerifyCodeSignID, code }));
    redirect("/redirect");
  };

  const handleRefreshCode = async () => {
    dispatch(handleRefreshOtpCode(activeVerifyCodeSignID));
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (timeVerify <= 0 && activeVerifyCodeSignID && dataVerifyCode?.email) {
        dispatch(handleChangeStateActiveVerify(false));
        redirect("/login");
      }
      if (timeVerify) {
        setTimeVerify(timeVerify - 1);
      }
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeVerify]);

  useEffect(() => {
    if (!activeVerifyCodeSignID) {
      redirect("/login");
    }
  }, [activeVerifyCodeSignID]);

  useEffect(() => {
    const currentTime = new Date().getTime();
    const { expRefreshToken, expVerify } = dataVerifyCode;
    const dateExpRefresh = Math.floor(
      (new Date(expRefreshToken).getTime() - currentTime) / 1000
    );
    const dateExpVerify = Math.floor(
      (new Date(expVerify).getTime() - currentTime) / 1000
    );
    setTimeExpCode({
      expRefreshToken: dateExpRefresh,
      dateExpVerify: dateExpVerify,
    });
    setTimeVerify(dateExpVerify);
  }, [dataVerifyCode]);

  return (
    <div className="w-full h-screen flex text-center relative font-barlow font-bold">
      <div className="w-3/12 text-slate-950 m-auto p-4 rounded-md bg-white/90 shadow-sm relative">
        <div>
          <div className="mt-4 w-20 h-20 mx-auto relative">
            <Image
              fill
              src={`/images/logo.png`}
              className="w-full h-full logo"
              priority
              alt="logo"
            />
          </div>

          <h2 className="text-3xl">Xác minh tài khoản.</h2>
          <div className=" text-lg font-normal text-black mt-1 image-shadow text-justify">
            <span>
              Nhập mã xác minh gồm 6 chữ số mà chúng tôi đã gửi tới email{" "}
            </span>
            <span className=" font-bold">{dataVerifyCode.email}</span>
            <span> của bạn, mã sẽ hết hạn sau</span>
            <span className="text-green-500 font-bold text-sm ">
              {" "}
              {formartHouseMinutesSeconds(timeVerify ? timeVerify : 0)}
            </span>
            <span>
              . Nếu bạn vẫn không tìm thấy mã trong hộp thư đến, hãy kiểm tra
              thư mục Spam.
            </span>
          </div>

          <div>
            <FormOtp
              classx={" m-2"}
              getValue={handleVerifyResult}
              clickRefresh={handleRefreshCode}
              totalVerify={dataVerifyCode?.total}
              expRefresh={timeExpCode.expRefreshToken}
              onEnter={(code) => handleVerifyResult(code)}
            />
          </div>

          <div className="mt-3 py-1">
            <p className="text-sm cursor-default image-shadow">
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

export default useGuestOnly(VerifyCode);
