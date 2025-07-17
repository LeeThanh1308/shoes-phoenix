import {
  capitalizeWords,
  generateUrlImage,
  timeDifference,
} from "@/services/utils";
import {
  commentsSelector,
  handleCreateReplyComment,
} from "@/services/redux/Slices/comments";
import {
  handleChangeRefreshLike,
  handleGetLikeCountOptions,
  handleToggleLike,
  likesSelector,
} from "@/services/redux/Slices/likes";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";

import { FaStar } from "react-icons/fa";
import FallbackImage from "@/components/ui/FallbackImage";
import ReplyComment from "./ReplyComment";
import { TbSend2 } from "react-icons/tb";
import { authSelector } from "@/services/redux/Slices/auth";
import { useRequireLogin } from "@/hooks/useRequireLogin";

function Comments({ data, ...props }) {
  const commentRef = useRef(null);
  const dispatch = useDispatch();
  const requireLogin = useRequireLogin();
  const { onRefresh } = useSelector(commentsSelector);
  const { isAuthenticated } = useSelector(authSelector);
  const { onRefresh: onRefreshLike } = useSelector(likesSelector);
  const [like, setLike] = useState({ count: 0, isLike: false });
  const [value, setValue] = useState("");
  const [showSendComment, setShowSendComment] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (commentRef.current) {
      const { width, height } = commentRef.current?.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [commentRef, showSendComment]);
  const onSubmit = () => {
    if (value)
      requireLogin(() => {
        dispatch(
          handleCreateReplyComment({
            commentID: data.id,
            content: value,
          })
        );
      });
  };
  useEffect(() => {
    if (onRefresh) setValue("");
  }, [onRefresh]);

  useEffect(() => {
    const fetchData = async () => {
      if (onRefreshLike) {
        const resultLike = await dispatch(
          handleGetLikeCountOptions({
            isLogin: isAuthenticated,
            commentID: data.id,
          })
        ).unwrap();
        setLike(resultLike);
      }
    };
    fetchData();
  }, [onRefreshLike]);

  useEffect(() => {
    const fetchData = async () => {
      const resultLike = await dispatch(
        handleGetLikeCountOptions({
          isLogin: isAuthenticated,
          commentID: data.id,
        })
      ).unwrap();
      setLike(resultLike);
    };
    fetchData();
  }, []);

  return (
    <div className="" {...props}>
      <div className="flex items-start gap-2">
        <div className="h-full relative z-10">
          <div className=" rounded-full w-12 h-12 overflow-hidden bg-slate-200 text-white flex-center z-50 relative">
            <FallbackImage
              src={generateUrlImage(data?.account?.avatar) ?? ""}
              alt="avatar"
              fill
              sizes="100vw"
            />
          </div>
          {data?.replies?.length > 0 && (
            <div
              className={`w-0.5 bg-gray-300 mx-auto z-0`}
              style={{
                height: dimensions.height - 48 + "px",
              }}
            ></div>
          )}
        </div>

        <div ref={commentRef} className=" flex flex-col justify-between pb-5">
          <h2 className=" text-base text-slate-700 font-bold mb-0.5">
            {capitalizeWords(data?.account?.fullname)}
          </h2>
          {data?.score && (
            <div className=" flex items-center gap-0.5 text-slate-600 text-base">
              <span>{data?.score}</span>
              <FaStar className="text-orange-500 text-sm" />
            </div>
          )}
          <p className=" font-normal text-base">{data?.content}</p>

          <div className="flex items-center">
            <span className="text-sm text-slate-600 font-medium">
              {timeDifference(data?.createdAt)}
            </span>
            <div className=" w-1 h-1 rounded-full bg-gray-400 mx-1.5"></div>
            <span
              className={`text-sm font-medium cursor-pointer ${
                like?.isLike ? "text-blue-700" : "text-slate-600"
              }`}
              onClick={() => {
                requireLogin(async () => {
                  await dispatch(
                    handleToggleLike({ commentID: data.id })
                  ).unwrap();
                });
              }}
            >
              {like?.count} {like?.isLike ? "Đã thích" : "Thích"}
            </span>
            <div className=" w-1 h-1 rounded-full bg-gray-400 mx-1.5"></div>
            <span
              onClick={() => setShowSendComment(!showSendComment)}
              className=" cursor-pointer font-bold text-sm text-blue-700"
            >
              {showSendComment ? "Đóng" : "Trả lời"}
            </span>
          </div>
          {showSendComment && (
            <div className=" rounded-lg w-full  border border-blue-500 relative flex justify-between items-center">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-1 outline-none"
                placeholder="Nhập bình luận của bạn"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSubmit();
                  }
                }}
              ></input>
              <div
                onClick={() => onSubmit()}
                className={`h-full aspect-square flex justify-center items-center p-1 cursor-pointer ${
                  !value && `!opacity-25`
                }`}
              >
                <TbSend2 size={28} className=" text-blue-700 hover:scale-75" />
              </div>
            </div>
          )}
        </div>
      </div>
      {data.replies &&
        data?.replies?.map((item, index) => (
          <ReplyComment
            data={item}
            commentID={data.id}
            branch={index < data?.replies?.length - 1}
            key={index}
          />
        ))}
    </div>
  );
}

export default Comments;
