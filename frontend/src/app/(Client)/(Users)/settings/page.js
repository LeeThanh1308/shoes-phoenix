"use client";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { KeyOutlined, UserOutlined } from "@ant-design/icons";
import {
  handleChangeMyPass,
  handleUpdateInfoMyUser,
} from "@/services/redux/Slices/auth/userApi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useLayoutEffect, useState } from "react";

import { ChangeMyPassSchema } from "@/services/schema/changePassSchema";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import Responsive from "@/components/layout/Responsive";
import { UpdateInfoUserSchema } from "@/services/schema/registerSchema";
import UploadImages from "@/components/sections/UploadImages";
import { authSelector } from "@/services/redux/Slices/auth";
import { useForm } from "react-hook-form";
import useRequireAuth from "@/hooks/useRequireAuth";
import { zodResolver } from "@hookform/resolvers/zod";

function SettingPage() {
  const dispatch = useDispatch();
  const { user, validators } = useSelector(authSelector);
  const [dataFormPass, setDataFormPass] = useState({});
  const [showForm, setShowForm] = useState({
    showInfo: true,
  });
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
    resolver: zodResolver(UpdateInfoUserSchema),
  });

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    formState: { errors: errorsPass },
    setError: setErrorPass,
  } = useForm({
    resolver: zodResolver(ChangeMyPassSchema),
  });
  const onSubmit = (data) => {
    dispatch(handleUpdateInfoMyUser(data));
  };
  const onSubmitPass = (data) => {
    dispatch(handleChangeMyPass(data));
  };
  useEffect(() => {
    Object.entries(user).forEach(([field, value]) => {
      setValue(field, value);
    });
  }, [user]);

  useEffect(() => {
    Object.entries(validators).forEach(([field, message]) => {
      setError(field, { type: "server", message });
      setErrorPass(field, { type: "server", message });
    });
  }, [validators]);
  return (
    <Responsive>
      <div className="w-full h-full pt-3 flex relative font-dancing-script">
        <div className=" w-1/3 px-10">
          <div className="text-3xl mb-2">Cài đặt</div>
          <div
            className={`text-md w-2/3 py-3 px-2 mb-2 rounded ${
              showForm?.showInfo ? " shadow font-bold" : "cursor-pointer"
            }`}
            onClick={() =>
              showForm?.showInfo ? null : setShowForm({ showInfo: true })
            }
          >
            <UserOutlined /> Thông tin cá nhân
          </div>
          <div
            className={`text-md w-2/3 py-3 px-2 mb-2 rounded ${
              showForm?.changePass ? " shadow font-bold" : "cursor-pointer"
            }`}
            onClick={() =>
              showForm?.changePass ? null : setShowForm({ changePass: true })
            }
          >
            <KeyOutlined /> Đổi mật khẩu
          </div>
        </div>
        <div className="w-2/3 shadow shadow-black/60 rounded-lg p-4">
          {showForm?.showInfo ? (
            <>
              <div className="text-xl border-b pb-2">Thông tin cá nhân</div>
              <div className="">
                <div className=" bg-black/90 z-10">
                  <div className="w-full bg-white mx-auto p-4 relative">
                    <div className="w-full text-slate-950">
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-base">
                          Sửa thông tin cá nhân
                        </div>
                      </div>
                      <div>
                        <div className="mt-4 mb-3 w-11/12 mx-auto">
                          <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mt-4 mb-3">
                              <div className="mb-2 w-full mr-1">
                                <InputFormAdmin
                                  title={"Họ và tên"}
                                  placeholder="Họ và tên"
                                  className={`p-2 rounded-md w-full border border-solid border-blue-700 outline-none placeholder:text-rose-700 bg-slate-50/0 ${
                                    !errors.fullname?.message
                                      ? null
                                      : "!border-red-500"
                                  }`}
                                  warn={errors.fullname?.message}
                                  {...register("fullname")}
                                />
                              </div>

                              <div className="flex gap-2">
                                <div className="mb-2 w-full mr-1">
                                  <InputFormAdmin
                                    type="date"
                                    title={"Ngày sinh"}
                                    placeholder="Ngày sinh"
                                    className={`p-2 rounded-md w-full border border-solid border-blue-700 outline-none placeholder:text-rose-700 bg-slate-50/0 ${
                                      !errors.birthday?.message
                                        ? null
                                        : "!border-red-500"
                                    }`}
                                    warn={errors.birthday?.message}
                                    {...register("birthday")}
                                  />
                                </div>

                                <div className="w-full mx-auto mb-2">
                                  <label
                                    htmlFor="gender"
                                    className={`text-xs text-gray-500 ${
                                      errors.birthday?.message &&
                                      "text-rose-700"
                                    }`}
                                  >
                                    Giới tính
                                  </label>
                                  <select
                                    id="gender"
                                    name="gender"
                                    className={`w-full p-2 border border-solid rounded-md border-blue-700  ${
                                      !watch("gender")
                                        ? "text-rose-700"
                                        : "text-black"
                                    } ${
                                      !errors.gender?.message
                                        ? null
                                        : "!border-red-500"
                                    }`}
                                    defaultValue={""}
                                    {...register("gender")}
                                  >
                                    <option
                                      value=""
                                      disabled
                                      hidden
                                      className=""
                                    >
                                      Giới tính
                                    </option>
                                    <option value="x">Nam</option>
                                    <option value="y">Nữ</option>
                                    <option value="z">Khác</option>
                                  </select>
                                  <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                                    {errors.gender?.message}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <UploadImages
                                  aspect={1 / 1}
                                  listType="picture-circle"
                                  quanlity={1}
                                  getData={(value) => {
                                    setValue("file", value?.[0]);
                                  }}
                                  onDelete={() => {
                                    const { file, avatar, ...args } = watch();
                                    setValue("file", undefined);
                                  }}
                                  defaultDataUrl={
                                    user?.avatar ? [user?.avatar] : []
                                  }
                                  placeholder="Upload picture products..."
                                  warn={errors?.file?.message}
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              className="px-4 py-1 rounded-md hover:opacity-75 bg-sky-500 text-white font-bold"
                            >
                              Cập nhật
                            </button>
                          </form>
                          <div className="mt-4 flex justify-end"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {showForm?.changePass ? (
            <div className="">
              <div className="text-xl border-b pb-2">Đổi mật khẩu.</div>
              <form onSubmit={handleSubmitPass(onSubmitPass)} className="">
                <div className="mt-4 mb-3">
                  <div className="w-4/5 mx-auto mb-1 relative">
                    <input
                      className={`p-2 rounded-md bg-transparent w-full border border-solid shadow outline-none placeholder:italic placeholder:text-black ${
                        errorsPass.prevPassword?.message
                          ? " border-red-500"
                          : null
                      }`}
                      type={dataFormPass?.showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu cũ"
                      {...registerPass("prevPassword")}
                    />
                    <p className="text-rose-700 indent-1 warn w-full mb-1">
                      {errorsPass.prevPassword?.message}
                    </p>
                    {dataFormPass?.showPassword ? (
                      <FaEye
                        className=" absolute right-2 top-3"
                        onClick={(e) =>
                          setDataFormPass((prev) => ({
                            ...prev,
                            showPassword: false,
                          }))
                        }
                      />
                    ) : (
                      <FaEyeSlash
                        className="fa-regular fa-eye-slash absolute right-2 top-3"
                        onClick={(e) =>
                          setDataFormPass((prev) => ({
                            ...prev,
                            showPassword: true,
                          }))
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="mt-4 mb-3">
                  <div className="w-4/5 mx-auto mb-1 relative">
                    <input
                      className={`p-2 rounded-md bg-transparent w-full border border-solid shadow outline-none placeholder:italic placeholder:text-black ${
                        errorsPass.newPassword?.message
                          ? " border-red-500"
                          : null
                      }`}
                      type={dataFormPass?.showPasswordNew ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      {...registerPass("newPassword")}
                    />
                    <p className="text-rose-700 indent-1 warn w-full mb-1">
                      {errorsPass.newPassword?.message}
                    </p>
                    {dataFormPass?.showPasswordNew ? (
                      <FaEye
                        className="fa-solid fa-eye absolute right-2 top-3"
                        onClick={(e) =>
                          setDataFormPass((prev) => ({
                            ...prev,
                            showPasswordNew: false,
                          }))
                        }
                      />
                    ) : (
                      <FaEyeSlash
                        className="fa-regular fa-eye-slash absolute right-2 top-3"
                        onClick={(e) =>
                          setDataFormPass((prev) => ({
                            ...prev,
                            showPasswordNew: true,
                          }))
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="mt-4 mb-3">
                  <div className="w-4/5 mx-auto mb-1 relative">
                    <input
                      className={`p-2 rounded-md bg-transparent w-full border border-solid shadow outline-none placeholder:italic placeholder:text-black ${
                        errorsPass.rePassword?.message
                          ? " border-red-500"
                          : null
                      }`}
                      type={"password"}
                      placeholder="Nhập lại mật khẩu"
                      {...registerPass("rePassword")}
                    />
                    <p className="text-rose-700 indent-1 warn w-full mb-1">
                      {errorsPass.rePassword?.message}
                    </p>
                  </div>
                </div>
                <div className="mt-4 mb-3">
                  <div className="w-4/5 mx-auto mb-1 relative">
                    <button
                      type="submit"
                      className="border border-solid px-4 py-1 rounded-md hover:opacity-75 flex items-end bg-green-500 text-white"
                    >
                      Đổi mật khẩu.
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </Responsive>
  );
}

export default useRequireAuth(SettingPage);
