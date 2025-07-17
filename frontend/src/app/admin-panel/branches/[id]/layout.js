"use client";

import React, { useEffect, useState } from "react";
import {
  branchesSelector,
  handleGetBranch,
} from "@/services/redux/Slices/branches";
import { useDispatch, useSelector } from "react-redux";
import { useParams, usePathname } from "next/navigation";

import Link from "next/link";
import { allowedRoles } from "@/services/utils/allowedRoles";
import { authSelector } from "@/services/redux/Slices/auth";
import { handleGetStores } from "@/services/redux/Slices/stores";

function PageLayout({ children }) {
  const params = useParams();
  const { user, role } = useSelector(authSelector);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [data, setData] = useState([
    {
      title: "Quản trị kho hàng",
      href: `/admin-panel/branches/${params.id}/stores`,
      roles: [allowedRoles.CEO, allowedRoles.MANAGE],
      showMenu: true,
    },
    {
      title: "Quản trị nhân sự",
      href: `/admin-panel/branches/${params.id}/employees`,
      roles: [allowedRoles.CEO, allowedRoles.MANAGE],
      showMenu: true,
    },
    {
      title: "Đơn đặt hàng",
      href: `/admin-panel/branches/${params.id}/orders`,
      roles: [allowedRoles.CEO, allowedRoles.MANAGE, allowedRoles.STAFF],
      showMenu: true,
    },
  ]);
  const { branch } = useSelector(branchesSelector);
  useEffect(() => {
    const timerID = setTimeout(() => {
      dispatch(handleGetStores({ branchID: params.id }));
      dispatch(handleGetBranch(params?.id));
    }, 200);
    return () => clearTimeout(timerID);
  }, [params?.id]);
  console.log(pathname);
  return (
    <div className="w-full h-full z-10 text-black relative ">
      <div className="p-6 z-0">
        <div className="flex justify-between items-center">
          <div className="mb-4 font-bold text-5xl text-rose-700">
            <span>Quản trị cơ sở ({branch?.name})</span>
          </div>
          <div className=""></div>
        </div>
        <div>
          <div className=" grid grid-cols-6 gap-3">
            {data.map((_, i) => {
              if (_.roles.includes(role)) {
                return (
                  <Link key={i} href={_.href}>
                    <div
                      className={`p-3 w-full shadow-sm shadow-slate-400 rounded-md flex gap-3 items-center
                      ${
                        pathname == _.href
                          ? `!font-bold text-rose-700 cursor-no-drop`
                          : `hover:shadow-xl cursor-pointer font-normal text-md text-gray-500`
                      }
                      `}
                    >
                      <div>
                        <span>{_.title}</span>
                      </div>
                    </div>
                  </Link>
                );
              } else {
                return;
              }
            })}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
export default PageLayout;
