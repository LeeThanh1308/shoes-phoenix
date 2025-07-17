"use client";

import { Button, Input, Space, Table } from "antd";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  blogsSelector,
  handleCreateBlog,
  handleDeleteBlog,
  handleGetBlogs,
  handleUpdateBlog,
} from "@/services/redux/Slices/blogs";
import { useDispatch, useSelector } from "react-redux";

import FormPopup from "@/components/sections/FormPopup";
import Highlighter from "react-highlight-words";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import RichTextEditor from "@/components/sections/RichTextEditor";
import { SearchOutlined } from "@ant-design/icons";
import { allowedRoles } from "@/services/utils/allowedRoles";
import { blogSchema } from "@/services/schema/blogSchema";
import { handleRegexSlug } from "@/services/utils";
import { useForm } from "react-hook-form";
import { withRoleGuard } from "@/hooks/withRoleGuard";
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
  const [idsSelectedRows, setIdsselectedRows] = useState([]);
  const [idThisUpdated, setIdThisUpdated] = useState(undefined);
  const onSubmit = useCallback(
    (data) => {
      if (showFormCreated) dispatch(handleCreateBlog(data));
      if (showFormUpdated)
        dispatch(handleUpdateBlog({ ...data, id: idThisUpdated }));
    },
    [showFormCreated, showFormUpdated]
  );

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (blogs?.length == 0) dispatch(handleGetBlogs());
    }, 200);
    return () => clearTimeout(timerID);
  }, [blogs?.length]);

  useEffect(() => {
    if (onRefresh) dispatch(handleGetBlogs());
  }, [onRefresh]);

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
      setIdThisUpdated(undefined);
      setIdsselectedRows([]);
    }
  }, [onRefresh]);

  // Table
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) => {
      console.log(value, record);
      return record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = useMemo(
    () => [
      {
        title: "Tiêu đề bài viết",
        dataIndex: "title",
        key: "title",
        ...getColumnSearchProps("title"),
      },
      {
        title: "Slug",
        dataIndex: "slug",
        key: "slug",
        ...getColumnSearchProps("slug"),
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <span
              className=" cursor-pointer hover:text-sky-500"
              onClick={async (e) => {
                Object.entries(record).forEach(([field, message]) => {
                  if ((field && typeof message === "boolean") || message)
                    setValue(field, message);
                });
                setIdThisUpdated(record?.id);
                setShowFormUpdated(true);
              }}
            >
              Sửa
            </span>
            <span
              className=" cursor-pointer hover:text-rose-500"
              onClick={() => {
                if (window.confirm("Bạn chắc chắn muốn xóa bài viết này?"))
                  dispatch(handleDeleteBlog({ id: record?.id }));
              }}
            >
              Delete
            </span>
          </Space>
        ),
      },
    ],
    []
  );

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setIdsselectedRows(
        selectedRows.reduce((acc, current) => {
          acc.push(current?.id);
          return acc;
        }, [])
      );
    },
    onSelect: (record, selected, selectedRows) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log(selected, selectedRows, changeRows);
    },
  };
  // Table
  return (
    <div className="w-full h-full z-10 text-black relative ">
      <div className="p-6 z-0">
        <div className="flex justify-between items-center">
          <div className="mb-4 font-bold text-5xl text-rose-700">
            <span>Quản trị bài viết </span>
            <span className=" text-3xl">({blogs?.length} bài viết)</span>
          </div>
          <div
            className="font-bold rounded bg-green-500 p-2 px-3 text-white text-lg hover:bg-green-400 cursor-pointer"
            onClick={(e) => setShowFormCreated(true)}
          >
            Thêm bài viết +
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            rowSelection={{
              ...rowSelection,
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div
                  className="ql-editor"
                  dangerouslySetInnerHTML={{ __html: record.description }}
                />
              ),
            }}
            dataSource={blogs}
            rowKey="id"
          />
          <div className=" grid grid-cols-8">
            <Button
              type="primary"
              disabled={idsSelectedRows?.length == 0}
              onClick={() => {
                console.log(idsSelectedRows);
                if (window.confirm("Bạn chắc chắn muốn xóa bài viết đã chọn?"))
                  dispatch(handleDeleteBlog({ ids: idsSelectedRows }));
              }}
              danger
            >
              Xóa nhiều
            </Button>
          </div>
        </div>
      </div>

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

export default withRoleGuard(BlogPage, [allowedRoles.CEO]);
