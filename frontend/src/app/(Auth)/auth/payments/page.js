"use client";

import {
  authSelector,
  handleChangeOrderData,
} from "@/services/redux/Slices/auth";
import { formatCurrencyVND, generateUrlImage } from "@/services/utils";
import {
  paymentStatusKey,
  paymentStatusValue,
} from "@/services/utils/statusCode";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import BankPayment from "@/components/sections/BankPayment/page";
import Image from "next/image";
import IsArray from "@/components/ui/IsArray";
import PaymentStatusMessage from "@/components/sections/PaymentStatusMessage";
import { initSocket } from "@/services/socket";

function Page() {
  const dispatch = useDispatch();
  const { orderData } = useSelector(authSelector);
  const [transactionStatus, setTransactionStatus] = useState({});
  useEffect(() => {
    let socket;
    (async () => {
      socket = await initSocket();
      socket.on("connect", () => {
        console.log("connect data.....");
      });

      socket.emit("joinCreateOrder", {}, (message) => {
        console.log(message);
      });

      socket.on("newOrder", (data) => {
        dispatch(handleChangeOrderData(data));
      });

      socket.on("transactionStatus", (data) => {
        setTransactionStatus({
          ...data,
          isShowForm: data?.status == paymentStatusValue?.PAID,
        });
      });
    })();

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("newOrder");
        socket.off("transactionStatus");
        socket.disconnect();
      }
    };
  }, []);
  console.log(transactionStatus);
  return (
    <div className="flex justify-center items-center h-screen font-bold text-xl">
      {orderData?.bin && (
        <div className="w-2/3 bg-white rounded-xl shadow-sm flex justify-between tl:w-full lt:w-full ">
          <div className=" flex-1">
            <div className="overflow-x-auto bg-white shadow-sm">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 text-center text-xs font-bold text-gray-600 uppercase">
                      #
                    </th>
                    <th className="pl-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Tên sản phẩm
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                      Đơn giá
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                      Số lượng
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {Array.isArray(orderData?.carts?.items) &&
                    orderData?.carts.items.map((item, index) => (
                      <tr key={item?.id} className="hover:bg-gray-50">
                        <td className="text-center">{index + 1}</td>
                        <td className="pl-6 py-4 font-medium text-gray-900 flex gap-2 items-center">
                          <Image
                            className="w-14 h-14 rounded mr-2 text-xs"
                            src={generateUrlImage(item?.image)}
                            alt="image"
                            width={56}
                            height={56}
                            objectFit="cover"
                          />
                          <div className="">
                            <p>{item?.name}</p>
                            <p>
                              Size: {item?.size?.type} - Color:{" "}
                              {item?.color?.name}
                            </p>
                          </div>
                        </td>
                        <td className="text-center">
                          {formatCurrencyVND(
                            item?.sellingPrice * (1 - item?.discount / 100)
                          )}
                        </td>
                        <td className="text-center">{item?.quantity}</td>
                        <td className="text-center">
                          {formatCurrencyVND(
                            item?.sellingPrice *
                              item?.quantity *
                              (1 - item?.discount / 100)
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className=" shrink-0">
            <BankPayment status={transactionStatus?.status} {...orderData} />
          </div>
        </div>
      )}

      <PaymentStatusMessage
        showForm={transactionStatus?.isShowForm}
        status={transactionStatus?.status == paymentStatusValue.PAID}
        message={paymentStatusKey?.[transactionStatus?.status]}
        onClose={() => {
          setTransactionStatus((prev) => ({
            ...prev,
            isShowForm: false,
          }));
        }}
      />
    </div>
  );
}

export default Page;
