"use client";

import React, { useEffect, useState } from "react";

import AuthRequest from "@/services/axios/AuthRequest";
import dynamic from "next/dynamic";

// Dynamic import Pie chart
const Pie = dynamic(() => import("@ant-design/plots").then((mod) => mod.Pie), {
  ssr: false,
});

const PlotMaps = {};

const DemoPie = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    // Dữ liệu giả lập của bạn
    AuthRequest.get("orders/trendings").then((res) => setData(res.data));
  };

  if (!data.length) {
    return null;
  }

  const showTooltip = (evt, pie) => {
    Object.keys(PlotMaps).forEach((plot) => {
      if (plot !== pie) {
        PlotMaps[plot].chart.emit("tooltip:show", {
          data: { data: { area: evt.data.data.area } },
        });
        PlotMaps[plot].chart.emit("element:highlight", {
          data: { data: { area: evt.data.data.area } },
        });
      }
    });
  };

  const hideTooltip = (evt, pie) => {
    Object.keys(PlotMaps).forEach((plot) => {
      if (plot !== pie) {
        PlotMaps[plot].chart.emit("tooltip:hide", {
          data: { data: { area: evt.data.data.area } },
        });
        PlotMaps[plot].chart.emit("element:unhighlight", {
          data: { data: { area: evt.data.data.area } },
        });
      }
    });
  };

  const LeftConfig = {
    angleField: "total",
    colorField: "area",
    data: data,
    label: {
      text: "total",
    },
    legend: true,
    tooltip: {
      title: "area",
    },
    interaction: {
      elementHighlight: true,
    },
    state: {
      inactive: { opacity: 0.5 },
    },
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Pie
        style={{ width: "100%" }}
        {...LeftConfig}
        onReady={(plot) => {
          PlotMaps.leftPie = plot;
          plot.chart.on("interval:pointerover", (evt) => {
            showTooltip(evt, "leftPie");
          });
          plot.chart.on("interval:pointerout", (evt) => {
            hideTooltip(evt, "leftPie");
          });
        }}
      />
    </div>
  );
};
export default DemoPie;
