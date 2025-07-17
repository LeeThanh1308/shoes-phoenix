"use client";

import "quill/dist/quill.snow.css";

import { Button, Image, Input, Radio, Space, Table, Tag } from "antd";
import React, { useMemo, useRef, useState } from "react";

import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { formatCurrencyVND } from "@/services/utils";
import { handleDeleteProduct } from "@/services/redux/Slices/products";
import { useDispatch } from "react-redux";

const ProductTable = ({ data = [], onUpdate = () => null }) => {
  const dispatch = useDispatch();
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
  const expandedRowRender = (record) => {
    if (expandedRowType === "sizes") {
      return (
        <Table
          columns={[
            {
              title: "Size",
              dataIndex: "type",
              sorter: (a, b) => +a.type - +b.type,
              ...getColumnSearchProps("type"),
            },
            {
              title: "Giá vốn",
              dataIndex: "costPrice",
              ...getColumnSearchProps("costPrice"),

              sorter: (a, b) =>
                parseFloat(a.costPrice) - parseFloat(b.costPrice),
              render: (value, _) => (
                <span className=" text-rose-700">
                  {+value > 0
                    ? `${formatCurrencyVND(parseInt(value))}`
                    : "Mặc định"}
                </span>
              ),
            },
            {
              title: "Giá bán",
              dataIndex: "sellingPrice",
              ...getColumnSearchProps("sellingPrice"),

              sorter: (a, b) =>
                parseFloat(a.sellingPrice) - parseFloat(b.sellingPrice),
              render: (value) => (
                <span className=" text-green-700">
                  {+value > 0
                    ? `${formatCurrencyVND(parseInt(value))}`
                    : "Mặc định"}
                </span>
              ),
            },
            {
              title: "Giảm giá",
              dataIndex: "discount",
              key: "discount",

              sorter: (a, b) =>
                parseFloat(a.costPrice) - parseFloat(b.costPrice),
              render: (value) =>
                +value > 0 ? (
                  <span className=" text-blue-700">{value}%</span>
                ) : (
                  `${value}%`
                ),
            },
            {
              title: "Trạng thái",
              dataIndex: "isActive",
              key: "isActive",
              sorter: (a, b) => Number(a.isActive) - Number(b.isActive),
              render: (active) =>
                active ? (
                  <span className="text-green-500">Đang hoạt động</span>
                ) : (
                  <span className="text-rose-500">Ngừng hoạt động</span>
                ),
            },
          ]}
          dataSource={record.sizes}
          pagination={false}
          rowKey="id"
        />
      );
    } else if (expandedRowType === "images") {
      return (
        <div className="flex gap-3 flex-wrap relative">
          {record.images.map((img) => (
            <div
              key={img.id}
              className="relative"
              style={{ textAlign: "center" }}
            >
              <Image
                width={100}
                src={`${process.env.NEXT_PUBLIC_DOMAIN_API}${process.env.NEXT_PUBLIC_PARAM_GET_FILE_API}${img.src}`}
              />
            </div>
          ))}
        </div>
      );
    } else if (expandedRowType === "description") {
      return (
        <div
          className="ql-editor"
          dangerouslySetInnerHTML={{ __html: record.description }}
        />
      );
    }
  };
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
      title: "Giá vốn",
      dataIndex: "costPrice",
      key: "costPrice",
      sorter: (a, b) => parseFloat(a.costPrice) - parseFloat(b.costPrice),
      render: (value) => (
        <span className=" text-rose-700">{`${formatCurrencyVND(
          parseInt(value)
        )}`}</span>
      ),
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
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      sorter: (a, b) => parseFloat(a.discount) - parseFloat(b.discount),
      render: (value) =>
        +value > 0 ? (
          <span className=" text-blue-700">{value}%</span>
        ) : (
          `${value}%`
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active) =>
        active ? (
          <span className="text-green-500">Đang hoạt động</span>
        ) : (
          <span className="text-rose-500">Ngừng hoạt động</span>
        ),
    },
    {
      title: "Thương hiệu",
      dataIndex: ["brand", "name"],
    },
    {
      title: "Đối tượng",
      dataIndex: ["targetGroup", "name"],
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
    },
    {
      title: "Màu sắc",
      dataIndex: "colors",
      render: (colors) => (
        <div className=" flex flex-wrap gap-2">
          {colors.map((color) => (
            <Tag className="mb-2" color={color.hexCode} key={color.id}>
              {color.name}
            </Tag>
          ))}
        </div>
      ),
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
      title: "Ngày cập nhật",
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
            className=" cursor-pointer text-blue-700 hover:text-sky-500"
            onClick={async (e) => {
              onUpdate(record);
            }}
          >
            Sửa
          </span>
          <span
            className=" cursor-pointer text-rose-700 hover:text-rose-500"
            onClick={() => {
              if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?"))
                dispatch(handleDeleteProduct({ id: record?.id }));
            }}
          >
            Delete
          </span>
        </Space>
      ),
    },
  ]);

  return (
    <>
      {/* Nút chọn loại mở rộng */}
      <div className="mb-4 flex gap-2">
        <Radio.Group
          value={expandedRowType}
          onChange={(e) => setExpandedRowType(e.target.value)}
        >
          {fieldExpands.map((_, i) => (
            <Radio.Button key={i} value={_}>
              {" "}
              Hiện {_}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

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
              dispatch(handleDeleteProduct({ ids: idsSelectedRows }));
          }}
          danger
        >
          Xóa nhiều
        </Button>
      </div>
    </>
  );
};

export default ProductTable;
