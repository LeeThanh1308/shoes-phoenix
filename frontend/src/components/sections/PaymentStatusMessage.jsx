"use client";

import { FaCircleCheck } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { SyncOutlined } from "@ant-design/icons";
import { useEffect } from "react";

function PaymentStatusMessage({
  status,
  message,
  showForm,
  onClose = () => {},
}) {
  useEffect(() => {
    const timerID = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timerID);
    };
  }, [showForm]);
  return (
    showForm && (
      <div className=" fixed top-0 right-0 left-0 bottom-0 flex justify-center items-center backdrop-blur-lg">
        <div
          className={`w-96 h-64 relative border-2 shadow-md rounded-md flex flex-col justify-center items-center text-center ${
            status ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          <div className="flex justify-center mb-2">
            {status ? (
              <FaCircleCheck className="text-5xl" />
            ) : (
              <IoCloseCircle size={80} />
            )}
          </div>
          <div className="flex justify-center gap-2 items-center">
            {!status && <SyncOutlined size={12} spin />}
            <p className=" text-xl font-bold">{message}</p>
          </div>
        </div>
      </div>
    )
  );
}

export default PaymentStatusMessage;
