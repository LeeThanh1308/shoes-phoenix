import "./styles.css";

import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { memo, useEffect, useState } from "react";

function InputQuantitySpinner({
  defaultValue = 1,
  min = 1,
  max = 999,
  onOption = () => {},
  active = true,
  refresh = false,
}) {
  const [quantity, setQuantity] = useState(1);

  const handleChangeQuantity = (value) => {
    if (active && value >= min && value <= max) {
      setQuantity(value);
    }
    return;
  };

  const handleChangeInput = (value) => {
    if (active) {
      if (value < min) {
        setQuantity(min);
      } else if (value > max) {
        setQuantity(max);
      } else {
        setQuantity(value);
      }
    }
  };

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (active && defaultValue != quantity) {
        onOption(quantity);
      }
    }, 200);

    return () => clearTimeout(timerID);
  }, [quantity, active]);

  useEffect(() => {
    if (0 < +defaultValue && Number(defaultValue)) setQuantity(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (refresh) handleChangeInput(quantity);
  }, [refresh]);
  return (
    <div
      className={`flex justify-between items-center border border-gray-300 rounded-lg p-0.5 w-28 select-none ${
        !active && "opacity-25"
      }`}
    >
      <div
        className={` w-1/3 h-full flex justify-center items-center cursor-pointer ${
          quantity == min ? "opacity-55" : "text-black"
        }`}
        onClick={() => handleChangeQuantity(quantity - 1)}
      >
        <IoMdRemove size={20} className=" cursor-pointer" />
      </div>
      <div className=" w-2/3">
        <input
          className=" w-full h-full outline-none px-2 text-center text-black py-1"
          value={quantity}
          type="number"
          min={typeof min == "number" ? min : 0}
          max={typeof max == "number" ? max : 0} // fallback hợp lệ nếu max chưa có
          onChange={(e) => handleChangeInput(+e.target.value)}
        />
      </div>
      <div
        className={` w-1/3 h-full flex justify-center items-center cursor-pointer ${
          quantity == max ? "opacity-55" : "text-black"
        }`}
        onClick={() => handleChangeQuantity(quantity + 1)}
      >
        <IoMdAdd size={20} className=" cursor-pointer" />
      </div>
    </div>
  );
}

export default memo(InputQuantitySpinner);
