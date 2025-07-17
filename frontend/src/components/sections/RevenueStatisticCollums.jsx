import { DatePicker, Select } from "antd";
import React, { useEffect, useState } from "react";
import { getStartAndEndOfMonth, getStartAndEndOfYear } from "@/services/utils";

import AuthRequest from "@/services/axios/AuthRequest";
import ReactDOM from "react-dom";
import dynamic from "next/dynamic";
import { handleChangeLoadingApp } from "@/services/redux/Slices/bootstrap";
import { useDispatch } from "react-redux";

const { RangePicker } = DatePicker;
// Dynamic import Bar, Column
const Bar = dynamic(() => import("@ant-design/plots").then((mod) => mod.Bar), {
  ssr: false,
});
const Column = dynamic(
  () => import("@ant-design/plots").then((mod) => mod.Column),
  { ssr: false }
);
const RevenueStatisticCollums = () => {
  const dispatch = useDispatch();
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [customDate, setCustomDate] = useState([]);
  const [option, setOptions] = useState("month");
  useEffect(() => {
    dispatch(handleChangeLoadingApp(true));
    asyncFetch();
  }, [option, limit]);

  useEffect(() => {
    if (customDate?.length == 2) {
      asyncFetch();
    }
  }, [customDate]);

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
    await AuthRequest.get("orders/trendings", {
      params: {
        ...queryOptions,
        limit,
      },
    }).then((response) => setData(response.data ?? []));
    dispatch(handleChangeLoadingApp(false));
  };

  const config = {
    data,
    lable: true,
    xField: "name",
    yField: "total",
    onReady: ({ chart }) => {
      try {
        const { height } = chart._container.getBoundingClientRect();
        const tooltipItem = data[Math.floor(Math.random() * data.length)];
        chart.on(
          "afterrender",
          () => {
            chart.emit("tooltip:show", {
              data: {
                data: tooltipItem,
              },
              offsetY: height / 2 - 60,
            });
          },
          true
        );
      } catch (e) {
        console.error(e);
      }
    },
  };
  return (
    <div className="p-3">
      <div className=" flex justify-between">
        <h1 className=" text-2xl text-rose-500">Thống kê sản phẩm bán chạy</h1>

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
            defaultValue={option}
            onChange={setOptions}
            options={[
              { value: "month", label: "Tháng hiện tại" },
              { value: "year", label: "Năm nay" },
              { value: "all", label: "Tất cả thời gian" },
              { value: "customs", label: "Chọn khoảng thời gian" },
            ]}
          />
          <Select
            defaultValue={limit}
            style={{ width: 120 }}
            onChange={setLimit}
            options={[
              { value: 10, label: 10 },
              { value: 20, label: 20 },
              { value: 30, label: 30 },
              { value: 40, label: 40 },
              { value: 50, label: 50 },
            ]}
          />
        </div>
      </div>
      {data?.length == 0 && (
        <h1 className=" text-shadow text-2xl  text-center py-3">
          Không có dữ liệu.
        </h1>
      )}
      <Bar {...config} />
    </div>
  );
};

export default RevenueStatisticCollums;
