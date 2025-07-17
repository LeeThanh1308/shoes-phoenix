"use client";

import {
  commentsSelector,
  handleCreateComment,
} from "@/services/redux/Slices/comments";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { Button } from "antd";
import FallbackImage from "@/components/ui/FallbackImage";
import { TbSend2 } from "react-icons/tb";
import TextArea from "antd/es/input/TextArea";
import { generateUrlImage } from "@/services/utils";
import { useRequireLogin } from "@/hooks/useRequireLogin";

function SendComment({ src = "", fieldComment = {} }) {
  const { onRefresh } = useSelector(commentsSelector);
  const requireLogin = useRequireLogin();
  const [value, setValue] = useState();
  const [warn, setWarn] = useState();
  const dispatch = useDispatch();

  const handleSubmit = () => {
    if (!value) {
      setWarn("Trường này không được để trống.");
    } else {
      requireLogin(() => {
        dispatch(handleCreateComment({ content: value, ...fieldComment }));
      });
    }
  };

  useEffect(() => {
    if (onRefresh) setValue("");
  }, [onRefresh]);
  return (
    <div>
      <label htmlFor="sendComment">Gửi bình luận</label>
      <div className=" rounded-lg w-full relative flex justify-between items-center">
        <TextArea
          id="sendComment"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-1 outline-none"
          placeholder="Hãy viết lên suy nghĩ của bạn..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        ></TextArea>
        <div
          onClick={() => handleSubmit()}
          className={`h-full aspect-square flex justify-center items-center p-1 ${
            !value
              ? `!opacity-25 !cursor-not-allowed`
              : `hover:scale-75 !cursor-pointer`
          }`}
        >
          <TbSend2 size={28} className=" text-blue-700" />
        </div>
      </div>
    </div>
  );
}

export default SendComment;
