"use client";

import { memo, useEffect, useLayoutEffect, useState } from "react";

import GuestRequest from "@/services/axios/GuestRequest";
import Image from "next/image";
import { IoIosCloseCircle } from "react-icons/io";
import IsArray from "./IsArray";

function SearchableDropdown({
  domain = "",
  children,
  onOption = () => null,
  fieldIcon = "",
  fieldColor = "",
  fieldName = "name",
  activeOptions = false,
  defaultOptions = {},
  dataOptions = "",
  warn,
  title,
  ...props
}) {
  const [message, setMessage] = useState();
  const [valueSearch, setValueSearch] = useState("");
  const [showOpt, setShowOpt] = useState(false);
  const [option, setOption] = useState({});
  const [resultSearch, setResultSearch] = useState([]);
  useEffect(() => {
    const timerID = setTimeout(async () => {
      setMessage("");
      if (domain) {
        if (valueSearch) {
          await GuestRequest.get(domain, {
            params: {
              search: valueSearch,
            },
          }).then(
            (response) =>
              Array.isArray(response.data) && setResultSearch(response.data)
          );
        } else {
          setResultSearch([]);
        }
      }
    }, 200);

    return () => clearTimeout(timerID);
  }, [valueSearch]);

  useEffect(() => {
    if (resultSearch.length == 0 && valueSearch) {
      setMessage("Không tìm thấy kết quả nào.");
    }
  }, [resultSearch]);

  useLayoutEffect(() => {
    if (activeOptions && option) {
      setOption({});
    }
  }, [option?.id, activeOptions]);

  useEffect(() => {
    if (defaultOptions?.id) setOption(defaultOptions);
  }, [defaultOptions?.id]);

  useEffect(() => {
    if (Array.isArray(dataOptions)) {
      setResultSearch(dataOptions);
    }
  }, [dataOptions]);

  console.log(resultSearch);
  return (
    <div>
      <div className="relative">
        <label
          htmlFor={title}
          className={`text-xs text-gray-500 ${warn && "text-rose-700"}`}
        >
          {title}
        </label>
        {option?.[fieldName] ? (
          <div
            className={`p-2 rounded-md w-full border border-solid border-blue-700 outline-none placeholder:text-blue-700 z-10 bg-white relative ${props.className}`}
          >
            <p className="text-sm font-medium  text-shadow">
              {option?.[fieldName]}
            </p>
            <div
              className=" absolute top-0 bottom-0 right-2 flex items-center"
              onClick={() => {
                onOption();
                setOption({});
              }}
            >
              <IoIosCloseCircle className=" text-lg hover:text-rose-700 cursor-pointer" />
            </div>
          </div>
        ) : (
          <div onMouseLeave={() => setShowOpt(false)}>
            <input
              {...props}
              type="text"
              id={title}
              value={valueSearch ?? ""}
              className={`p-2 rounded-md w-full border border-solid border-blue-700 outline-none placeholder:text-blue-700 z-10 bg-white ${props.className}`}
              onChange={(e) => {
                setValueSearch(e.target.value);
                setShowOpt(true);
              }}
              onFocus={() => setShowOpt(true)}
              autoFocus={showOpt}
            />
            {showOpt && (valueSearch || dataOptions) && (
              <div className=" absolute top-full rounded-xl right-0 left-0 min-w-28 z-50">
                <IsArray
                  data={resultSearch}
                  renderElse={
                    message &&
                    resultSearch.length == 0 &&
                    valueSearch && (
                      <div className=" bg-white shadow shadow-black mt-2 p-2 rounded-lg">
                        <p className="text-sm font-medium  p-1 rounded-lg">
                          {message}
                        </p>
                      </div>
                    )
                  }
                >
                  <div className=" bg-white shadow mt-2 p-2">
                    {resultSearch.map((_, i) => (
                      <div
                        key={i}
                        className=" flex justify-between items-center gap-2 hover:text-blue-700 hover:shadow shadow-slate-400 rounded-sm cursor-pointer"
                        onClick={() => {
                          onOption(_);
                          setOption(_);
                          setValueSearch("");
                        }}
                      >
                        {fieldIcon && (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_DOMAIN_API}${process.env.NEXT_PUBLIC_PARAM_GET_FILE_API}${_?.[fieldIcon]}`}
                            alt="logo"
                            className=" object-contain"
                            width={25}
                            height={20}
                          />
                        )}
                        {fieldColor && (
                          <div
                            className=" w-5 h-5 rounded-full shadow shadow-black text-shadow ml-2"
                            style={{ backgroundColor: _?.[fieldColor] }}
                          ></div>
                        )}
                        <p
                          className="text-sm font-medium  p-2 text-shadow"
                          style={{ color: _?.[fieldColor] }}
                        >
                          {_?.[fieldName]}
                        </p>
                      </div>
                    ))}{" "}
                  </div>
                </IsArray>
              </div>
            )}
            {children}
          </div>
        )}
      </div>
      {warn && (
        <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
          {warn}
        </p>
      )}
    </div>
  );
}

export default memo(SearchableDropdown);
