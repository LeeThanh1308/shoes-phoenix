"use client";

import { PoweroffOutlined, SyncOutlined } from "@ant-design/icons";
import {
  paymentStatusKey,
  paymentStatusValue,
} from "@/services/utils/statusCode";
import { useEffect, useState } from "react";

import { Button } from "antd";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import { formatCurrencyVND } from "@/services/utils";

function BankPayment({ status, ...props }) {
  const [bank, setBank] = useState({});
  useEffect(() => {
    async function getListBank() {
      try {
        const res = await axios(`${process.env.NEXT_PUBLIC_LISTS_BANK_URL}`);
        if (Array.isArray(res.data.data)) {
          const bank = res.data.data.filter((bank) => bank.bin === props.bin);
          setBank(bank[0]);
        }
      } catch (error) {
        return error.response.data;
      }
    }
    if (props?.bin) {
      getListBank();
    }
  }, [props?.bin]);
  return (
    <div className="shadow-lg p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        Thanh toán qua ngân hàng
      </h2>

      <div className="flex flex-col md:flex-row gap-8 justify-center">
        {/* QR Code */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-fit p-3 shadow-sm shadow-black rounded-lg">
            <QRCodeSVG value={props.qrCode} size={256} />
          </div>
        </div>

        {/* Thông tin giao dịch */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src={bank?.logo}
              alt="logo"
              width={56}
              height={56}
              className=" object-cover w-auto h-auto"
            />
            <div>
              <p className="text-sm text-gray-600">Ngân hàng</p>
              <p className="font-bold text-gray-800">
                {bank?.name} {bank?.shortName ?? bank?.short_name}
              </p>
            </div>
          </div>

          {[
            { label: "Chủ tài khoản", value: props.accountName },
            { label: "Số tài khoản", value: props.accountNumber },
            {
              label: "Số tiền",
              value: `${formatCurrencyVND(props.amount)}`,
            },
            { label: "Nội dung", value: props.description },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{item.label}:</p>
                <p className="font-semibold text-gray-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="">
        <div className="flex justify-center gap-2 items-center">
          {status != paymentStatusValue.PAID && <SyncOutlined size={12} spin />}
          <p className=" text-xl font-bold">{paymentStatusKey?.[status]}</p>
        </div>

        <p className="text-sm text-center text-gray-600">
          ⚠️ Vui lòng nhập chính xác{" "}
          <strong className="text-purple-600">{props.description}</strong> để
          được xử lý tự động.
        </p>
      </div>
    </div>
  );
}

export default BankPayment;
