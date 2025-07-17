"use client";

import { formatCurrencyVND, formatPrice, parsePrice } from "@/services/utils";
import { useEffect, useState } from "react";

import { Slider } from "antd";

function FilterTypeSliderRange({
  title = "Giá",
  min = 0,
  max = 1000000000,
  onOption = () => null,
}) {
  const [value, setValue] = useState([min, max]);
  const [valueMin, setValueMin] = useState("");
  const [valueMax, setValueMax] = useState("");

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (valueMin)
        setValue((prev) => {
          const [a, b] = [...prev];
          return [valueMin, b];
        });
    }, 2000);
    return () => clearTimeout(timerID);
  }, [valueMin]);

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (valueMax)
        setValue((prev) => {
          const [a, b] = [...prev];
          return [a, valueMax];
        });
    }, 2000);
    return () => clearTimeout(timerID);
  }, [valueMax]);

  useEffect(() => {
    const timerID = setTimeout(() => {
      onOption(value);
    }, 500);

    return () => clearTimeout(timerID);
  }, [value]);
  return (
    <div className=" border-b border-slate-200 pb-3">
      <div className=" font-medium text-base py-2 cursor-pointer flex items-center justify-between">
        <h1>{title}</h1>
      </div>

      <div className="">
        <Slider
          min={min}
          max={max}
          range
          value={value}
          defaultValue={[min, max]}
          tooltip={{
            formatter: (value) => formatCurrencyVND(value),
          }}
          onChange={setValue}
        />
      </div>
      <div className=" flex justify-between">
        <div className="flex-[0.5] group">
          <p className="font-bold text-blue-700 group-hover:hidden">
            {formatCurrencyVND(value?.[0])}
          </p>
          <input
            className={`w-full outline-none hidden group-hover:block rounded-sm hover:border focus:pl-2 border-blue-700`}
            type="text"
            placeholder="Giá tối thiểu"
            value={formatPrice(valueMin || "")}
            onChange={(e) => {
              const value = parsePrice(e.target.value);
              if (value >= min && value <= max) {
                setValueMin(value);
              }
            }}
          />
        </div>

        <div className="flex-[0.5] group">
          <p className="font-bold text-blue-700 group-hover:hidden text-end">
            {formatCurrencyVND(value?.[1])}
          </p>
          <input
            className={`w-full outline-none hidden group-hover:block rounded-sm hover:border focus:pl-2 border-blue-700`}
            type="text"
            placeholder="Giá tối đa"
            value={formatPrice(valueMax || "")}
            onChange={(e) => {
              const value = parsePrice(e.target.value);
              if (value >= min && value <= max) {
                setValueMax(value);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default FilterTypeSliderRange;
