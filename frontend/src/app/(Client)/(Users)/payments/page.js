"use client";

import { Breadcrumb, Button } from "antd";
import { FaCreditCard, FaMoneyBill } from "react-icons/fa";
import PayOsEmbedded, { RETURN_URL } from "@/components/sections/PayOsEmbedded";
import { cartsSelector, handleGetCarts } from "@/services/redux/Slices/carts";
import {
  handleCreatePayment,
  handleUpdateStatusPayment,
} from "@/services/redux/Slices/auth/paymentApi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import AuthRequest from "@/services/axios/AuthRequest";
import FormPopup from "@/components/sections/FormPopup";
import Image from "next/image";
import IsArray from "@/components/ui/IsArray";
import Link from "next/link";
import Responsive from "@/components/layout/Responsive";
import Toastify from "@/components/sections/Toastify";
import { authSelector } from "@/services/redux/Slices/auth";
import axios from "axios";
import { formatCurrencyVND } from "@/services/utils";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";

function PaymentPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(authSelector);
  const { carts } = useSelector(cartsSelector);
  const [dataForm, setDataForm] = useState({
    receiver: user?.fullname,
    phone: user?.phone,
    address: {
      city: "",
      district: "",
      wards: "",
      detail: "",
    },
    paymentMethod: "cash",
    note: "",
  });
  const [warnForm, setWarnForm] = useState({
    receiver: "",
    phone: "",
    address: {
      city: "",
      district: "",
      wards: "",
      detail: "",
    },
    paymentMethod: "",
    note: "",
  });
  const [dataAddress, setDataAddress] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [dataPaymentPayOS, setDataPaymentPayOS] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scroll(0, 0);
    }
    (async () => {
      await axios
        .get(
          "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
        )
        .then((response) => response.data)
        .then((data) => {
          setDataAddress(data);
        })
        .catch((err) => {});
    })();
  }, []);

  const handleFormatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const handleValidations = () => {
    if (!dataForm.receiver) {
      setWarnForm((prev) => ({
        ...prev,
        receiver: "Vui lòng nhập họ tên!",
      }));
    }
    if (!dataForm.phone) {
      setWarnForm((prev) => ({
        ...prev,
        phone: "Vui lòng nhập số điện thoại!",
      }));
    }

    if (!dataForm.address.city) {
      setWarnForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          city: "Vui lòng nhập địa chỉ!",
        },
      }));
    }

    if (!dataForm.address.district) {
      setWarnForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          district: "Vui lòng nhập địa chỉ!",
        },
      }));
    }

    if (!dataForm.address.detail) {
      setWarnForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          detail: "Vui lòng nhập địa chỉ!",
        },
      }));
    }

    if (!dataForm.address.wards) {
      setWarnForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          wards: "Vui lòng nhập địa chỉ!",
        },
      }));
    }

    if (!dataForm.paymentMethod) {
      setWarnForm((prev) => ({
        ...prev,
        paymentMethod: "Vui lòng chọn phương thức thanh toán!",
      }));
    }
    if (
      dataForm.receiver &&
      dataForm.phone &&
      dataForm.address.city &&
      dataForm.address.district &&
      dataForm.address.wards &&
      dataForm.address.detail &&
      dataForm.paymentMethod
    ) {
      return true;
    }
  };
  const handleSubmitForm = async () => {
    const isValid = handleValidations();
    if (isValid) {
      const address = `${dataAddress[dataForm.address.city].Name} - ${
        dataAddress[dataForm.address.city].Districts[dataForm.address.district]
          .Name
      } - ${
        dataAddress[dataForm.address.city].Districts[dataForm.address.district]
          .Wards[dataForm.address.wards].Name
      } - ${dataForm.address.detail}`;
      if (dataForm.paymentMethod) {
        dispatch(
          handleCreatePayment({
            data: {
              ...dataForm,
              address,
              returnUrl: RETURN_URL,
              cancelUrl: RETURN_URL,
            },
            callback: (data) => {
              if (dataForm?.paymentMethod == "transfer") {
                setDataPaymentPayOS(data);
                dispatch(handleGetCarts());
              } else {
                dispatch(handleGetCarts());
                data?.id
                  ? router.push(`/orders/${data?.id}`)
                  : router.push("/orders");
                Toastify(1, "Đặt hàng thành công.");
              }
            },
          })
        );
      }
    }
  };
  return (
    <div>
      <Responsive>
        <div className="pb-3 pt-2">
          <Breadcrumb
            items={[
              {
                title: <Link href={"/"}>Trang chủ</Link>,
              },
              {
                title: <Link href={"/carts"}>Giỏ hàng</Link>,
              },
              {
                title: "Thanh toán",
              },
            ]}
          />
        </div>

        {carts?.items?.length === 0 ? (
          <div className="flex justify-center items-center pt-24">
            <div className="h-50 aspect-video relative">
              <Image
                src={"/images/empty-cart.webp"}
                alt="empty carts"
                fill
                sizes="20vw"
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full text-lg ">
            <div className="w-full p-4">
              <div className="text-2xl font-bold">Thông tin thanh toán</div>
              <>
                <div className="w-full h-full flex justify-between items-center mb-4">
                  <div className="w-1/4">Họ tên người nhận</div>
                  <div className="w-3/4">
                    <input
                      className={`w-full py-2 px-3 border ${
                        warnForm.receiver ? "border-rose-500" : ""
                      }`}
                      type="text"
                      value={dataForm?.receiver}
                      placeholder="Họ và tên"
                      onChange={(e) => {
                        setWarnForm((prev) => ({
                          ...prev,
                          receiver: "",
                        }));
                        setDataForm((prev) => ({
                          ...prev,
                          receiver: e.target.value,
                        }));
                      }}
                    />
                    <p className="text-rose-700 indent-1 warn w-full mb-1">
                      {warnForm.receiver}
                    </p>
                  </div>
                </div>

                <div className="w-full h-full flex justify-between items-center mb-4">
                  <div className="">Số điện thoại</div>
                  <div className="w-3/4">
                    <input
                      className={`w-full py-2 px-3 border ${
                        warnForm.phone ? "border-rose-500" : ""
                      }`}
                      value={dataForm?.phone}
                      type="number"
                      placeholder="Số điện thoại"
                      onChange={(e) => {
                        setWarnForm((prev) => ({
                          ...prev,
                          phone: "",
                        }));
                        setDataForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }));
                      }}
                    />
                    <p className="text-rose-700 indent-1 warn w-full mb-1">
                      {warnForm.phone}
                    </p>
                  </div>
                </div>

                <div className="w-full h-full flex justify-between items-center mb-4">
                  <div className="">Địa chỉ giao hàng</div>
                  <div className="w-3/4 flex flex-wrap">
                    <div className="w-1/3">
                      <select
                        className={`w-full py-2 px-3 border ${
                          warnForm?.address?.city
                            ? "border-rose-500"
                            : "border-r-transparent"
                        }`}
                        onChange={(e) => {
                          setWarnForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              city: "",
                            },
                          }));
                          setDataForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              city: e.target.value,
                              district: "",
                              wards: "",
                            },
                          }));

                          if (e.target.value) {
                            setDistricts(
                              dataAddress[e.target.value]?.Districts
                            );
                          }
                        }}
                        value={dataForm.address.city}
                      >
                        <option value="" disabled hidden className="">
                          Chọn tỉnh/thành phố
                        </option>
                        {dataAddress.map((item, index) => {
                          return (
                            <option key={index} value={index}>
                              {item.Name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="w-1/3">
                      <select
                        className={`w-full py-2 px-3 border ${
                          warnForm?.address?.district
                            ? "border-rose-500"
                            : "border-x-transparent"
                        }`}
                        type="text"
                        onChange={(e) => {
                          setWarnForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              district: "",
                            },
                          }));
                          setDataForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              district: e.target.value,
                              wards: "",
                            },
                          }));

                          if (e.target.value) {
                            setWards(districts[e.target.value].Wards);
                          }
                        }}
                        value={dataForm.address.district}
                      >
                        <option value="" disabled hidden className="">
                          Chọn quận huyện
                        </option>
                        {districts?.map((item, i) => {
                          return (
                            <option
                              key={i}
                              name={item.Name}
                              value={i}
                              className=""
                            >
                              {item.Name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="w-1/3">
                      <select
                        className={`w-full py-2 px-3 border ${
                          warnForm?.address?.wards
                            ? "border-rose-500"
                            : "border-l-transparent"
                        }`}
                        type="text"
                        placeholder="Địa chỉ"
                        onChange={(e) => {
                          setWarnForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              wards: "",
                            },
                          }));
                          setDataForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              wards: e.target.value,
                            },
                          }));
                        }}
                        value={dataForm.address.wards}
                      >
                        <option value="" disabled hidden className="">
                          Chọn phường xã
                        </option>
                        {wards.map((item, index) => {
                          return (
                            <option key={index} value={index}>
                              {item.Name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="w-full">
                      <input
                        type="text"
                        className={`w-full py-2 px-3 border border-t-transparent ${
                          warnForm?.address?.detail ? "border-rose-500" : ""
                        }`}
                        onChange={(e) => {
                          setWarnForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              detail: "",
                            },
                          }));
                          setDataForm((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              detail: e.target.value,
                            },
                          }));
                        }}
                        placeholder="Địa chỉ cụ thể số nhà tên tòa nhà, tên đường, tên khu vực"
                      />
                      <p className="text-rose-700 indent-1 warn w-full mb-1">
                        {warnForm?.address?.detail}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-black/70 my-5 w-1/4">
                    Ghi chú (Nếu có)
                  </div>
                  <div className="w-3/4">
                    <input
                      type=""
                      className="w-full p-2 h-full border"
                      onChange={(e) =>
                        setDataForm((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </>
            </div>

            <div className="w-full mt-3 p-4">
              <div className="text-lg font-bold text-black/60">
                Phương thức thanh toán
              </div>
              <div className="my-2 border-b">
                <div
                  className={`w-1/4 p-2 border rounded-sm flex items-center my-2 cursor-pointer ${
                    dataForm.paymentMethod === "cash"
                      ? "border-2 border-green-500 text-green-500 font-bold"
                      : null
                  }`}
                  onClick={(e) => {
                    setDataForm((prev) => ({
                      ...prev,
                      paymentMethod: "cash",
                    }));
                    setWarnForm((prev) => ({
                      ...prev,
                      paymentMethod: "",
                    }));
                  }}
                >
                  <div
                    className={`w-4 h-4 border-2 rounded-full ${
                      dataForm.paymentMethod === "cash"
                        ? "border-2 bg-green-500 font-bold"
                        : null
                    }`}
                  ></div>
                  <div className="ml-2 flex items-center gap-2">
                    <FaMoneyBill />
                    <span>Tiền mặt(COD)</span>
                  </div>
                </div>
                <div
                  className={`w-1/4 p-2 border rounded-sm flex items-center my-2 cursor-pointer ${
                    dataForm.paymentMethod === "transfer"
                      ? "border-2 border-green-500 text-green-500 font-bold"
                      : null
                  }`}
                  onClick={(e) => {
                    setWarnForm((prev) => ({
                      ...prev,
                      paymentMethod: "",
                    }));
                    setDataForm((prev) => ({
                      ...prev,
                      paymentMethod: "transfer",
                    }));
                  }}
                >
                  <div
                    className={`w-4 h-4 border-2 rounded-full ${
                      dataForm.paymentMethod === "transfer"
                        ? "bg-green-500 border-none"
                        : null
                    }`}
                  ></div>
                  <div className="ml-2 flex items-center gap-2">
                    <FaCreditCard /> <span>Thanh toán trực tuyến (Online)</span>
                  </div>
                </div>
                <p className="text-rose-700 indent-1 warn w-full mb-1">
                  {warnForm.paymentMethod}
                </p>
              </div>
            </div>

            <div className="w-full mt-3 p-4">
              <div>
                <div class="relative overflow-x-auto">
                  <table class="w-full text-sm text-left rtl:text-right text-black">
                    <thead class="text-xs uppercase">
                      <tr>
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
                      <IsArray data={carts?.items}>
                        {carts?.items?.map((_, i) => (
                          <tr class="" key={i}>
                            <th>{i + 1}</th>
                            <th
                              scope="row"
                              class="px-6 py-4 font-medium whitespace-nowrap text-shadow"
                            >
                              {_?.name} -{" "}
                              <span style={{ color: _?.color?.hexCode }}>
                                {_?.color?.name}
                              </span>
                            </th>
                            <td class="px-6 py-4">
                              {" "}
                              {formatCurrencyVND(
                                _.sellingPrice * (1 - _.discount / 100)
                              )}
                            </td>
                            <td class="px-6 py-4">
                              {_?.size?.type}x{_.quantity}
                            </td>
                            <td class="px-6 py-4">
                              {formatCurrencyVND(
                                _.sellingPrice *
                                  _.quantity *
                                  (1 - _.discount / 100)
                              )}
                            </td>
                          </tr>
                        ))}
                      </IsArray>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border-t border-rose-500"></div>
              <div className="flex items-center justify-end text-xl">
                <div className="">Tổng thanh toán:</div>
                <div className="ml-4 text-rose-500">
                  {handleFormatPrice(carts.total)}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  type="primary"
                  className="bg-rose-500 text-white px-6 py-2 hover:bg-sky-500"
                  onClick={() => {
                    const validater = handleValidations();
                    if (validater) {
                      handleSubmitForm();
                    }
                  }}
                >
                  Đặt hàng
                </Button>
              </div>
            </div>
          </div>
        )}
      </Responsive>

      <PayOsEmbedded
        checkoutUrl={dataPaymentPayOS?.checkoutUrl}
        onExitPayOS={(orderCode) => {
          console.log(dataPaymentPayOS);
          setDataPaymentPayOS(null);
          if (orderCode) {
            dispatch(
              handleUpdateStatusPayment({
                orderCode,
                callback: (data) => {
                  router.push(`/orders/${data?.orderID}`);
                },
              })
            );
          }
        }}
      />
    </div>
  );
}

export default useRequireAuth(PaymentPage);
