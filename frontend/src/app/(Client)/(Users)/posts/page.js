"use client";

import { Breadcrumb, Button, Space } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  blogsSelector,
  handleCreateBlog,
  handleDeleteBlog,
  handleDeleteMyBlog,
  handleGetBlogs,
  handleGetMyBlogs,
  handleUpdateBlog,
  handleUpdateMyBlog,
} from "@/services/redux/Slices/blogs";
import {
  generateUrlImage,
  handleRegexSlug,
  timeDifference,
} from "@/services/utils";
import { useDispatch, useSelector } from "react-redux";

import FallbackImage from "@/components/ui/FallbackImage";
import FormPopup from "@/components/sections/FormPopup";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import Link from "next/link";
import Responsive from "@/components/layout/Responsive";
import RichTextEditor from "@/components/sections/RichTextEditor";
import { blogSchema } from "@/services/schema/blogSchema";
import { useForm } from "react-hook-form";
import useRequireAuth from "@/hooks/useRequireAuth";
import { zodResolver } from "@hookform/resolvers/zod";

function BlogPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(blogSchema),
  });
  const dispatch = useDispatch();
  const editorRef = useRef(null); // Ref for RichTextEditor
  const { blogs, validators, onRefresh } = useSelector(blogsSelector);
  const [showFormCreated, setShowFormCreated] = useState(false);
  const [showFormUpdated, setShowFormUpdated] = useState(false);
  const onSubmit = useCallback(
    (data) => {
      console.log(data);
      if (showFormCreated) dispatch(handleCreateBlog(data));
      if (showFormUpdated) dispatch(handleUpdateMyBlog(data));
    },
    [showFormCreated, showFormUpdated]
  );

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (blogs?.length == 0) dispatch(handleGetMyBlogs());
    }, 200);
    return () => clearTimeout(timerID);
  }, [blogs?.length]);

  useEffect(() => {
    Object.entries(validators).forEach(([field, message]) => {
      setError(field, { type: "server", message });
    });
  }, [validators]);

  useEffect(() => {
    const title = watch("title") || "";
    if (typeof title == "string") {
      setValue("slug", handleRegexSlug(title));
      clearErrors("slug");
    }
  }, [watch("title")]);

  useEffect(() => {
    if (onRefresh) {
      reset();
      setShowFormCreated(false);
      setShowFormUpdated(false);
      dispatch(handleGetMyBlogs());
    }
  }, [onRefresh]);
  return (
    <div className="w-full h-full z-10 text-black relative ">
      <Responsive>
        <div className="pb-3 pt-2">
          <Breadcrumb
            items={[
              {
                title: <Link href={"/"}>Trang chủ</Link>,
              },
              {
                title: "Bài viết của bạn",
              },
            ]}
          />
        </div>
        <div className="pb-6 z-0">
          <div className="flex justify-between items-center">
            <div className="mb-4 font-bold text-5xl text-rose-700">
              <span>Bài viết của bạn </span>
            </div>
            <div
              className="font-bold rounded bg-green-500 p-2 px-3 text-white text-lg hover:bg-green-400 cursor-pointer"
              onClick={(e) => setShowFormCreated(true)}
            >
              Thêm bài viết +
            </div>
          </div>
          <div className=" flex flex-col gap-2">
            {blogs?.map((_, i) => {
              return (
                <Link href={`/blogs/${_?.slug}-${_?.id}`} key={i}>
                  <div className="p-3 shadow-sm shadow-black flex justify-between items-center rounded-lg ">
                    <div className=" flex-[0.8] flex items-center gap-2">
                      <div className="w-16 h-16 rounded-full relative shrink-0 overflow-hidden">
                        <FallbackImage
                          src={_?.avatar ? generateUrlImage(_?.avatar) : ""}
                          fill
                          sizes="100vw"
                          alt="logo"
                        />
                      </div>
                      <div>
                        <h1 className=" font-bold text-xl line-clamp-3">
                          {_?.title}
                        </h1>
                        <h1 className="font-bold ">
                          {timeDifference(_?.createdAt)}
                        </h1>
                      </div>
                    </div>

                    <div
                      className=" text-sm flex justify-center items-center"
                      onClick={async (e) => {
                        e.preventDefault();
                      }}
                    >
                      <Space size="middle">
                        <Button
                          type="primary"
                          className=" border border-sky-500 text-sky-500"
                          onClick={(e) => {
                            Object.entries(_).forEach(([field, message]) => {
                              if (
                                (field && typeof message === "boolean") ||
                                message
                              )
                                setValue(field, message);
                            });
                            setShowFormUpdated(true);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          danger
                          className=" cursor-pointer hover:bg-red-500"
                          onClick={(e) => {
                            let result = window.confirm(
                              "Bạn chắc chắn muốn xoá bài viết " + _.title
                            );
                            if (result) {
                              dispatch(handleDeleteMyBlog(_.id));
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Space>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Responsive>

      <FormPopup
        title="Sửa bài viết"
        isShowForm={showFormUpdated}
        onClose={(state) => {
          reset();
          setShowFormUpdated(state);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFormAdmin
            className={!errors.title?.message ? null : "!border-red-500"}
            title={"Tên bài viết"}
            warn={errors.title?.message}
            type="text"
            placeholder="Tên bài viết"
            {...register("title")}
          />

          <InputFormAdmin
            type="text"
            title={"Slug"}
            placeholder="Slug"
            {...register("slug")}
            warn={errors.slug?.message}
            className={!errors.slug?.message ? null : "!border-red-500"}
          />
          <div className="mt-2 col-span-4">
            <InputFormAdmin
              className={`hidden ${
                errors.description?.message ? "!border-red-500" : null
              }`}
              title="Mô tả sản phẩm"
              warn={errors.description?.message}
              value={editorRef?.current ? editorRef?.current?.getContent() : ""}
              type="text"
              placeholder="Mô tả sản phẩm"
              {...register("description")}
            />
            <RichTextEditor
              value={watch("description")}
              onChange={(content) => setValue("description", content)}
              ref={editorRef}
            />
          </div>
          <div className="mt-4 mb-3 w-11/12 mx-auto">
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-1 rounded-md hover:opacity-75 bg-sky-500 text-white font-bold"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </form>
      </FormPopup>

      <FormPopup
        title="Thêm bài viết"
        isShowForm={showFormCreated}
        onClose={(state) => {
          reset();
          setShowFormCreated(state);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFormAdmin
            className={!errors.title?.message ? null : "!border-red-500"}
            title={"Tên bài viết"}
            warn={errors.title?.message}
            type="text"
            placeholder="Tên bài viết"
            {...register("title")}
          />

          <InputFormAdmin
            type="text"
            title={"Slug"}
            placeholder="Slug"
            {...register("slug")}
            warn={errors.slug?.message}
            className={!errors.slug?.message ? null : "!border-red-500"}
          />
          <div className="mt-2 col-span-4">
            <InputFormAdmin
              className={`hidden ${
                errors.description?.message ? "!border-red-500" : null
              }`}
              title="Mô tả sản phẩm"
              warn={errors.description?.message}
              value={editorRef?.current ? editorRef?.current?.getContent() : ""}
              type="text"
              placeholder="Mô tả sản phẩm"
              {...register("description")}
            />
            <RichTextEditor
              onChange={(content) => setValue("description", content)}
              ref={editorRef}
            />
          </div>
          <div className="mt-4 mb-3 w-11/12 mx-auto">
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-1 rounded-md hover:opacity-75 bg-sky-500 text-white font-bold"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </form>
      </FormPopup>
    </div>
  );
}

export default useRequireAuth(BlogPage);
