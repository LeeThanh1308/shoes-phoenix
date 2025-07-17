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
  handleCreateTarget,
  handleDeleteTarget,
  handleGetTargets,
  handleUpdateTarget,
  targetsSelector,
} from "@/services/redux/Slices/targets";
import { useDispatch, useSelector } from "react-redux";

import FormPopup from "@/components/sections/FormPopup";
import Highlighter from "react-highlight-words";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import { SearchOutlined } from "@ant-design/icons";
import { allowedRoles } from "@/services/utils/allowedRoles";
import { handleRegexSlug } from "@/services/utils";
import { targetsSchema } from "@/services/schema/targetsSchema";
import { useForm } from "react-hook-form";
import { withRoleGuard } from "@/hooks/withRoleGuard";
import { zodResolver } from "@hookform/resolvers/zod";

function Targets() {
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
    resolver: zodResolver(targetsSchema),
  });
  const dispatch = useDispatch();
  const { targets, validators, onRefresh } = useSelector(targetsSelector);
  const [showFormCreated, setShowFormCreated] = useState(false);
  const [showFormUpdated, setShowFormUpdated] = useState(false);
  const [idsSelectedRows, setIdsselectedRows] = useState([]);
  const [idThisUpdated, setIdThisUpdated] = useState(undefined);
  const onSubmit = useCallback(
    (data) => {
      if (showFormCreated) dispatch(handleCreateTarget(data));
      if (showFormUpdated) {
        dispatch(handleUpdateTarget({ ...data, id: idThisUpdated }));
      }
    },
    [showFormCreated, showFormUpdated]
  );

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (targets?.length == 0) dispatch(handleGetTargets());
    }, 200);
    return () => clearTimeout(timerID);
  }, [targets?.length]);

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
        title: "Tên đối tượng",
        dataIndex: "name",
        key: "name",
        ...getColumnSearchProps("name"),
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
                if (window.confirm("Bạn chắc chắn muốn xóa đối tượng này?"))
                  dispatch(handleDeleteTarget({ id: record?.id }));
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
            <span>Quản trị đối tượng </span>
            <span className=" text-3xl">({targets?.length} đối tượng)</span>
          </div>
          <div
            className="font-bold rounded bg-green-500 p-2 px-3 text-white text-lg hover:bg-green-400 cursor-pointer"
            onClick={(e) => setShowFormCreated(true)}
          >
            Thêm đối tượng +
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            rowSelection={{
              ...rowSelection,
            }}
            dataSource={targets}
            rowKey="id"
          />
          <div className=" grid grid-cols-8">
            <Button
              type="primary"
              disabled={idsSelectedRows?.length == 0}
              onClick={() => {
                console.log(idsSelectedRows);
                if (window.confirm("Bạn chắc chắn muốn xóa đối tượng đã chọn?"))
                  dispatch(handleDeleteTarget({ ids: idsSelectedRows }));
              }}
              danger
            >
              Xóa nhiều
            </Button>
          </div>
        </div>
      </div>

      <FormPopup
        title="Sửa đối tượng"
        isShowForm={showFormUpdated}
        onClose={(state) => {
          reset();
          setShowFormUpdated(state);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFormAdmin
            className={!errors.name?.message ? null : "!border-red-500"}
            title={"Tên đối tượng"}
            warn={errors.name?.message}
            type="text"
            placeholder="Tên đối tượng"
            {...register("name")}
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

      <FormPopup
        title="Thêm đối tượng"
        isShowForm={showFormCreated}
        onClose={(state) => {
          reset();
          setShowFormCreated(state);
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFormAdmin
            className={!errors.name?.message ? null : "!border-red-500"}
            title={"Tên đối tượng"}
            warn={errors.name?.message}
            type="text"
            placeholder="Tên đối tượng"
            {...register("name")}
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

export default withRoleGuard(Targets, [allowedRoles.CEO]);
