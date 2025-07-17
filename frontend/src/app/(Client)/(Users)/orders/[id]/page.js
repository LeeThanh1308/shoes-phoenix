"use client";

import {
  formatCurrencyVND,
  generateUrlImage,
  timeDifference,
} from "@/services/utils";
import { useEffect, useState } from "react";

import { Breadcrumb } from "antd";
import Image from "next/image";
import IsArray from "@/components/ui/IsArray";
import Link from "next/link";
import Responsive from "@/components/layout/Responsive";
import TimeLine from "@/components/sections/TimeLine";
import { handleGetDetailOrder } from "@/services/redux/Slices/auth/paymentApi";
import { useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import useRequireAuth from "@/hooks/useRequireAuth";

function Page() {
  const [data, setData] = useState({});
  const { id } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    // Fetch order details using the id
    (async () => {
      if (id) {
        const data = await dispatch(handleGetDetailOrder(id)).unwrap();
        setData(data);
      }
    })();
  }, [id]);
  return (
    <div className="">
      <Responsive>
        <div className="pb-3 pt-2">
          <Breadcrumb
            items={[
              {
                title: <Link href={"/"}>Trang chủ</Link>,
              },
              {
                title: <Link href={"/orders"}>Danh sách đơn hàng</Link>,
              },
              {
                title: "Chi tiết đơn hàng",
              },
            ]}
          />
        </div>

        <div class="relative bg-white border border-gray-300 rounded-sm">
          <div class="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#6fa6d6,#6fa6d6_33px,transparent_0,transparent_41px,#f18d9b_0,#f18d9b_74px,transparent_0,transparent_82px)]"></div>

          <div class="absolute top-0 right-0 w-1 h-full bg-[repeating-linear-gradient(45deg,#6fa6d6,#6fa6d6_33px,transparent_0,transparent_41px,#f18d9b_0,#f18d9b_74px,transparent_0,transparent_82px)]"></div>

          <div class="absolute bottom-0 left-0 w-1 h-full bg-[repeating-linear-gradient(45deg,#6fa6d6,#6fa6d6_33px,transparent_0,transparent_41px,#f18d9b_0,#f18d9b_74px,transparent_0,transparent_82px)]"></div>

          <div class="absolute bottom-0 right-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#6fa6d6,#6fa6d6_33px,transparent_0,transparent_41px,#f18d9b_0,#f18d9b_74px,transparent_0,transparent_82px)]"></div>

          <div class="relative z-10 p-5">
            <div className="flex justify-between items-center">
              <h1 className=" font-bold text-3xl">
                Chi tiết đơn hàng #{data?.id} ({data?.paymentMethod})
              </h1>
              <span className="">
                {timeDifference(data?.createdAt)} -{" "}
                {new Date(data?.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            {data && (
              <div className="w-full mt-3">
                <div className=" relative mb-20">
                  <TimeLine data={data} />
                </div>
                <div>
                  <div class="relative overflow-x-auto">
                    <table class="w-full text-sm text-left rtl:text-right text-black font-bold">
                      <thead class="text-sm uppercase">
                        <tr className=" text-lg">
                          <th scope="col" class="">
                            STT
                          </th>
                          <th scope="col" class="px-6 py-3">
                            Tên sản phẩm
                          </th>
                          <th scope="col" class="px-6 py-3">
                            Đơn giá
                          </th>
                          <th scope="col" class="px-6 py-3">
                            Size / Số lượng
                          </th>
                          <th scope="col" class="px-6 py-3">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <IsArray data={data.tempOrders}>
                          {data.tempOrders?.map((_, i) => (
                            <tr class="" key={i}>
                              <th>{i + 1}</th>
                              <th
                                scope="row"
                                class="px-6 py-4 whitespace-nowrap text-shadow"
                              >
                                <div className="flex gap-2 items-center">
                                  <Image
                                    width={50}
                                    height={50}
                                    alt={_?.name}
                                    src={generateUrlImage(
                                      _?.product?.images?.[0]?.src
                                    )}
                                    className=" object-cover rounded-sm"
                                  />
                                  <div className="">
                                    <p className="">{_?.name}</p>
                                    <span style={{ color: _?.color?.hexCode }}>
                                      {_?.color?.name}
                                    </span>
                                  </div>
                                </div>
                              </th>
                              <td class="px-6 py-4">
                                {" "}
                                {formatCurrencyVND(
                                  _?.totalAmount / _?.quantity
                                )}
                              </td>
                              <td class="px-6 py-4">
                                {_?.size?.type}x{_?.quantity}
                              </td>
                              <td class="px-6 py-4">
                                {formatCurrencyVND(_?.totalAmount)}
                              </td>
                            </tr>
                          ))}
                        </IsArray>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="border-t border-dashed border-rose-500"></div>
                <div className="flex items-center justify-end text-xl">
                  <div className="">Tổng:</div>
                  <div className="ml-4 text-rose-500 font-bold">
                    {formatCurrencyVND(data.price)}
                  </div>
                </div>

                <div className="">
                  <div className="text-xl">
                    <span className="font-bold">Người nhận:</span>{" "}
                    <span className="font-medium">{data?.receiver}</span>
                  </div>
                  <div className="text-xl">
                    <span className="font-bold">Số điện thoại:</span>{" "}
                    <span className="font-medium">{data?.phone}</span>
                  </div>
                  <div className="text-xl">
                    <span className="font-bold">Địa chỉ:</span>{" "}
                    <span className="font-medium">{data?.address}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Responsive>
    </div>
  );
}

export default useRequireAuth(Page);
