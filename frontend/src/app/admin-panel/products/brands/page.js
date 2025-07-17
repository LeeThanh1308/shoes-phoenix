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
  brandsSelector,
  handleCreateBrand,
  handleDeleteBrand,
  handleGetBrands,
  handleUpdateBrand,
} from "@/services/redux/Slices/brands";
import { useDispatch, useSelector } from "react-redux";

import FormPopup from "@/components/sections/FormPopup";
import Highlighter from "react-highlight-words";
import Image from "next/image";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import { SearchOutlined } from "@ant-design/icons";
import { allowedRoles } from "@/services/utils/allowedRoles";
import { brandsSchema } from "@/services/schema/brandsSchema";
import { handleRegexSlug } from "@/services/utils";
import { useForm } from "react-hook-form";
import { withRoleGuard } from "@/hooks/withRoleGuard";
import { zodResolver } from "@hookform/resolvers/zod";

function Brands() {
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
    resolver: zodResolver(brandsSchema),
  });
  const dispatch = useDispatch();
  const { brands, validators, onRefresh } = useSelector(brandsSelector);
  const [showFormCreated, setShowFormCreated] = useState(false);
  const [showFormUpdated, setShowFormUpdated] = useState(false);
  const [idsSelectedRows, setIdsselectedRows] = useState([]);
  const [idThisUpdated, setIdThisUpdated] = useState(undefined);
  const onSubmit = useCallback(
    (data) => {
      if (showFormCreated) dispatch(handleCreateBrand(data));
      if (showFormUpdated)
        dispatch(handleUpdateBrand({ ...data, id: idThisUpdated }));
    },
    [showFormCreated, showFormUpdated]
  );

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (brands?.length == 0) dispatch(handleGetBrands());
    }, 200);
    return () => clearTimeout(timerID);
  }, [brands?.length]);

  useEffect(() => {
    Object.entries(validators).forEach(([field, message]) => {
      setError(field, { type: "server", message });
    });
  }, [validators]);

  useEffect(() => {
    const name = watch("name") || "";
    if (name) {
      setValue("slug", handleRegexSlug(name));
      clearErrors("slug");
    }
  }, [watch("name")]);

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
        title: "Icons",
        dataIndex: "logo",
        key: "logo",
        render: (_, record) =>
          record.logo && (
            <Image
              src={`${process.env.NEXT_PUBLIC_DOMAIN_API}${process.env.NEXT_PUBLIC_PARAM_GET_FILE_API}${record.logo}`}
              alt="logo"
              width={40}
              height={40}
            />
          ),
      },
      {
        title: "Tên thương hiệu",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Slug",
        dataIndex: "slug",
        key: "slug",
        ...getColumnSearchProps("slug"),
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        ...getColumnSearchProps("description"),
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
                if (window.confirm("Bạn chắc chắn muốn xóa thương hiệu này?"))
                  dispatch(handleDeleteBrand({ id: record?.id }));
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
            <span>Quản trị thương hiệu </span>
            <span className=" text-3xl">({brands?.length} thương hiệu)</span>
          </div>
          <div
            className="font-bold rounded bg-green-500 p-2 px-3 text-white text-lg hover:bg-green-400 cursor-pointer"
            onClick={(e) => setShowFormCreated(true)}
          >
            Thêm thương hiệu +
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            rowSelection={{
              ...rowSelection,
            }}
            dataSource={brands}
            rowKey="id"
          />
          <div className=" grid grid-cols-8">
            <Button
              type="primary"
              disabled={idsSelectedRows?.length == 0}
              onClick={() => {
                console.log(idsSelectedRows);
                if (
                  window.confirm("Bạn chắc chắn muốn xóa thương hiệu đã chọn?")
                )
                  dispatch(handleDeleteBrand({ ids: idsSelectedRows }));
              }}
              danger
            >
              Xóa nhiều
            </Button>
          </div>
        </div>
      </div>

      <FormPopup
        title="Sửa thương hiệu"
        isShowForm={showFormUpdated}
        onClose={(state) => {
          reset();
          setShowFormUpdated(state);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFormAdmin
            className={!errors.name?.message ? null : "!border-red-500"}
            title={"Tên thương hiệu"}
            warn={errors.name?.message}
            type="text"
            placeholder="Tên thương hiệu"
            {...register("name")}
          />

          <InputFormAdmin
            type="text"
            title={"Slug"}
            placeholder="Slug"
            {...register("slug")}
            warn={errors.slug?.message}
            className={!errors.slug?.message ? null : "!border-red-500"}
          />

          <InputFormAdmin
            type="text"
            title={"Mô tả"}
            placeholder="Mô tả"
            {...register("description")}
            warn={errors.description?.message}
            className={!errors.description?.message ? null : "!border-red-500"}
          />

          {typeof watch().logo == "string" ? (
            <div className=" p-3 relative">
              <div className=" relative w-fit">
                <Image
                  src={`${process.env.NEXT_PUBLIC_DOMAIN_API}${
                    process.env.NEXT_PUBLIC_PARAM_GET_FILE_API
                  }${watch().logo}`}
                  alt="logos"
                  width={100}
                  height={100}
                />
                <div
                  onClick={() => {
                    const { logo, ...args } = watch();
                    reset({
                      ...args,
                    });
                  }}
                  className="w-4 h-4 bg-rose-500 hover:bg-rose-700 rounded-full absolute top-0 right-0 cursor-pointer"
                ></div>
              </div>
              <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                {errors.logo?.message}
              </p>
            </div>
          ) : (
            <InputFormAdmin
              type="file"
              title={"Upload logo"}
              {...register("file")}
              warn={errors.file?.message}
              className={!errors.file?.message ? null : "!border-red-500"}
            />
          )}

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
        title="Thêm thương hiệu"
        isShowForm={showFormCreated}
        onClose={(state) => {
          reset();
          setShowFormCreated(state);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFormAdmin
            className={!errors.name?.message ? null : "!border-red-500"}
            title={"Tên thương hiệu"}
            warn={errors.name?.message}
            type="text"
            placeholder="Tên thương hiệu"
            {...register("name")}
          />

          <InputFormAdmin
            type="text"
            title={"Slug"}
            placeholder="Slug"
            {...register("slug")}
            warn={errors.slug?.message}
            className={!errors.slug?.message ? null : "!border-red-500"}
          />

          <InputFormAdmin
            type="text"
            title={"Mô tả"}
            placeholder="Mô tả"
            {...register("description")}
            warn={errors.description?.message}
            className={!errors.description?.message ? null : "!border-red-500"}
          />
          <InputFormAdmin
            type="file"
            title={"Upload logo"}
            {...register("file")}
            warn={errors.file?.message}
            className={!errors.file?.message ? null : "!border-red-500"}
          />
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

export default withRoleGuard(Brands, [allowedRoles.CEO]);
