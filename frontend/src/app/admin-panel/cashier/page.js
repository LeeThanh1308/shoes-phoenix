"use client";

import { Button, Input, Modal, Select, Space, Spin, Table } from "antd";
import { FaCircleCheck, FaXmark } from "react-icons/fa6";
import { FaCreditCard, FaMoneyBill } from "react-icons/fa";
import { SearchOutlined, SyncOutlined } from "@ant-design/icons";
import {
  authSelector,
  handleChangeOrderCode,
} from "@/services/redux/Slices/auth";
import {
  cartsSelector,
  handleCreateCashiersCarts,
  handleDeleteCart,
  handleGetCashiersCarts,
  handleUpdateCart,
} from "@/services/redux/Slices/carts";
import { formatCurrencyVND, generateUrlImage } from "@/services/utils";
import {
  handleCheckOutOrderPayment,
  handleCreateOrderByCashier,
} from "@/services/redux/Slices/auth/paymentApi";
import {
  handleFindProductByCashiers,
  productsSelector,
} from "@/services/redux/Slices/products";
import {
  paymentStatusKey,
  paymentStatusValue,
} from "@/services/utils/statusCode";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";

import AuthRequest from "@/services/axios/AuthRequest";
import FormPopup from "@/components/sections/FormPopup";
import Image from "next/image";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import InputQuantitySpinner from "@/components/ui/InputQuantitySpinner";
import { IoCloseCircle } from "react-icons/io5";
import Link from "next/link";
import Toastify from "@/components/sections/Toastify";
import { allowedRoles } from "@/services/utils/allowedRoles";
import { initSocket } from "@/services/socket";
import { withRoleGuard } from "@/hooks/withRoleGuard";

const { Search } = Input;

function CashierPage() {
  const dispatch = useDispatch();
  const { cashiersCarts, onRefresh } = useSelector(cartsSelector);
  const { search: searchData } = useSelector(productsSelector);
  const [searchValue, setSearchValue] = useState("");
  const { isAuthenticated, user, orderCode } = useSelector(authSelector);
  const [rowIdChangeStatus, setRowIdChangeStatus] = useState();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [dataCustomer, setDataCustomer] = useState({
    phone: "",
    receiver: "Customers",
  });
  const [colorID, setColorID] = useState();
  const [sizeID, setSizeID] = useState();
  const [quantity, setQuantity] = useState(1);
  const [checkoutData, setCheckoutData] = useState("");
  const [idsSelectedRows, setIdsselectedRows] = useState([]);
  const [expandedRowType, setExpandedRowType] = useState("sizes"); // 'sizes' | 'images' | etc.
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setIdsselectedRows(
        selectedRows.reduce((acc, current) => {
          acc.push(current?.id);
          return acc;
        }, [])
      );
    },
    onSelect: (record, selected, selectedRows) => {
      // console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      // console.log(selected, selectedRows, changeRows);
    },
  };
  const fieldExpands = ["sizes", "images", "description"];
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) => {
      console.log(value, record);
      return record[dataIndex]
        ?.toString()
        ?.toLowerCase()
        ?.includes(value.toLowerCase());
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text?.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = useMemo(() => [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      ...getColumnSearchProps("slug"),
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      ...getColumnSearchProps("barcode"),
    },

    {
      title: "Giá bán",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      sorter: (a, b) => parseFloat(a.sellingPrice) - parseFloat(b.sellingPrice),
      render: (value) => (
        <span className=" text-green-700">{`${formatCurrencyVND(
          parseInt(value)
        )}`}</span>
      ),
    },
    {
      title: "Thương hiệu",
      dataIndex: ["brand", "name"],
    },
    {
      title: "Màu sắc",
      dataIndex: "colors",
      render: (_, record) => {
        return (
          <Select
            placeholder="Chọn màu sắc"
            className=" w-full"
            onChange={(value) => {
              setRowIdChangeStatus(record.id);
              setColorID(value);
            }}
            options={_.map((_) => ({
              value: _.id,
              label: _.name,
            }))}
          />
        );
      },
    },
    {
      title: "Kích thước",
      render: (_, record) => {
        return (
          <Select
            placeholder="Chọn kích thước"
            className=" w-full"
            onChange={(value) => {
              setRowIdChangeStatus(record.id);
              setSizeID(value);
            }}
            options={record?.colors?.reduce((acc, color) => {
              if (color.id == colorID) {
                color?.sizes.map((size) => {
                  acc.push({
                    label: `Size ${size?.type} còn ${size?.inventory}`,
                    value: size?.id,
                    disabled: size?.inventory <= 0,
                  });
                });
              }
              return acc;
            }, [])}
          />
        );
      },
    },
    {
      title: "Số lượng",
      render: (_, record) => {
        const { inventory } = record?.colors?.reduce(
          (acc, color) => {
            if (color.id == colorID) {
              color?.sizes.map((size) => {
                if (size.id == sizeID) {
                  acc.inventory = size?.inventory;
                }
              });
            }
            return acc;
          },
          { inventory: 0 }
        );
        return (
          <InputQuantitySpinner
            defaultValue={1}
            max={inventory}
            onOption={(value) => {
              setQuantity(value);
            }}
          />
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {[rowIdChangeStatus].includes(record.id) && colorID && sizeID && (
            <Button
              type="primary"
              className=" border border-sky-500 text-sky-500"
              onClick={(e) => {
                dispatch(
                  handleCreateCashiersCarts({
                    quantity,
                    sizeID,
                    colorID,
                  })
                );
              }}
            >
              Thêm +
            </Button>
          )}
        </Space>
      ),
    },
  ]);
  const { totalCost, totalSale, totalSave, totalQuantity } = useMemo(() => {
    if (!cashiersCarts?.items?.length) return {};
    return cashiersCarts?.items?.reduce(
      (acc, item) => {
        const totalSellingPrice = +item?.sellingPrice * +item?.quantity;
        acc.totalCost += totalSellingPrice;
        acc.totalSale += totalSellingPrice * (1 - item?.discount / 100);
        acc.totalSave += acc.totalCost - acc.totalSale;
        acc.totalQuantity += +item?.quantity;
        return acc;
      },
      {
        totalCost: 0,
        totalSale: 0,
        totalSave: 0,
        totalQuantity: 0,
      }
    );
  }, [cashiersCarts]);

  const handleSendTransactionClosed = async () => {
    const socket = await initSocket();
    socket.emit("sendTransactionClosed", { orderCode });
    dispatch(handleChangeOrderCode(null));
  };

  useEffect(() => {
    const timerID = setTimeout(() => {
      searchValue && dispatch(handleFindProductByCashiers(searchValue));
    }, 1000);

    return () => {
      clearTimeout(timerID);
    };
  }, [searchValue]);

  useEffect(() => {
    onRefresh && dispatch(handleGetCashiersCarts());
  }, [onRefresh]);

  useEffect(() => {
    dispatch(handleGetCashiersCarts());
  }, []);

  useEffect(() => {
    let timerID;
    if (orderCode) {
      timerID = setInterval(() => {
        dispatch(
          handleCheckOutOrderPayment({
            orderCode,
            callback: (data) => {
              setCheckoutData(data);
              if (data.status == paymentStatusValue.PENDING) {
              }
              if (data.status == paymentStatusValue.PAID) {
                clearInterval(timerID);
                dispatch(handleGetCashiersCarts());
              }
            },
          })
        );
      }, 2000);
    }

    return () => clearInterval(timerID);
  }, [orderCode]);

  console.log(orderCode);
  console.log(checkoutData);
  return (
    <div className="">
      <div className="p-6 z-0">
        <div className="flex justify-between items-center">
          <div className="mb-4 font-bold text-5xl text-rose-700">
            <span>Trang thu ngân</span>
          </div>
        </div>

        <div className="">
          <div className=" flex flex-col gap-2 w-full">
            <Search
              placeholder="Tìm kiếm thêm sản phẩm theo tên sp;size;màu sắc"
              value={searchValue}
              className=""
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={setSearchValue}
              enterButton
            />
            {searchValue && (
              <Table
                dataSource={searchData}
                columns={columns}
                rowSelection={{
                  ...rowSelection,
                }}
                rowKey="id"
                className="z-0"
              />
            )}
          </div>
          <div className="w-full flex text-lg text-black/70 py-3">
            {/* San pham */}
            <div className="w-full">
              <div className=" flex justify-between gap-4">
                <div className=" flex-[0.6]">
                  <div className="overflow-x-auto ">
                    <table className="min-w-full table-auto divide-y divide-gray-200">
                      <thead className="">
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
                          <th className="text-xs font-bold uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {Array.isArray(cashiersCarts?.items) &&
                          cashiersCarts.items.map((item, index) => (
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
                                  item?.sellingPrice *
                                    (1 - item?.discount / 100)
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
                              <td>
                                <div
                                  className="w-5 h-5 rounded-full text-black/70 text-sm cursor-pointer bg-rose-500"
                                  onClick={() =>
                                    dispatch(handleDeleteCart({ id: item?.id }))
                                  }
                                >
                                  <FaXmark className=" hidden group-hover:block text-white" />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {cashiersCarts?.items?.length > 0 && (
                    <Button
                      type="dashed"
                      className="text-rose-500 my-2 mx-4 cursor-pointer"
                      onClick={() => {
                        dispatch(handleDeleteCart({ clears: true }));
                      }}
                    >
                      Xoá giỏ hàng
                    </Button>
                  )}
                </div>
                <div className=" flex-[0.4] shrink-0">
                  <div className="w-full flex justify-between mb-2">
                    <div>Tạm tính giỏ hàng: </div>
                    <div className=" text-red-500">
                      {formatCurrencyVND(totalCost ?? 0)}
                    </div>
                  </div>
                  <div className="w-full flex justify-between mb-2">
                    <div>Tạm tính sản phẩm khuyến mãi: </div>
                    <div
                      className={`${
                        totalSale < totalCost ? "text-blue-500" : "text-red-500"
                      }`}
                    >
                      {formatCurrencyVND(totalSale ?? 0)}
                    </div>
                  </div>
                  <div className="w-full flex justify-between mb-2">
                    <div>Tiết kiệm được: </div>
                    <div
                      className={`${
                        totalSave ? "text-blue-500" : "text-red-500"
                      }`}
                    >
                      {formatCurrencyVND(totalSave ?? 0)}
                    </div>
                  </div>
                  <div className="w-full flex justify-between mb-2">
                    <div>Phí vận chuyển: </div>
                    <div className=" text-red-500">0đ</div>
                  </div>
                  <div className="w-full flex justify-between mb-2">
                    <div>Tổng sản phẩm: </div>
                    <div className=" text-red-500">{totalQuantity}</div>
                  </div>
                  <div className="w-full flex justify-between  mb-2 border-t border-rose-500">
                    <div>Thành tiền: </div>
                    <div className=" text-rose-500 font-bold">
                      {formatCurrencyVND(cashiersCarts?.total ?? 0)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <InputFormAdmin
                      className={"flex-[0.5]"}
                      title={"Tên khách hàng"}
                      placeholder="Tên khách hàng"
                      value={dataCustomer.receiver}
                      onChange={(e) => {
                        setDataCustomer((prev) => ({
                          ...prev,
                          receiver: e.target.value,
                        }));
                      }}
                    />
                    <InputFormAdmin
                      className={"flex-[0.5]"}
                      title={"Phone"}
                      placeholder="Số điện thoại khách hàng"
                      value={dataCustomer.phone}
                      onChange={(e) => {
                        setDataCustomer((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }));
                      }}
                    />
                  </div>

                  <div className="w-full mb-2">
                    <div className="text-lg font-bold text-black/60">
                      Phương thức thanh toán
                    </div>
                    <div className="flex justify-between gap-2">
                      <div
                        className={`w-full p-2 border rounded-sm flex items-center cursor-pointer ${
                          paymentMethod === "cash"
                            ? "border-2 border-green-500 text-green-500 font-bold"
                            : null
                        }`}
                        onClick={() => {
                          setPaymentMethod("cash");
                        }}
                      >
                        <div
                          className={`w-4 h-4 border-2 rounded-full ${
                            paymentMethod === "cash"
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
                        className={`w-full p-2 border rounded-sm flex items-center cursor-pointer ${
                          paymentMethod === "transfer"
                            ? "border-2 border-green-500 text-green-500 font-bold"
                            : null
                        }`}
                        onClick={() => {
                          setPaymentMethod("transfer");
                        }}
                      >
                        <div
                          className={`w-4 h-4 border-2 rounded-full ${
                            paymentMethod === "transfer"
                              ? "bg-green-500 border-none"
                              : null
                          }`}
                        ></div>
                        <div className="ml-2 flex items-center gap-2">
                          <FaCreditCard />{" "}
                          <span>Thanh toán trực tuyến (Online)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className=" flex justify-between gap-2 items-center">
                    <div
                      onClick={() => {
                        cashiersCarts?.total > 0 &&
                          dispatch(
                            handleCreateOrderByCashier({
                              data: {
                                paymentMethod,
                                returnUrl: window.location.href,
                                cancelUrl: window.location.href,
                                ...dataCustomer,
                              },
                              callback: (data) => {
                                if (paymentMethod == "cash") {
                                  dispatch(handleGetCashiersCarts());
                                  Toastify(1, "Thanh toán sản phẩm thành công");
                                } else if (paymentMethod == "transfer") {
                                  // if (data.orderCode)
                                  // dispatch(
                                  //   handleChangeOrderCode(data.orderCode)
                                  // );
                                }
                              },
                            })
                          );
                      }}
                      className="w-full h-10 border bg-blue-700 flex justify-center items-center font-bold text-white rounded-lg cursor-pointer hover:bg-red-500/70"
                    >
                      THANH TOÁN: {formatCurrencyVND(cashiersCarts?.total ?? 0)}
                    </div>
                    <div
                      type="primary"
                      className="w-full h-10 border bg-green-500 flex justify-center items-center font-bold text-white rounded-lg cursor-pointer hover:opacity-70"
                      onClick={() => window.open(`/auth/payments`)}
                    >
                      Mở trang chuyển khoản
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {checkoutData?.status && orderCode && (
        <div className=" fixed top-0 right-0 left-0 bottom-0 flex justify-center items-center backdrop-blur-lg z-auto">
          <div
            className={`w-96 h-64 relative border-2 shadow-md rounded-md flex flex-col justify-center items-center text-center ${
              checkoutData?.status == paymentStatusValue.PAID
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            <div className=" absolute top-2 right-2">
              <div
                className=""
                onClick={(e) => {
                  checkoutData?.status == paymentStatusValue.PAID
                    ? Modal.confirm({
                        title: "Kết thúc giao dịch.",
                        content: "",
                        okText: "Đồng ý",
                        cancelText: "Hủy",
                        onOk() {
                          handleSendTransactionClosed();
                          dispatch(handleChangeOrderCode(null));
                          setCheckoutData("");
                        },
                        onCancel() {},
                      })
                    : Modal.confirm({
                        title: "Ngừng giao dịch",
                        content: "Bạn có chắc chắn muốn dừng giao dịch?",
                        okText: "Đồng ý",
                        cancelText: "Hủy",
                        onOk() {
                          dispatch(handleChangeOrderCode(null));
                          setCheckoutData("");
                          handleSendTransactionClosed();
                        },
                        onCancel() {},
                      });
                }}
              >
                <div className="w-5 h-5 rounded-full text-black/70 text-sm flex justify-center cursor-pointer items-center bg-rose-500 group">
                  <FaXmark className="text-white hidden group-hover:block" />
                </div>
              </div>
            </div>
            <div className="flex justify-center mb-2">
              {checkoutData?.status == paymentStatusValue.PAID ? (
                <FaCircleCheck className="text-5xl" />
              ) : (
                <IoCloseCircle size={80} />
              )}
            </div>
            <div className="flex gap-2 items-center">
              {checkoutData?.status != paymentStatusValue.PAID && (
                <SyncOutlined
                  className={`${
                    checkoutData?.status == paymentStatusValue.PAID
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                  size={12}
                  spin
                />
              )}
              <h1 className=" text-xl font-bold">
                {paymentStatusKey?.[checkoutData?.status]}
              </h1>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withRoleGuard(CashierPage, [
  allowedRoles.CEO,
  allowedRoles.MANAGE,
  allowedRoles.STAFF,
]);
