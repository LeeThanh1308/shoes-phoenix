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
  handleGetLikeCountOptions,
  handleToggleLike,
  likesSelector,
} from "@/services/redux/Slices/likes";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

import FallbackImage from "@/components/ui/FallbackImage";
import { TbSend2 } from "react-icons/tb";
import { authSelector } from "@/services/redux/Slices/auth";
import { useRequireLogin } from "@/hooks/useRequireLogin";

function ReplyComment({ branch, commentID, data, ...props }) {
  const dispatch = useDispatch();
  const requireLogin = useRequireLogin();
  const { onRefresh } = useSelector(commentsSelector);
  const { isAuthenticated } = useSelector(authSelector);
  const { onRefresh: onRefreshLike } = useSelector(likesSelector);
  const [like, setLike] = useState({ count: 0, isLike: false });
  const commentRef = useRef(null);
  const [value, setValue] = useState("");
  const [showSendComment, setShowSendComment] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const onSubmit = () => {
    if (value) {
      requireLogin(() => {
        dispatch(
          handleCreateReplyComment({
            commentID: commentID,
            accountReplyID: data?.account?.id,
            content: value,
          })
        );
      });
    }
  };
  useEffect(() => {
    if (commentRef.current) {
      const { width, height } = commentRef.current?.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [commentRef, showSendComment]);

  useEffect(() => {
    if (onRefresh) setValue("");
  }, [onRefresh]);

  useEffect(() => {
    const fetchData = async () => {
      if (onRefreshLike) {
        const resultLike = await dispatch(
          handleGetLikeCountOptions({
            isLogin: isAuthenticated,
            replyID: data.id,
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
          replyID: data.id,
        })
      ).unwrap();
      setLike(resultLike);
    };
    fetchData();
  }, []);
  return (
    <div className="flex items-start gap-2 relative" {...props}>
      <div className="h-full relative z-10">
        <div className="w-12 h-12 flex justify-end">
          <div className="w-1/2 h-1/2 border-l-2 mr-px border-b-2 border-gray-300 rounded-bl-lg"></div>
        </div>
        {branch && (
          <div
            className={`w-0.5 bg-gray-300 mx-auto z-0 -mt-12`}
            style={{
              height: dimensions.height + "px",
            }}
          ></div>
        )}
      </div>

      <div className="h-full z-10">
        <div className="w-12 h-12 bg-slate-200 text-white flex-center z-50 rounded-full overflow-hidden relative">
          <FallbackImage
            src={generateUrlImage(data?.account?.avatar) ?? ""}
            alt="avatar"
            fill
            sizes="100vw"
          />
        </div>
      </div>

      <div ref={commentRef} className=" flex flex-col justify-between pb-5">
        <h2 className=" text-base text-slate-700 font-bold mb-0.5">
          {capitalizeWords(data?.account?.fullname)}
        </h2>
        <div className=" font-normal text-base flex gap-1">
          {data?.accountReply?.fullname && (
            <span className=" font-bold">{data?.accountReply?.fullname}</span>
          )}
          <p>{data?.content}</p>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-slate-600 font-medium">
            {timeDifference(data?.createdAt)}
          </span>
          <div className=" w-1 h-1 rounded-full bg-gray-400 mx-1.5"></div>
          <span
            className={`text-sm font-medium cursor-pointer ${
              like?.isLike ? "text-blue-700" : "text-slate-600"
            }`}
            onClick={async () => {
              requireLogin(() => {
                dispatch(handleToggleLike({ replyID: data.id })).unwrap();
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
  );
}

export default ReplyComment;
