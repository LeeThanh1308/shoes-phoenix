"use client";

import { useEffect, useLayoutEffect, useState } from "react";

function FormOtp({
  leng,
  placeholder = "*",
  classx,
  getValue = () => null,
  clickRefresh = () => null,
  onEnter = () => null,
  onExpired = () => null,
  totalVerify,
  expRefresh,
  textBtnSuccess = "Xác minh",
  props,
}) {
  const arr = new Array(Number(leng) || 6).fill(null);
  const [warn, setWarn] = useState("");
  const [timeResend, setTimeResend] = useState();
  const [total, setTotal] = useState();

  useLayoutEffect(() => {
    setTimeResend(expRefresh);
    setTotal(totalVerify);
  }, [totalVerify, expRefresh]);

  const handleSetCode = (e, index) => {
    setWarn("");
    console.table({ key: e.key, index });
    const div = e?.target.closest("div").querySelectorAll("input");
    if (e.keyCode === 8) {
      e.preventDefault();
      if (div[index].value) {
        div[index].value = "";
      } else {
        if (index !== 0) div[index - 1].focus();
      }
    } else if (e.keyCode === 13) {
      const value = handleSubmitForm(e);
      if (value) {
        onEnter(value);
      }
    } else if (index < div.length && e.key >= 0 && e.key <= 9) {
      if (index === div.length - 1 && div[index].value) {
        div[index].classList.remove("border-red-500");
        // div[index]?.blur();
      } else {
        div[index + 1]?.focus();
        div[index].value = e.key;
        div[index].classList.remove("border-red-500");
      }
    } else {
      e.preventDefault();
    }
  };

  const handleSubmitForm = (e) => {
    const Input = e?.target?.closest("div")?.querySelectorAll("input") || [];
    const value = [...Input]
      .map((it, i) => {
        if (it.value) {
          it.classList?.remove("border-red-500");
          return it.value;
        } else {
          it.classList?.add("border-red-500");
        }
      })
      .join("");
    if (value.length === arr.length) {
      setWarn("");
      return value;
    } else {
      setWarn("Mã xác minh không được để trống");
      return false;
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const Input = e?.target?.closest("div")?.querySelectorAll("input") || [];
    const dataCode = e.clipboardData
      .getData("Text")
      ?.replace(/\D/g, "")
      ?.split("")
      .slice(0, arr.length);
    if (dataCode)
      dataCode.map((code, i) => {
        if (Number(code) >= 0 && Number(code) <= 9) {
          // console.log({ code: Number(code), i });
          Input[i].value = code;
        }
      });
  };
  useLayoutEffect(() => {
    const timeId = setInterval(() => {
      setTimeResend((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(timeId);
          onExpired();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timeId);
  }, [timeResend]);
  return (
    <div className="my-4">
      <div className="flex justify-center">
        {arr.map((it, i) => {
          return (
            <input
              onKeyUp={(e) => handleSetCode(e, i)}
              onKeyDown={(e) => {
                e.preventDefault();
              }}
              onPaste={handlePaste}
              key={i}
              maxLength={1}
              className={`w-10 h-10 text-center mx-1 border cursor-pointer  shadow-sm rounded-sm ${classx}`}
              placeholder={placeholder}
              disabled={total ? null : "disabled"}
            />
          );
        })}
      </div>
      {warn ? <p className=" text-red-500 text-sm">{warn}</p> : null}
      <button
        className={`-px-6 w-4/5 py-1 mt-2 rounded-md ${
          total > 0
            ? "hover:opacity-75 bg-sky-500 text-slate-50"
            : "text-rose-500 image-shadow"
        }`}
        onClick={(e) => {
          const value = handleSubmitForm(e);
          if (value) {
            getValue(value);
          }
        }}
        disabled={!total}
      >
        {total > 0
          ? `${textBtnSuccess} (${totalVerify})`
          : "Bạn đã nhập sai thông tin 3 lần. Vui lòng ấn gửi lại mã xác minh."}
      </button>

      {timeResend ? (
        <p
          className={`py-1 mt-2 rounded-md text-green-500 text-center image-shadow `}
        >
          Gửi lại sau {timeResend + "s"}
        </p>
      ) : (
        <button
          className={`-px-6 w-4/5 py-1 mt-2  text-center rounded-md ${
            timeResend
              ? "text-green-500 "
              : "hover:opacity-75 text-slate-50 border bg-green-500"
          }`}
          onClick={clickRefresh}
          disabled={timeResend}
        >
          Bạn chưa nhận được mã? Gửi lại {timeResend ? `${timeResend}s` : null}
        </button>
      )}
    </div>
  );
}

export default FormOtp;
