import { DatePicker, Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import {
  formatCurrencyVND,
  formatPrice,
  getStartAndEndOfMonth,
  getStartAndEndOfYear,
} from "@/services/utils";
import { useDispatch, useSelector } from "react-redux";

import AuthRequest from "@/services/axios/AuthRequest";
import ReactDOM from "react-dom";
import { branchesSelector } from "@/services/redux/Slices/branches";
import dynamic from "next/dynamic";
import { handleChangeLoadingApp } from "@/services/redux/Slices/bootstrap";

const { RangePicker } = DatePicker;
const Line = dynamic(
  () => import("@ant-design/plots").then((mod) => mod.Line),
  { ssr: false }
);
const RevenueStatistics = () => {
  const dispatch = useDispatch();
  const { thisBranches = [] } = useSelector(branchesSelector);
  const [data, setData] = useState([]);
  const [customDate, setCustomDate] = useState([]);
  const [option, setOptions] = useState("month");
  useEffect(() => {
    dispatch(handleChangeLoadingApp(true));
    asyncFetch();
  }, [option]);

  useEffect(() => {
    if (customDate?.length == 2) {
      asyncFetch();
    }
  }, [customDate]);

  const { expense, revenue, netProfit, quantity } = useMemo(() => {
    return Array.isArray(data)
      ? data?.reduce(
          (acc, _) => {
            if (_?.type == "Chi phí") acc.expense += _?.value;
            if (_?.type == "Doanh thu") acc.revenue += _?.value;
            if (_?.type == "Lợi nhuận ròng") acc.netProfit += _?.value;
            if (_?.type == "Số lượng") acc.quantity += _?.value;
            return acc;
          },
          {
            expense: 0, // Chi phí
            revenue: 0, // Doanh thu
            netProfit: 0, // Lợi nhuận ròng
            quantity: 0, // Số lượng
          }
        )
      : {
          expense: 0, // Chi phí
          revenue: 0, // Doanh thu
          netProfit: 0, // Lợi nhuận ròng
          quantity: 0, // Số lượng
        };
  }, [data]);

  const asyncFetch = async () => {
    const queryOptions = {};
    if (option != "customs") {
      setCustomDate([]);
    }
    if (option == "month") {
      const { start, end } = getStartAndEndOfMonth();
      queryOptions.startDate = start.getTime();
      queryOptions.endDate = end.getTime();
    } else if (option == "year") {
      const { start, end } = getStartAndEndOfYear();
      queryOptions.startDate = start.getTime();
      queryOptions.endDate = end.getTime();
    } else if (option == "customs" && customDate?.length == 2) {
      const [a, b] = customDate;
      queryOptions.startDate = a;
      queryOptions.endDate = b;
    }
    if (Number(option)) {
      queryOptions.branchID = Number(option);
    }
    await AuthRequest.get("orders/revenues", {
      params: queryOptions,
    }).then((response) => setData(response.data ?? []));
    dispatch(handleChangeLoadingApp(false));
  };

  const config = {
    data,
    xField: "date",
    yField: "value",
    colorField: "type",
    axis: {
      y: {
        labelFormatter: (v) => formatCurrencyVND(v),
      },
    },
    scale: {
      color: {
        range: ["#FF6F61", "#4CAF50", "#2196F3", "#FFC107"],
      },
    },
    style: {
      lineWidth: 2,
      lineDash: (data) => {
        if (data[0].type === "register") return [4, 4];
      },
    },
    tooltip: {
      channel: "y",
      valueFormatter: (price) => formatPrice(price),
    },
  };

  return (
    <div className="p-3">
      <div className=" flex justify-between">
        <h1 className=" text-2xl text-rose-500">Thống kê doanh thu</h1>

        <div className=" flex gap-2">
          {option == "customs" && (
            <RangePicker
              onChange={(value, dateString) => {
                const [a, b] = dateString;
                setCustomDate([new Date(a).getTime(), new Date(b).getTime()]);
              }}
            />
          )}
          <Select
            defaultValue={"all"}
            className=" w-48"
            onChange={setOptions}
            options={[
              { value: "all", label: "Tất cả cơ sở" },
              ...thisBranches.map((_) => ({
                value: _?.id,
                label: _.name,
              })),
            ]}
          />
          <Select
            defaultValue={option}
            className=" w-48"
            onChange={setOptions}
            options={[
              { value: "month", label: "Tháng hiện tại" },
              { value: "year", label: "Năm nay" },
              { value: "all", label: "Tất cả thời gian" },
              { value: "customs", label: "Chọn khoảng thời gian" },
            ]}
          />
        </div>
      </div>
      {data?.length == 0 && (
        <h1 className=" text-shadow text-2xl  text-center py-3">
          Không có dữ liệu.
        </h1>
      )}
      <Line {...config} />
      <div className="flex justify-between  font-bold">
        <div className="text-rose-500">
          <h1>Tổng chi phí</h1>
          <span className="">{formatCurrencyVND(expense)}</span>
        </div>
        <div className="text-green-500">
          <h1>Tổng doanh thu</h1>
          <span className="">{formatCurrencyVND(revenue)}</span>
        </div>
        <div className="text-blue-500">
          <h1>Tổng lợi nhận ròng</h1>
          <span className="">{formatCurrencyVND(netProfit)}</span>
        </div>
        <div className="text-yellow-500">
          <h1>Tổng số lượng</h1>
          <span className="">{quantity}</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueStatistics;
