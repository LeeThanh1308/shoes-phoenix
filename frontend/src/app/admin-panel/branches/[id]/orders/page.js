"use client";

import { Button, Input, Select, Space, Table } from "antd";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  handleGetAdminOrders,
  handlePushOrders,
  handleUpdatedAdminOrders,
  ordersSelector,
} from "@/services/redux/Slices/orders";
import { useDispatch, useSelector } from "react-redux";

import GuestRequest from "@/services/axios/GuestRequest";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import Toastify from "@/components/sections/Toastify";
import { allowedRoles } from "@/services/utils/allowedRoles";
import dayjs from "dayjs";
import { formatCurrencyVND } from "@/services/utils";
import { initSocket } from "@/services/socket";
import { withRoleGuard } from "@/hooks/withRoleGuard";

function OrderPage() {
  const dispatch = useDispatch();
  const { orders, validators, onRefresh } = useSelector(ordersSelector);
  const [productStatus, setProductStatus] = useState([]);
  const [filterStatusPayment, setFilterStatusPayment] = useState();
  const [activeOptions, setActiveOptions] = useState("orders");
  const [rowChangeStatus, setRowChangeStatus] = useState([]);
  const [showFormCreated, setShowFormCreated] = useState(false);
  const [showFormUpdated, setShowFormUpdated] = useState(false);
  const [idThisUpdated, setIdThisUpdated] = useState(undefined);
  const onSubmit = useCallback(
    (data) => {
      if (showFormCreated) dispatch(handleCreateColor(data));
      if (showFormUpdated) {
        dispatch(handleUpdateColor({ ...data, id: idThisUpdated }));
      }
    },
    [showFormCreated, showFormUpdated]
  );

  const options = useMemo(
    () => [
      { value: "orders", label: "Đơn đặt hàng" },
      { value: "history", label: "Lịch sử đơn hàng" },
    ],
    []
  );

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (orders?.length == 0) {
        dispatch(handleGetAdminOrders({ filter: activeOptions }));
      }
    }, 200);
    return () => clearTimeout(timerID);
  }, []);

  useEffect(() => {
    if (onRefresh) {
      setShowFormCreated(false);
      setShowFormUpdated(false);
      setIdThisUpdated(undefined);
      dispatch(handleGetAdminOrders({ filter: activeOptions }));
    }
  }, [onRefresh]);

  useEffect(() => {
    let socket;
    (async () => {
      GuestRequest.get("payment/product-status").then((res) => {
        setProductStatus(
          Object.entries(res.data ?? {}).map(([key, value]) => ({
            value: key,
            label: value,
          }))
        );
      });
      socket = await initSocket();
      if (socket) {
        socket.on("onCreatePayment", (data) => {
          if (data) {
            Toastify(1, `Có đơn đặt hàng mới.`, {
              autoClose: 5000,
            });
            dispatch(handlePushOrders(data));
          }
        });
      }
    })();

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("onCreatePayment");
        socket.disconnect();
      }
    };
  }, []);

  // Table
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
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
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
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
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Mã giao dịch",
      dataIndex: "id",
      key: "id",
      ...getColumnSearchProps("id"),
    },

    {
      title: "Người nhận",
      dataIndex: "receiver",
      key: "receiver",
      ...getColumnSearchProps("receiver"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ...getColumnSearchProps("address"),
    },

    {
      title: "Giá",
      key: "price",
      dataIndex: "price",
      ...getColumnSearchProps("price"),
      sorter: (a, b) => a?.price - b?.price,
      sortDirections: ["descend", "ascend"],
      render: (text) => <p>{formatCurrencyVND(text)}</p>,
    },
    {
      title: "Phương thức thanh toán",
      key: "paymentMethod",
      dataIndex: "paymentMethod",
      ...getColumnSearchProps("paymentMethod"),
      sorter: (a, b) => a?.paymentMethod - b?.paymentMethod,
      sortDirections: ["descend", "ascend"],
      render: (text) => <p>{text}</p>,
    },
    {
      title: "Trạng thái giao dịch",
      key: "orderStatus",
      dataIndex: "orderStatus",
      // ...getColumnSearchProps("orderStatus"),
      render: (text, record) => {
        return (
          <Select
            defaultValue={productStatus.find((value) => {
              if (value.label == text) {
                return value.value;
              }
            })}
            placeholder="Trạng thái đơn hàng"
            onChange={(value) => {
              setRowChangeStatus((prev) => [...prev, record.id]);
            }}
            style={{ width: 200 }}
            options={productStatus ?? []}
          />
        );
      },
      filters: productStatus.map((_) => ({
        text: _.label,
        value: _.label,
      })),
      filterSearch: true,
      onFilter: (value, record) => record?.orderStatus?.startsWith(value),
    },
    {
      title: "Ngày khởi tạo",
      key: "createdAt",
      dataIndex: "createdAt",
      ...getColumnSearchProps("createdAt"),
      sorter: (a, b) => (dayjs(a.createdAt).isBefore(b.createdAt) ? -1 : 1),
      render: (_, record) => {
        return dayjs(record?.createdAt).format("DD/MM/YYYY HH:mm:ss");
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {rowChangeStatus.includes(record.id) && (
            <Button
              type="primary"
              onClick={() => {
                dispatch(
                  handleUpdatedAdminOrders({
                    id: _.id,
                    orderStatus: "DELIVERED",
                  })
                );
              }}
            >
              Lưu trạng thái
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <Table
        columns={[
          {
            title: "Tên Sản Phẩm",
            dataIndex: ["product", "name"],
          },
          {
            title: "Loại",
            dataIndex: ["size", "type"],
          },
          {
            title: "Màu sắc",
            dataIndex: ["color", "name"],
          },
          {
            title: "Số lượng",
            dataIndex: "quantity",
            sorter: (a, b) => parseFloat(a.quantity) - parseFloat(b.quantity),
            ...getColumnSearchProps("quantity"),
          },
          {
            title: "Thành tiền",
            dataIndex: "totalAmount",
            ...getColumnSearchProps("totalAmount"),
            sorter: (a, b) =>
              parseFloat(a.totalAmount) - parseFloat(b.totalAmount),
            render: (value) => (
              <span className=" text-green-700">
                {+value > 0
                  ? `${formatCurrencyVND(parseInt(value))}`
                  : "Mặc định"}
              </span>
            ),
          },
        ]}
        dataSource={record.tempOrders}
        pagination={false}
        rowKey="id"
      />
    );
  };
  // Table

  return (
    <div className="w-full h-full z-10 text-black relative ">
      <div className="p-6 z-0">
        <div className="flex justify-between items-center">
          <div className="mb-4 font-bold text-5xl text-rose-700">
            <span>
              {
                options.find((_) => {
                  if (_.value == activeOptions) return _;
                }).label
              }
            </span>
            <span className=" text-3xl"> ({orders?.length})</span>
          </div>

          <div className=" flex items-center gap-2">
            <Select
              defaultValue={"orders"}
              onChange={(value) => {
                setActiveOptions(value);
                dispatch(handleGetAdminOrders({ filter: value }));
              }}
              style={{ width: 200 }}
              options={options ?? []}
            />
            {activeOptions == "history" ? (
              <Select
                placeholder="Lọc theo trạng thái đơn hàng"
                onChange={(value) => {
                  console.log(
                    productStatus.some((status) => {
                      if (status.value == value) {
                        setFilterStatusPayment(status.label);
                      }
                    })
                  );
                }}
                style={{ width: 200 }}
                options={productStatus ?? []}
              />
            ) : (
              filterStatusPayment && setFilterStatusPayment("")
            )}
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            rowKey="id"
            dataSource={orders.filter((_) => {
              if (!filterStatusPayment) {
                return _;
              } else if (_?.orderStatus == filterStatusPayment) {
                return _;
              }
            })}
            expandable={{
              expandedRowRender,
              rowExpandable: () => true,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default withRoleGuard(OrderPage, [
  allowedRoles.CEO,
  allowedRoles.MANAGE,
  allowedRoles.STAFF,
]);
