"use client";

import { FaCartPlus, FaSearch } from "react-icons/fa";
import { formatCurrencyVND, generateUrlImage } from "../../services/utils";
import { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "antd";
import { FaCircleCheck } from "react-icons/fa6";
import FallbackImage from "../ui/FallbackImage";
import Image from "next/image";
import Link from "next/link";
import MarqueeBrands from "../sections/MarqueeBrands";
import Responsive from "./Responsive";
import { authSelector } from "@/services/redux/Slices/auth";
import { bootstrapSelector } from "@/services/redux/Slices/bootstrap";
import { cartsSelector } from "@/services/redux/Slices/carts";
import { handleLogout } from "@/services/redux/Slices/auth/loginApi";
import { redirect } from "next/navigation";

function Header() {
  const {
    brands = [],
    categories = [],
    targetGroups = [],
  } = useSelector(bootstrapSelector);
  const { carts } = useSelector(cartsSelector);
  const dispatch = useDispatch();
  const { user, isAuthenticated, role } = useSelector(authSelector);
  const [valueSearch, setValueSearch] = useState();
  return (
    <div className="relative">
      <Responsive
        className={" flex justify-between items-center py-0.5 px-24 relative"}
      >
        <div className="relative flex justify-center z-10">
          <Link href={"/"}>
            <Image
              src="/images/logo.png"
              style={{ objectFit: "contain", width: "auto", height: "auto" }}
              priority
              width={30}
              height={10}
              alt="logo"
              className="image-shadow"
            />
          </Link>
        </div>

        <div className=" absolute top-0 right-0 left-0 bottom-0 overflow-hidden z-0 font-dancing-script">
          <MarqueeBrands />
        </div>

        <div className=" text-lg font-bold font-dancing-script text-rose-500 flex justify-center gap-2 z-10 image-shadow">
          {!isAuthenticated && (
            <>
              <Link
                className=" hover:text-rose-700 hover:underline"
                href={"/register"}
              >
                Register
              </Link>
              <Link
                className=" hover:text-rose-700 hover:underline"
                href={"/login"}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </Responsive>
      <div className="w-full h-24 shadow-sm shadow-gray-300 z-50">
        <Responsive className={"flex justify-between items-center h-full pr-3"}>
          <div className="relative">
            <Link href={"/"}>
              <Image
                src="/images/logo.png"
                priority
                style={{ objectFit: "contain", width: "auto", height: "auto" }}
                width={80}
                height={60}
                alt="logo"
              />
            </Link>
          </div>

          <div className=" mb:hidden tl:block">
            <ul className=" list-none flex-center flex-wrap gap-8 font-bold text-lg font-dancing-script text-rose-700">
              <li className=" hover:underline cursor-pointer relative group">
                <h1>Giày</h1>
                <div className=" absolute top-full -left-0 min-w-70 backdrop-blur-xl rounded-md z-50 overflow-hidden p-2 text-rose-700 hidden group-hover:block">
                  {categories.map((_) => (
                    <Link key={_.id} href={`/search?category=${_.name}`}>
                      <div className="p-2 rounded-md hover:bg-black/30 hover:text-white hover:font-dancing-script">
                        <p className="text-shadow">{_.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </li>
              {targetGroups.map((_) => (
                <li key={_.id} className=" hover:underline cursor-pointer">
                  <Link href={`/search?object=${_.name}`}>{_.name}</Link>
                </li>
              ))}
              <li className=" hover:underline cursor-pointer relative group">
                <h1>Thương hiệu</h1>
                <div className=" absolute top-full -left-0 min-w-70 backdrop-blur-xl rounded-md z-50 overflow-hidden p-2 text-rose-700 hidden group-hover:block">
                  {brands.map((_) => (
                    <Link key={_.id} href={`/search?brand=${_.name}`}>
                      <div className="p-2 rounded-md hover:bg-black/30 hover:text-white hover:font-dancing-script flex justify-between items-center gap-4">
                        <p className="text-shadow">{_.name}</p>
                        <Image
                          width={40}
                          height={20}
                          style={{
                            objectFit: "contain",
                            width: "auto",
                            height: "auto",
                          }}
                          className="image-shadow"
                          src={`${process.env.NEXT_PUBLIC_DOMAIN_API}${process.env.NEXT_PUBLIC_PARAM_GET_FILE_API}${_.logo}`}
                          alt="logo"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </li>

              <li className=" hover:underline cursor-pointer relative group">
                <Link href={"/blogs"}>
                  <h1>Blog</h1>
                </Link>
              </li>
            </ul>
          </div>
          <div className=" flex-center gap-5">
            <div className=" p-1 shadow-blue-700 rounded-full cursor-pointer relative group">
              <FaSearch className=" text-rose-500" size={24} />
              <div className=" absolute right-0 top-0 bottom-0 w-96 hidden group-hover:block m-auto">
                <div className=" relative flex items-center text-shadow backdrop-blur-2xl rounded-lg overflow-hidden">
                  <input
                    className="p-2 w-full rounded-lg"
                    placeholder="Nhập từ khóa tìm kiếm."
                    value={valueSearch}
                    onChange={(e) => setValueSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        redirect(`/search?s=${valueSearch}`);
                      }
                    }}
                    type="text"
                  />
                  {valueSearch && (
                    <Link href={`search?s=${valueSearch}`}>
                      <FaSearch
                        className=" text-rose-500 absolute top-0 bottom-0 right-2 m-auto"
                        size={18}
                      />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className=" p-1 hover:shadow-sm shadow-blue-700 rounded-full cursor-pointer group">
              <div className=" relative z-50">
                <FaCartPlus
                  className=" z-0 text-rose-500"
                  size={24}
                ></FaCartPlus>
                <span className="z-10 absolute -right-2.5 -top-2.5 w-5 h-5 bg-sky-50/60 font-bold text-sm rounded-full shadow-sm shadow-blue-500 text-rose-500 flex-center">
                  {carts?.items?.length ?? 0}
                </span>
                <div className=" absolute right-0 top-full min-w-[500px] hidden group-hover:block">
                  <div className=" flex flex-col">
                    <div className="self-end w-0 h-0 mr-1 border-l-6 border-r-6 border-b-8 border-transparent border-b-rose-700"></div>
                    <div className=" w-full shadow shadow-rose-700 p-3 rounded-sm bg-white">
                      {!carts?.items?.length ? (
                        <p className="text-center font-bold text-blue-700">
                          Giỏ hàng trống!
                        </p>
                      ) : (
                        <div className="">
                          <div className="p-2 flex justify-between">
                            <div className="text-2xl font-bold">Giỏ hàng</div>
                          </div>
                          <div className="w-full h-full">
                            <div className="text-sm text-gray-500 text-center flex">
                              <div className="w-3/5 text-start">SẢN PHẨM</div>
                              <div className="w-1/5 text-center">Đơn giá</div>
                              <div className="w-1/5 text-end">SỐ TIỀN</div>
                            </div>
                            {/* Content */}
                            {carts?.items?.map((_, index) => (
                              <div
                                className="text-sm text-gray-500 flex border-t py-2 items-center"
                                key={index}
                              >
                                <div
                                  className="w-3/5 flex items-center"
                                  key={index}
                                >
                                  <div className=" relative">
                                    <Image
                                      className="w-14 h-14 rounded mr-2 text-xs"
                                      src={generateUrlImage(_?.image)}
                                      alt="image"
                                      width={56}
                                      height={56}
                                      style={{
                                        objectFit: "contain",
                                        width: "auto",
                                        height: "auto",
                                      }}
                                    />
                                    {_?.discount > 0 && (
                                      <div className=" absolute p-0.5 top-0 left-0 font-bold text-shadow text-white">
                                        <span>{_?.discount}%</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="truncate w-3/5 ...">
                                    <div className="">{_.name}</div>
                                    <div>
                                      Size: {_.size.type}
                                      <span className="font-bold text-gray-900 text-md">
                                        x{_.quantity} {_?.color?.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="w-1/5 font-bold text-center text-rose-500">
                                  {_?.discount > 0 && (
                                    <p
                                      className={`${
                                        _?.discount > 0 && "line-through"
                                      }`}
                                    >
                                      {formatCurrencyVND(_.sellingPrice)}
                                    </p>
                                  )}
                                  <p>
                                    {formatCurrencyVND(
                                      _.sellingPrice *
                                        _.quantity *
                                        (1 - _.discount / 100)
                                    )}
                                  </p>
                                </div>

                                <div className="w-1/5 text-end font-bold text-green-500">
                                  {formatCurrencyVND(
                                    _.sellingPrice *
                                      _.quantity *
                                      (1 - _.discount / 100)
                                  )}
                                </div>
                              </div>
                            ))}
                            {/* Action */}
                            <Link href="/carts" className="">
                              <Button color="cyan" variant="solid">
                                Xem chi tiết
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isAuthenticated && user && (
              <div className="hover:shadow-sm shadow-blue-700 rounded-full cursor-pointer group">
                <div className=" relative z-50 group">
                  <div className=" w-12 h-12 rounded-full overflow-hidden relative">
                    <FallbackImage
                      src={user?.avatar ? generateUrlImage(user?.avatar) : ""}
                      fill
                      sizes="100vw"
                      alt="logo"
                    />
                  </div>
                  <div className="absolute top-full right-0 w-96 hidden group-hover:block pt-4">
                    <div className="shadow-sm shadow-slate-400 bg-white text-rose-500 font-dancing-script font-bold backdrop-blur-xl rounded-md z-20 p-4">
                      <div className="w-full h-24 rounded-md shadow flex items-center mb-3 image-shadow">
                        <div className="w-12 h-12 rounded-full mr-3 ml-3 relative overflow-hidden">
                          <FallbackImage
                            src={
                              user?.avatar ? generateUrlImage(user?.avatar) : ""
                            }
                            fill
                            sizes="100vw"
                            alt="logo"
                          />
                        </div>
                        <div className=" font-dancing-script">
                          <div className=" font-bold text-lg flex items-center gap-1 text-shadow">
                            <span>{user?.fullname}</span>
                            <FaCircleCheck className="text-sky-500 text-xs" />
                          </div>
                          <div className="text-sm flex items-center text-shadow">
                            {role}
                          </div>
                        </div>
                      </div>
                      {role == "CEO" || role == "MANAGE" || role == "STAFF" ? (
                        <Link
                          href={
                            role == "CEO"
                              ? "/admin-panel/dashboard"
                              : "/admin-panel/cashier"
                          }
                        >
                          <div className="w-full h-12 pl-4 flex items-center hover:bg-black rounded-md hover:text-white cursor-pointer hover:font-bold border mb-1 text-shadow">
                            Trang quản trị
                          </div>
                        </Link>
                      ) : null}
                      <Link href="/orders">
                        <div className="w-full h-12 pl-4 flex items-center hover:bg-black rounded-md hover:text-white cursor-pointer hover:font-bold border mb-1 text-shadow">
                          Đơn hàng của bạn
                        </div>
                      </Link>
                      <Link href="/posts">
                        <div className="w-full h-12 pl-4 flex items-center hover:bg-black rounded-md hover:text-white cursor-pointer hover:font-bold border mb-1 text-shadow">
                          Bài viết của tôi
                        </div>
                      </Link>
                      <Link href="/carts">
                        <div className="w-full h-12 pl-4 flex items-center hover:bg-black rounded-md hover:text-white cursor-pointer hover:font-bold border mb-1 text-shadow">
                          Giỏ hàng
                        </div>
                      </Link>
                      <Link href="/settings">
                        <div className="w-full h-12 pl-4 flex items-center hover:bg-black rounded-md hover:text-white cursor-pointer hover:font-bold border mb-1 text-shadow">
                          Cài đặt
                        </div>
                      </Link>

                      <div
                        onClick={() => dispatch(handleLogout())}
                        className="w-full h-12 pl-4 flex items-center hover:bg-black rounded-md hover:text-white cursor-pointer hover:font-bold border mb-1 text-shadow"
                      >
                        <p>Đăng xuất</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Responsive>
      </div>
    </div>
  );
}

export default memo(Header);
