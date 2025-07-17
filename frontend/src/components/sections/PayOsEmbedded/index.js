"use client";

import React, { useEffect, useState } from "react";

import { Button } from "antd";
import { FaCircleCheck } from "react-icons/fa6";
import Toastify from "../Toastify";
import { usePayOS } from "@payos/payos-checkout";

export const RETURN_URL =
  typeof window != "undefined" ? window.location.href : "";
export const CANCEL_URL =
  typeof window != "undefined" ? window.location.href : "";

export default function PayOsEmbedded({ checkoutUrl, onExitPayOS = () => {} }) {
  const [status, setStatus] = useState({
    isShow: false,
    status: false,
  });
  const [payOSConfig, setPayOSConfig] = useState({
    RETURN_URL,
    ELEMENT_ID: "config_root",
    CHECKOUT_URL: checkoutUrl,
    onExit: (eventData) => {
      console.log("onExit");
      console.log(eventData);
      onExitPayOS(eventData.orderCode);
    },
    onSuccess: (eventData) => {
      console.log("onSuccess");
      console.log(eventData);
      onExitPayOS(eventData.orderCode);
      Toastify(1, "Thanh toán thành công", { autoClose: 5000 });
      //   window.location.href = `${RETURN_URL}?orderCode=${eventData.orderCode}`;
    },
    onCancel: (eventData) => {
      console.log("onCancel");
      console.log(eventData);
      onExitPayOS(eventData.orderCode);
      //   window.location.href = `${CANCEL_URL}?orderCode=${eventData.orderCode}`;
    },
    onError: (eventData) => {
      console.log("onError");
      console.log(eventData);
    },
  });
  const { open, exit } = usePayOS(payOSConfig);
  useEffect(() => {
    setPayOSConfig((prev) => ({
      ...prev,
      CHECKOUT_URL: checkoutUrl,
    }));
  }, [checkoutUrl]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (payOSConfig.CHECKOUT_URL != null) {
        window.document.body.style.overflowY = "hidden";
        open();
      } else {
        window.document.body.style.overflowY = "auto";
        exit();
      }
      return () => {
        window.document.body.style.overflowY = "auto";
        exit();
      };
    }
  }, [payOSConfig]);
  return (
    <div
      className={`${
        checkoutUrl
          ? "fixed top-0 left-0 w-full h-full z-50 bg-white"
          : "hidden"
      }`}
    >
      <div id="config_root"></div>
    </div>
  );
}
