"use client";

import { useEffect, useState } from "react";

import { BsBoxSeam } from "react-icons/bs";
import { FaRegUser } from "react-icons/fa";
import GuestRequest from "@/services/axios/GuestRequest";
import { IoIosGitBranch } from "react-icons/io";
import Link from "next/link";
import { MdOutlineCategory } from "react-icons/md";
import RevenueStatisticCollums from "@/components/sections/RevenueStatisticCollums";
import RevenueStatistics from "@/components/sections/RevenueStatistics";
import { allowedRoles } from "@/services/utils/allowedRoles";
import { withRoleGuard } from "@/hooks/withRoleGuard";

function Page() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const [categories, products, branches, customers] = await Promise.all([
        GuestRequest.get("/categories/count").then((res) => res.data),
        GuestRequest.get("/products/count").then((res) => res.data),
        GuestRequest.get("/branches/count").then((res) => res.data),
        GuestRequest.get("/accounts/count").then((res) => res.data),
      ]);
      setData([
        {
          icon: <MdOutlineCategory size={32} />,
          bg: "bg-amber-500",
          color: "text-amber-500",
          title: "Categories",
          href: "categories",
          total: categories ?? 0,
        },
        {
          icon: <BsBoxSeam size={32} />,
          bg: "bg-blue-500",
          color: "text-blue-500",
          title: "Products",
          href: "products",
          total: products ?? 0,
        },
        {
          icon: <IoIosGitBranch size={32} />,
          bg: "bg-rose-500",
          color: "text-rose-500",
          title: "Chi nhánh",
          href: "branches",
          total: branches ?? 0,
        },
        {
          icon: <FaRegUser size={32} />,
          bg: "bg-green-500",
          color: "text-green-500",
          title: "Customers",
          href: "users",
          total: customers ?? 0,
        },
      ]);
    };
    fetchData();
  }, []);
  return (
    <div className="pb-8">
      <div className=" grid grid-cols-4 gap-3">
        {data.map((_, i) => (
          <Link key={i} href={_.href}>
            <div className="p-3 w-full shadow-sm shadow-slate-400 rounded-md flex gap-3 items-center  hover:shadow-xl">
              <div
                className={`p-2 rounded-full w-fit flex justify-center items-center shrink-0 text-white ${_.bg}`}
              >
                {_.icon}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${_.color}`}>{_?.total}</h1>
                <span className="font-normal text-md text-gray-500">
                  {_.title}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-3 w-auto flex justify-between gap-3">
        <div className=" flex-[0.5] w-auto shadow-sm shadow-gray-400 rounded-lg">
          <RevenueStatistics />
        </div>
        <div className=" flex-[0.5] w-auto shadow-sm shadow-gray-400 rounded-lg">
          <RevenueStatisticCollums />
        </div>
      </div>
    </div>
  );
}

export default withRoleGuard(Page, [allowedRoles.CEO]);
