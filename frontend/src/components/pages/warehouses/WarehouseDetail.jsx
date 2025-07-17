"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
} from "antd";
import React, { memo, useEffect, useState } from "react";
import {
  handleGetInventory,
  handleGetStockMovements,
  handleGetSummaryReport,
  warehousesSelector,
} from "@/services/redux/Slices/warehouses";
import { useDispatch, useSelector } from "react-redux";

import dayjs from "dayjs";
import { formatCurrencyVND } from "@/services/utils";

const { RangePicker } = DatePicker;
const { Option } = Select;

function WarehouseDetail({ warehouseId }) {
  const dispatch = useDispatch();
  const { inventory, movements, summaryReport, isLoading } =
    useSelector(warehousesSelector);
  const [activeTab, setActiveTab] = useState("inventory");
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    if (warehouseId) {
      console.log(warehouseId);
      // dispatch(handleGetInventory(warehouseId));
    }
  }, [warehouseId, dispatch]);

  useEffect(() => {
    if (warehouseId && dateRange.length === 2) {
      dispatch(
        handleGetSummaryReport({
          warehouseId,
          params: {
            from: dayjs(dateRange[0]).format("YYYY-MM-DD"),
            to: dayjs(dateRange[1]).format("YYYY-MM-DD"),
          },
        })
      );
    }
  }, [warehouseId, dateRange]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "movements" && warehouseId) {
      dispatch(handleGetStockMovements(warehouseId));
    }
  };

  const inventoryColumns = [
    {
      title: "Sản phẩm",
      dataIndex: ["product", "name"],
      key: "productName",
    },
    {
      title: "Màu sắc",
      dataIndex: ["color", "name"],
      key: "colorName",
    },
    {
      title: "Kích thước",
      dataIndex: ["size", "name"],
      key: "sizeName",
    },
    {
      title: "Số lượng tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => (
        <Tag color={quantity > 10 ? "green" : quantity > 5 ? "orange" : "red"}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: "Giá nhập",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (price) => formatCurrencyVND(price),
    },
    {
      title: "Giá bán",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (price) => formatCurrencyVND(price),
    },
    {
      title: "Tổng giá trị",
      key: "totalValue",
      render: (_, record) =>
        formatCurrencyVND(record.quantity * record.costPrice),
    },
  ];

  const movementsColumns = [
    {
      title: "Ngày",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const typeConfig = {
          receive: {
            color: "green",
            text: "Nhập kho",
            icon: <ArrowUpOutlined />,
          },
          issue: {
            color: "red",
            text: "Xuất kho",
            icon: <ArrowDownOutlined />,
          },
          transfer: {
            color: "blue",
            text: "Chuyển kho",
            icon: <SwapOutlined />,
          },
        };
        const config = typeConfig[type] || { color: "default", text: type };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Sản phẩm",
      dataIndex: ["product", "name"],
      key: "productName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <span style={{ color: record.type === "receive" ? "green" : "red" }}>
          {record.type === "receive" ? "+" : "-"}
          {quantity}
        </span>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
  ];

  const tabs = [
    {
      key: "inventory",
      label: "Tồn kho",
      children: (
        <Table
          columns={inventoryColumns}
          dataSource={inventory}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      ),
    },
    {
      key: "movements",
      label: "Lịch sử giao dịch",
      children: (
        <Table
          columns={movementsColumns}
          dataSource={movements}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      ),
    },
    {
      key: "reports",
      label: "Báo cáo",
      children: (
        <div>
          <div className="mb-4">
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </div>

          {summaryReport && (
            <Row gutter={16} className="mb-6">
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng nhập"
                    value={summaryReport.totalReceived || 0}
                    prefix={<ArrowUpOutlined style={{ color: "green" }} />}
                    valueStyle={{ color: "green" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng xuất"
                    value={summaryReport.totalIssued || 0}
                    prefix={<ArrowDownOutlined style={{ color: "red" }} />}
                    valueStyle={{ color: "red" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng chuyển"
                    value={summaryReport.totalTransferred || 0}
                    prefix={<SwapOutlined style={{ color: "blue" }} />}
                    valueStyle={{ color: "blue" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tồn kho hiện tại"
                    value={summaryReport.currentStock || 0}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Card title="Biểu đồ thống kê">
            <p>Biểu đồ sẽ được hiển thị ở đây</p>
            {/* Có thể thêm Chart.js hoặc Ant Design Charts ở đây */}
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Chi tiết kho hàng</h2>
        <div className="flex space-x-4">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              type={activeTab === tab.key ? "primary" : "default"}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {tabs.find((tab) => tab.key === activeTab)?.children}
      </div>
    </div>
  );
}

export default memo(WarehouseDetail);
