"use client";

import "quill/dist/quill.snow.css";

import { Button, Input, Space, Table } from "antd";
import React, { useMemo, useRef, useState } from "react";

import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { formatCurrencyVND } from "@/services/utils";
import { handleDeleteStore } from "@/services/redux/Slices/stores";
import { useDispatch } from "react-redux";

const StoresTable = ({ data = [], onUpdate = () => null }) => {
  const dispatch = useDispatch();
  const [idsSelectedRows, setIdsselectedRows] = useState([]);
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
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getNestedValue = (obj, path) => {
    return path?.split(".")?.reduce((acc, key) => acc?.[key], obj);
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
      const fieldValue = getNestedValue(record, dataIndex);
      return fieldValue?.toString().toLowerCase().includes(value.toLowerCase());
      const keys = dataIndex.split(".");
      let field = record;
      for (const key of keys) {
        field = field?.[key];
      }
      return field?.toString().toLowerCase().includes(value.toLowerCase());
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (_, record) => {
      const text = getNestedValue(record, dataIndex);
      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text?.toString() || ""}
        />
      ) : (
        <span>{text}</span>
      );
    },
  });
  const expandedRowRender = (record) => {
    return (
      <Table
        columns={[
          {
            title: "ID",
            dataIndex: "id",
            key: "id",
          },
          {
            title: "Tên sản phẩm",
            dataIndex: "product",
            key: "product",
            ...getColumnSearchProps("product.name"),
            render: (value) =>
              searchedColumn === "product.name" ? (
                <Highlighter
                  highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                  searchWords={[searchText]}
                  autoEscape
                  textToHighlight={value?.name?.toString() || ""}
                />
              ) : (
                <span>{value?.name}</span>
              ),
          },
          {
            title: "Loại",
            dataIndex: "size",
            key: "size",
            sorter: (a, b) => {
              return +a?.size?.type - b?.size?.type;
            },
            render: (value) => <p>{value?.type}</p>,
          },
          {
            title: "Màu sắc",
            dataIndex: "color",
            sorter: (a, b) => {
              console.log(a, b);
              return a?.color?.name?.length - b?.color?.name?.length;
            },
            ...getColumnSearchProps("color.name"),
          },
          {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            sorter: (a, b) => a - b,
            ...getColumnSearchProps("quantity"),
          },
          {
            title: "Giá gốc",
            key: "costPrice",
            render: (_) => {
              const costPrice = +_?.size?.costPrice
                ? +_?.size?.costPrice
                : +_?.product?.costPrice;
              // const totalPrice = costPrice * +_?.quantity;
              return (
                <p className=" text-red-500">{formatCurrencyVND(costPrice)}</p>
              );
            },
          },
          {
            title: "Giá bán",
            key: "sellingPrice",
            render: (_) => {
              const sellingPrice = +_?.size?.sellingPrice
                ? +_?.size?.sellingPrice
                : +_?.product?.sellingPrice;
              return (
                <p className=" text-blue-500">
                  {formatCurrencyVND(sellingPrice)}
                </p>
              );
            },
          },
          {
            title: "Tổng chi",
            key: "TotalCostPrice",
            render: (_) => {
              const costPrice = +_?.size?.costPrice
                ? +_?.size?.costPrice
                : +_?.product?.costPrice;
              const totalPrice = costPrice * +_?.quantity;
              return (
                <p className=" text-red-500">{formatCurrencyVND(totalPrice)}</p>
              );
            },
          },

          {
            title: "Lợi nhuận sau bán",
            key: "TotalCostPrice",
            render: (_) => {
              const costPrice = +_?.size?.costPrice
                ? +_?.size?.costPrice
                : +_?.product?.costPrice;
              const totalPriceCost = costPrice * +_?.quantity;
              const sellingPrice = +_?.size?.sellingPrice
                ? +_?.size?.sellingPrice
                : +_?.product?.sellingPrice;
              const totalPriceSell = sellingPrice * +_?.quantity;
              return (
                <p className=" text-blue-500">
                  {formatCurrencyVND(totalPriceSell - totalPriceCost)}
                </p>
              );
            },
          },
          {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (value) =>
              new Date(value).toLocaleString("vi-VN", { hour12: false }),
          },
          {
            title: "Cập nhật lần cuối",
            dataIndex: "updatedAt",
            key: "updatedAt",
            sorter: (a, b) =>
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
            render: (value) =>
              new Date(value).toLocaleString("vi-VN", { hour12: false }),
          },
        ]}
        dataSource={record.items}
        pagination={false}
        rowKey="id"
      />
    );
  };
  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "Được tạo bởi",
        dataIndex: ["createdBy", "fullname"],
        key: "createdBy",
        ...getColumnSearchProps("createdBy.fullname"),
      },
      {
        title: "Tổng loại sản phẩm",
        dataIndex: "items",
        key: "items",
        sorter: (a, b) => a?.items?.length - b?.items?.length,
        render: (_) => <span>{_?.length}</span>,
      },
      {
        title: "Số lượng",
        dataIndex: "items",
        key: "quantity",
        sorter: (a, b) => {
          const totalA = a.items.reduce(
            (acc, item) => acc + (item?.quantity || 0),
            0
          );
          const totalB = b.items.reduce(
            (acc, item) => acc + (item?.quantity || 0),
            0
          );
          return totalA - totalB;
        },
        render: (_) => {
          console.log(_);
          return <span>{_?.reduce((acc, _) => (acc += _?.quantity), 0)}</span>;
        },
      },
      {
        title: "Tổng giá nhập",
        dataIndex: "items",
        key: "costPrice",
        render: (_) => {
          const data = _.reduce((acc, item) => {
            const costPrice = +item?.size?.costPrice
              ? +item?.size?.costPrice
              : +item?.product?.costPrice;
            const totalPrice = costPrice * +item?.quantity;
            acc = acc + totalPrice;
            return acc;
          }, 0);

          return <p className=" text-red-500">{formatCurrencyVND(data)}</p>;
        },
      },
      {
        title: "Lợi nhuận sau bán.",
        dataIndex: "items",
        key: "sellingPrice",
        render: (_) => {
          const data = _.reduce((acc, item) => {
            const sellingPrice = +item?.size?.sellingPrice
              ? +item?.size?.sellingPrice
              : +item?.product?.sellingPrice;
            const costPrice = +item?.size?.costPrice
              ? +item?.size?.costPrice
              : +item?.product?.costPrice;
            const totalPriceCost = costPrice * +item?.quantity;
            const totalPriceSelling = sellingPrice * +item?.quantity;
            acc = acc + (totalPriceSelling - totalPriceCost);
            return acc;
          }, 0);

          return <p className=" text-blue-500">{formatCurrencyVND(data)}</p>;
        },
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        render: (value) =>
          new Date(value).toLocaleString("vi-VN", { hour12: false }),
      },
      {
        title: "Cập nhật lần cuối",
        dataIndex: "updatedAt",
        key: "updatedAt",
        sorter: (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        render: (value) =>
          new Date(value).toLocaleString("vi-VN", { hour12: false }),
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <span
              className=" cursor-pointer hover:text-sky-500"
              onClick={() => {
                onUpdate(record);
              }}
            >
              Sửa
            </span>
            <span
              className=" cursor-pointer hover:text-rose-500"
              onClick={() => {
                if (window.confirm("Bạn chắc chắn muốn xóa kho hàng này?"))
                  dispatch(handleDeleteStore({ id: record?.id }));
              }}
            >
              Delete
            </span>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Table
        dataSource={data}
        columns={columns}
        rowSelection={{
          ...rowSelection,
        }}
        expandable={{
          expandedRowRender,
          rowExpandable: () => true,
        }}
        rowKey="id"
      />

      <div className=" grid grid-cols-8">
        <Button
          type="primary"
          disabled={idsSelectedRows.length == 0}
          onClick={() => {
            console.log(idsSelectedRows);
            if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm đã chọn?"))
              dispatch(handleDeleteStore({ ids: idsSelectedRows }));
          }}
          danger
        >
          Xóa nhiều
        </Button>
      </div>
    </>
  );
};

export default StoresTable;
