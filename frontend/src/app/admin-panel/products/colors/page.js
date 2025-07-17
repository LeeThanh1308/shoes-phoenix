"use client";

import { Button, ColorPicker, Input, Space, Table } from "antd";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  colorsSelector,
  handleCreateColor,
  handleDeleteColor,
  handleGetColors,
  handleUpdateColor,
} from "@/services/redux/Slices/colors";
import { useDispatch, useSelector } from "react-redux";

import FormPopup from "@/components/sections/FormPopup";
import Highlighter from "react-highlight-words";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import { SearchOutlined } from "@ant-design/icons";
import { allowedRoles } from "@/services/utils/allowedRoles";
import { colorsSchema } from "@/services/schema/colorsSchema";
import { handleRegexSlug } from "@/services/utils";
import { useForm } from "react-hook-form";
import { withRoleGuard } from "@/hooks/withRoleGuard";
import { zodResolver } from "@hookform/resolvers/zod";

function Colors() {
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
    resolver: zodResolver(colorsSchema),
  });
  const dispatch = useDispatch();
  const { colors, validators, onRefresh } = useSelector(colorsSelector);
  const [showFormCreated, setShowFormCreated] = useState(false);
  const [showFormUpdated, setShowFormUpdated] = useState(false);
  const [idsSelectedRows, setIdsselectedRows] = useState([]);
  const [idThisUpdated, setIdThisUpdated] = useState(undefined);
  const [pickColor, setPickColor] = useState();
  const onSubmit = useCallback(
    (data) => {
      if (showFormCreated) dispatch(handleCreateColor(data));
      if (showFormUpdated) {
        dispatch(handleUpdateColor({ ...data, id: idThisUpdated }));
      }
    },
    [showFormCreated, showFormUpdated]
  );

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (colors?.length == 0) dispatch(handleGetColors());
    }, 200);
    return () => clearTimeout(timerID);
  }, [colors?.length]);

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
        title: "Tên màu",
        dataIndex: "name",
        key: "name",
        ...getColumnSearchProps("name"),
      },
      {
        title: "Màu sắc",
        dataIndex: "hexCode",
        key: "hexCode",
        ...getColumnSearchProps("hexCode"),
        render: (_, record) => (
          <div
            className={`w-7 h-7 rounded-full shadow shadow-black`}
            style={{
              backgroundColor: record?.hexCode,
            }}
          ></div>
        ),
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <span
              className=" cursor-pointer hover:text-sky-500"
              onClick={async (e) => {
                // await dispatch(handleGetCategory({ childrenId: record?.id }));
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
                if (window.confirm("Bạn chắc chắn muốn xóa màu sắc này?"))
                  dispatch(handleDeleteColor({ id: record?.id }));
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
            <span>Quản trị màu sắc </span>
            <span className=" text-3xl">({colors?.length} màu sắc)</span>
          </div>
          <div
            className="font-bold rounded bg-green-500 p-2 px-3 text-white text-lg hover:bg-green-400 cursor-pointer"
            onClick={(e) => setShowFormCreated(true)}
          >
            Thêm màu sắc +
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            rowSelection={{
              ...rowSelection,
            }}
            dataSource={colors}
            rowKey="id"
          />
          <div className=" grid grid-cols-8">
            <Button
              type="primary"
              disabled={idsSelectedRows?.length == 0}
              onClick={() => {
                console.log(idsSelectedRows);
                if (window.confirm("Bạn chắc chắn muốn xóa màu sắc đã chọn?"))
                  dispatch(handleDeleteColor({ ids: idsSelectedRows }));
              }}
              danger
            >
              Xóa nhiều
            </Button>
          </div>
        </div>
      </div>

      <FormPopup
        title="Sửa màu sắc"
        isShowForm={showFormUpdated}
        onClose={(state) => {
          reset();
          setShowFormUpdated(state);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFormAdmin
            className={!errors.name?.message ? null : "!border-red-500"}
            title={"Tên màu sắc"}
            warn={errors.name?.message}
            type="text"
            placeholder="Tên màu sắc"
            {...register("name")}
          />

          <div className=" flex flex-col gap-2">
            <label htmlFor={"hexCode"} className="text-xs text-gray-500">
              Mã màu
            </label>
            <ColorPicker
              showText
              id="hexCode"
              format="hex"
              allowClear
              value={watch("hexCode")}
              disabledAlpha
              onChangeComplete={(value) =>
                setValue("hexCode", value.toHexString())
              }
            />
            <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
              {errors?.hexCode?.message}
            </p>
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
        title="Thêm màu sắc"
        isShowForm={showFormCreated}
        onClose={(state) => {
          reset();
          setShowFormCreated(state);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFormAdmin
            className={!errors.name?.message ? null : "!border-red-500"}
            title={"Tên màu sắc"}
            warn={errors.name?.message}
            type="text"
            placeholder="Tên màu sắc"
            {...register("name")}
          />
          <div className=" flex flex-col gap-2">
            <label htmlFor={"hexCode"} className="text-xs text-gray-500">
              Mã màu
            </label>
            <ColorPicker
              showText
              id="hexCode"
              format="hex"
              allowClear
              disabledAlpha
              onChangeComplete={(value) =>
                setValue("hexCode", value.toHexString())
              }
            />
            <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
              {errors?.hexCode?.message}
            </p>
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

export default withRoleGuard(Colors, [allowedRoles.CEO]);
