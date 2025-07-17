"use client";

import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { authSelector, handleLogoutState } from "@/services/redux/Slices/auth";
import {
  branchesSelector,
  handleGetThisBranches,
} from "@/services/redux/Slices/branches";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useLayoutEffect, useState } from "react";

import FallbackImage from "../ui/FallbackImage";
import Link from "next/link";
import { allowedRoles } from "@/services/utils/allowedRoles";
import { handleLogout } from "@/services/redux/Slices/auth/loginApi";
import { usePathname } from "next/navigation";

function AdminLayout({ children }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { thisBranches = [] } = useSelector(branchesSelector);
  const { user, role } = useSelector(authSelector);
  const [menuItems, setMenuItems] = useState([
    {
      name: "Trang chủ",
      path: "dashboard",
      roles: [allowedRoles.CEO],
    },
    {
      name: "Trang thu ngân",
      path: "cashier",
      roles: [allowedRoles.CEO, allowedRoles.MANAGE, allowedRoles.CEO],
    },
    {
      name: "Quản trị tài khoản",
      path: "users",
      roles: [allowedRoles.CEO],
    },
    {
      name: "Quản trị silders",
      path: "sliders",
      roles: [allowedRoles.CEO],
    },
    {
      name: "Quản trị danh mục",
      path: "categories",
      roles: [allowedRoles.CEO],
    },
    // {
    //   name: "Quản trị kho hàng",
    //   path: "warehouses",
    //   roles: [allowedRoles.CEO, allowedRoles.MANAGE],
    // },
    {
      name: "Quản trị bài viết",
      path: "blogs",
      roles: [allowedRoles.CEO],
    },
    {
      name: "Quản lý sản phẩm",
      path: "products",
      roles: [allowedRoles.CEO],
      subMenu: [
        {
          name: "Sản phẩm",
          path: "/",
        },
        {
          name: "Thương hiệu",
          path: "/brands",
        },
        {
          name: "Màu sắc",
          path: "/colors",
        },
        {
          name: "Đối tượng hướng tới",
          path: "/targets",
        },
      ],
    },
    {
      name: "Quản trị chi nhánh",
      path: "branches",
      roles: [allowedRoles.CEO, allowedRoles.MANAGE, allowedRoles.STAFF],
    },
  ]);

  const [showMenu, setShowMenu] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState([]);

  useEffect(() => {
    if (thisBranches?.length == 0) {
      dispatch(handleGetThisBranches());
    } else {
      setMenuItems((prev) => [
        ...prev.map((_) => {
          if (_.name == "Quản trị chi nhánh") {
            return {
              ..._,
              subMenu: [
                {
                  name: "Quản lý chi nhánh",
                  path: "/",
                },
                ...thisBranches?.map((_) => ({
                  name: _.name,
                  path: "/" + _.id,
                })),
              ],
            };
          } else {
            return _;
          }
        }),
      ]);
    }
  }, []);

  useEffect(() => {
    if (thisBranches?.length == 0) {
      const findItems = menuItems.some((_) => _.name == "Quản trị chi nhánh");
      if (!findItems) {
        setMenuItems((prev) => [
          ...prev,
          {
            name: "Quản trị chi nhánh",
            path: "branches",
            roles: [allowedRoles.CEO, allowedRoles.MANAGE, allowedRoles.STAFF],
          },
        ]);
      }
    } else {
      setMenuItems((prev) => [
        ...prev.map((_) => {
          if (_.name == "Quản trị chi nhánh") {
            return {
              ..._,
              subMenu: [
                {
                  name: "Quản lý chi nhánh",
                  path: "/",
                },
                ...thisBranches?.map((_) => ({
                  name: _.name,
                  path: "/" + _.id,
                })),
              ],
            };
          } else {
            return _;
          }
        }),
      ]);
    }
  }, [thisBranches]);

  return (
    <div className="w-full h-full relative" onClick={() => setShowMenu(false)}>
      {!showMenu ? (
        <div
          className="z-50 fixed left-0 top-6 w-2 h-20 rounded-r-md shadow shadow-black bg-white hover:bg-black/40"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(true);
          }}
        ></div>
      ) : (
        <div className="showheader fixed top-0 left-0 right-0 bottom-0 z-50">
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full h-14 bg-sky-500 flex justify-between items-center"
          >
            <div className="h-full w-1/6 flex items-center justify-center bg-sky-600">
              <h1>Trang quản trị</h1>
            </div>
            <div className="flex w-5/6 justify-between items-center">
              <div className="flex">
                <Link
                  activeclassname="active"
                  href="/"
                  className="w-full h-full"
                >
                  <div className="cursor-pointer h-14 w-32 flex justify-center items-center hover:bg-slate-50 hover:text-slate-950">
                    <div>Trang chủ</div>
                  </div>
                </Link>
              </div>
              <div className="flex items-center mr-4">
                <div
                  onClick={() => {
                    dispatch(handleLogout());
                    dispatch(handleLogoutState());
                  }}
                  className="cursor-pointer rounded-full flex justify-center items-center hover:opacity-50"
                >
                  <div className="mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      alt="Logout"
                      height="1em"
                      viewBox="0 0 512 512"
                    >
                      {/* Đặt dữ liệu SVG logout ở đây */}
                    </svg>
                  </div>
                  <div>Đăng xuất</div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="w-1/6 menu z-50 text-black shadow-sm shadow-gray-400 h-full backdrop-blur-xl"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="py-2 px-2 flex items-center">
              <FallbackImage
                className="w-16 h-16 rounded-full mr-3"
                src={`${process.env.NEXT_PUBLIC_DOMAIN_API}${process.env.NEXT_PUBLIC_PARAM_GET_FILE_API}${user?.avatar}`}
                width={64}
                height={64}
              />
              <div>
                <div>
                  <h2>{user?.fullname}</h2>
                </div>
                <div className="flex items-center">{role}</div>
              </div>
            </div>
            <div className="text-base px-2 py-2 font-bold text-slate-400">
              Quản trị
            </div>
            <ul>
              {menuItems.map((_, index) => {
                if (Array.isArray(_?.roles) && _?.roles.includes(role)) {
                  return (
                    <li key={index}>
                      <div
                        onClick={() => {
                          if (
                            Array.isArray(_?.subMenu) &&
                            _?.subMenu.length > 0
                          ) {
                            if (activeSubMenu.includes(index)) {
                              setActiveSubMenu((prev) => {
                                const data = prev.filter(
                                  (item) => item != index
                                );
                                return data;
                              });
                            } else {
                              setActiveSubMenu((prev) => [...prev, index]);
                            }
                          }
                        }}
                        className={`flex justify-between items-center hover:font-bold px-4 ${
                          pathname
                            .split("/")
                            .includes(_?.path?.replace("/", "")) &&
                          ` font-bold text-rose-700 text-2xl`
                        }`}
                      >
                        {Array.isArray(_?.subMenu) && _?.subMenu.length > 0 ? (
                          <p
                            className={`w-full flex py-2 cursor-pointer hover: hover:text-rose-500 hover:font-bold hover:underline ${
                              pathname
                                .split("/")
                                .includes(_?.path?.replace("/", "")) &&
                              ` font-bold text-rose-700 text-2xl`
                            }`}
                          >
                            {_.name}
                          </p>
                        ) : (
                          <Link
                            href={"/admin-panel/" + _?.path}
                            className={`w-full flex py-2 cursor-pointer hover:font-bold hover:text-rose-500 hover:underline`}
                          >
                            {_.name}
                          </Link>
                        )}
                        {Array.isArray(_?.subMenu) &&
                          _?.subMenu.length > 0 &&
                          (activeSubMenu.includes(index) ? (
                            <FaAngleUp />
                          ) : (
                            <FaAngleDown />
                          ))}
                      </div>
                      {activeSubMenu.includes(index) && (
                        <ul className="menu">
                          {Array.isArray(_.subMenu) &&
                            _.subMenu.map((subIt, subIndex) => (
                              <li
                                key={subIndex}
                                className="hover:font-bold hover:text-rose-500 hover:underline"
                              >
                                <Link
                                  href={"/admin-panel/" + _?.path + subIt?.path}
                                  className={`w-full pl-16 flex py-2 cursor-pointer ${
                                    subIt?.path === pathname &&
                                    `active  font-bold text-rose-700 text-2xl`
                                  }`}
                                >
                                  {subIt?.name}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      )}
                    </li>
                  );
                } else if (!_?.roles) {
                  <li key={index}>
                    <div
                      onClick={() => {
                        if (
                          Array.isArray(_?.subMenu) &&
                          _?.subMenu.length > 0
                        ) {
                          if (activeSubMenu.includes(index)) {
                            setActiveSubMenu((prev) => {
                              const data = prev.filter((item) => item != index);
                              return data;
                            });
                          } else {
                            setActiveSubMenu((prev) => [...prev, index]);
                          }
                        }
                      }}
                      className={`flex justify-between items-center px-4 ${
                        pathname
                          ?.split("/")
                          .includes(_?.path.replace("/", "")) &&
                        ` font-bold text-rose-700 text-2xl`
                      }`}
                    >
                      {Array.isArray(_?.subMenu) && _?.subMenu.length > 0 ? (
                        <p
                          className={`w-full flex py-2 cursor-pointer hover: hover:text-rose-500 hover:underline ${
                            pathname
                              .split("/")
                              .includes(_.path.replace("/", "")) &&
                            ` font-bold text-rose-700 text-2xl`
                          }`}
                        >
                          {_.name}
                        </p>
                      ) : (
                        <Link
                          href={"/admin-panel/" + _?.path}
                          className={`w-full flex py-2 cursor-pointer hover: hover:text-rose-500 hover:underline`}
                        >
                          {_?.name}
                        </Link>
                      )}
                      {Array.isArray(_?.subMenu) &&
                        _?.subMenu.length > 0 &&
                        (activeSubMenu.includes(index) ? (
                          <FaAngleUp />
                        ) : (
                          <FaAngleDown />
                        ))}
                    </div>
                    {activeSubMenu.includes(index) && (
                      <ul className="menu">
                        {Array.isArray(_?.subMenu) &&
                          _.subMenu.map((subIt, subIndex) => (
                            <li
                              key={subIndex}
                              className="hover: hover:text-rose-500 hover:underline"
                            >
                              <Link
                                href={"/admin-panel/" + _?.path + subIt?.path}
                                className={`w-full pl-16 flex py-2 cursor-pointer ${
                                  subIt?.path === pathname &&
                                  `active  font-bold text-rose-700 text-2xl`
                                }`}
                              >
                                {subIt?.name}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>;
                }
              })}
            </ul>
          </div>
        </div>
      )}
      <div
        id="bodyManage"
        className="flex justify-between w-full h-auto relative"
      >
        <div className={`min-h-screen px-6 pt-6 w-full`}>{children}</div>
      </div>
    </div>
  );
}

export default AdminLayout;
