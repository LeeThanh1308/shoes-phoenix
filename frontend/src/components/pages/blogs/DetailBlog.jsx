"use client";

import { Breadcrumb, Button } from "antd";
import { FaCircleCheck, FaMagnifyingGlass } from "react-icons/fa6";
import {
  blogsSelector,
  handleChangeRefreshBlog,
  handleGetDetailBlog,
} from "@/services/redux/Slices/blogs";
import {
  commentsSelector,
  handleGetWhereComments,
} from "@/services/redux/Slices/comments";
import { generateUrlImage, timeDifference } from "@/services/utils";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useLayoutEffect } from "react";

import Comments from "@/components/sections/Comments";
import { FaHeart } from "react-icons/fa";
import FallbackImage from "@/components/ui/FallbackImage";
import Link from "next/link";
import Responsive from "@/components/layout/Responsive";
import SendComment from "@/components/sections/Comments/SendComment";
import { authSelector } from "@/services/redux/Slices/auth";
import { handleToggleLike } from "@/services/redux/Slices/likes";
import { useParams } from "next/navigation";
import { useRequireLogin } from "@/hooks/useRequireLogin";

function DetailBlog() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const requireLogin = useRequireLogin();
  const { blog, onRefresh: onRefreshBlog } = useSelector(blogsSelector);
  const { isAuthenticated } = useSelector(authSelector);
  const { comments = [], onRefresh: onRefreshComments } =
    useSelector(commentsSelector);
  useLayoutEffect(() => {
    if (slug) dispatch(handleGetDetailBlog({ isLogin: isAuthenticated, slug }));
  }, [onRefreshBlog, slug]);

  useEffect(() => {
    if (blog?.id) dispatch(handleGetWhereComments({ blogID: blog.id }));
  }, [blog?.id, onRefreshComments]);
  return (
    <div className="">
      <Responsive>
        <div className="pt-2">
          <Breadcrumb
            items={[
              {
                title: <Link href={"/"}>Trang chủ</Link>,
              },
              {
                title: <Link href={"/blogs"}>Tin tức</Link>,
              },
              {
                title: blog?.title,
              },
            ]}
          />
        </div>
        <div className="w-full h-full">
          <div className="mt-4 mb-3 sticky top-0 z-10">
            <div className="w-full bg-white mx-auto px-3 py-4 flex items-center justify-between">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full mr-3 relative overflow-hidden">
                  <FallbackImage
                    alt="image"
                    src={generateUrlImage(blog?.avatar ?? "")}
                    fill
                    sizes="100vw"
                  />
                </div>
                <div className="">
                  <div className=" font-bold text-sm flex items-center gap-1">
                    {blog?.fullname}
                    <FaCircleCheck
                      icon="fa-solid fa-circle-check"
                      className=" text-xs ml-0.5 text-sky-500"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {timeDifference(blog?.createdAt)}
                  </div>
                </div>
              </div>

              <div
                className=" text-sm flex flex-col justify-center items-center"
                onClick={async (e) => {
                  e.preventDefault();
                  requireLogin(async () => {
                    await dispatch(
                      handleToggleLike({ blogID: blog?.id })
                    ).unwrap();
                    dispatch(handleChangeRefreshBlog(true));
                  });
                }}
              >
                <FaHeart
                  className={`hover:cursor-pointer hover:opacity-85 ${
                    blog?.isLike ? "text-red-500" : "text-white text-shadow"
                  }`}
                  size={20}
                />
                <span>{blog?.countLike}</span>
              </div>
            </div>
          </div>
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: blog?.description }}
          ></div>

          <div className="mt-8 text-lg font-semibold rounded-sm p-3 shadow-sm z-0">
            <div className="">
              <SendComment
                fieldComment={{
                  blogID: +blog?.id,
                }}
              />
            </div>

            <div className="my-3">
              {Array.isArray(comments) &&
                comments?.map((_, key) => {
                  return <Comments data={_} key={key} />;
                })}
            </div>
          </div>
        </div>
      </Responsive>
    </div>
  );
}

export default DetailBlog;
