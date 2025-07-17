"use client";

import { Breadcrumb, Button, Input, Space, Table } from "antd";
import { orderStatusKey, paymentStatusKey } from "@/services/utils/statusCode";
import { useEffect, useMemo, useRef, useState } from "react";

import AuthRequest from "@/services/axios/AuthRequest";
import Highlighter from "react-highlight-words";
import Link from "next/link";
import Responsive from "@/components/layout/Responsive";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { formatCurrencyVND } from "@/services/utils";
import useRequireAuth from "@/hooks/useRequireAuth";

function OrdersPage() {
  const [dataHistory, setDataHistory] = useState([]);
  const [dataSold, setDataSold] = useState([]);
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
            className="text-black"
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
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
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

  const handleCalcTotal = useMemo(() => {
    return dataHistory.reduce(
      (acc, current) =>
        current.price ? current.price * current.quantity : current.total + acc,
      0
    );
  }, [dataHistory]);

  const handleCalcTotalDetail = useMemo(() => {
    return dataSold.reduce(
      (acc, current) => current.price * current.quantity + acc,
      0
    );
  }, [dataSold]);

  function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
  const columnHistory = [
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
      render: (text) => <p>{formatPrice(text)}</p>,
    },
    {
      title: "Phương thức thanh toán",
      key: "paymentMethod",
      dataIndex: "paymentMethod",
      ...getColumnSearchProps("paymentMethod"),
      sorter: (a, b) => a?.paymentMethod - b?.paymentMethod,
      sortDirections: ["descend", "ascend"],
      render: (text, record) => {
        console.log(record);
        return <p>{text} </p>;
      },
    },
    {
      title: "Trạng thái giao dịch",
      key: "orderStatus",
      dataIndex: "orderStatus",
      ...getColumnSearchProps("orderStatus"),
      sorter: (a, b) => a?.orderStatus - b?.orderStatus,
      sortDirections: ["descend", "ascend"],
      render: (text, record) => {
        return (
          <p>
            {record?.paymentStatus && record?.paymentStatus != "PAID"
              ? record?.paymentStatus &&
                paymentStatusKey?.[record?.paymentStatus]
              : orderStatusKey?.[text]}
          </p>
        );
      },
    },
    {
      title: "Ngày khởi tạo",
      key: "createdAt",
      dataIndex: "createdAt",
      ...getColumnSearchProps("createdAt"),
      sorter: (a, b) => (dayjs(a.createdAt).isBefore(b.createdAt) ? -1 : 1),
      sortDirections: ["ascend", "descend"],
      render: (record) => {
        return dayjs(record).format("DD/MM/YYYY HH:mm:ss");
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {/* <span
                  className=" cursor-pointer hover:text-sky-500"
                  onClick={async (e) => {
                    // await dispatch(handleGetCategory({ childrenId: record?.id }));
                    Object.entries(record).forEach(([field, message]) => {
                      if ((field && typeof message === "boolean") || message)
                        setValue(field, message);
                    });
                    setIdThisUpdated(record?.id);
                    setShowFormUpdated(true);
                  }}
                >
                  Sửa
                </span>
                <span
                  className=" cursor-pointer hover:text-rose-500"
                  onClick={() => {
                    if (window.confirm("Bạn chắc chắn muốn xóa màu sắc này?"))
                      dispatch(handleDeleteColor({ id: record?.id }));
                  }}
                >
                  Delete
                </span> */}
          <Link href={`/orders/${record?.id}`}>Xem chi tiết</Link>
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

  useEffect(() => {
    AuthRequest.get("payment/orders")
      .then((response) => response.data)
      .then((data) => {
        setDataHistory(data);
      });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full h-full pt-3">
      <Responsive>
        <div className="pb-3 pt-2">
          <Breadcrumb
            items={[
              {
                title: <Link href={"/"}>Trang chủ</Link>,
              },
              {
                title: "Đơn hàng của bạn",
              },
            ]}
          />
        </div>
        <div className="w-full h-full p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold my-3">Đơn hàng của bạn</h1>
            </div>
            <div></div>
          </div>
          <Table
            columns={columnHistory}
            rowKey="id"
            dataSource={dataHistory}
            expandable={{
              expandedRowRender,
              rowExpandable: () => true,
            }}
          />
        </div>
      </Responsive>
    </div>
  );
}

export default useRequireAuth(OrdersPage);
