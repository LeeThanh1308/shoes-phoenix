"use client";

import { Button, ColorPicker, Input, Select, Space, Table } from "antd";
import {
  LockOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  branchesSelector,
  handleDeleteRoleEmployees,
  handleGetEmployeesBranch,
  handleSetRoleEmployees,
} from "@/services/redux/Slices/branches";
import {
  formatCurrencyVND,
  generateUrlImage,
  handleRegexSlug,
  timeDifference,
} from "@/services/utils";
import { useDispatch, useSelector } from "react-redux";

import AuthRequest from "@/services/axios/AuthRequest";
import FallbackImage from "@/components/ui/FallbackImage";
import FormPopup from "@/components/sections/FormPopup";
import Highlighter from "react-highlight-words";
import Search from "antd/es/input/Search";
import { allowedRoles } from "@/services/utils/allowedRoles";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { withRoleGuard } from "@/hooks/withRoleGuard";

function EmployeesPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const {
    branches = [],
    employees = [],
    validators = {},
    onRefresh,
  } = useSelector(branchesSelector);
  const [roleSet, setRoleSet] = useState([]);
  const [dataSearch, setDataSearch] = useState([]);
  const [search, setSearch] = useState("");
  const [showFormCreated, setShowFormCreated] = useState(false);
  const [showFormUpdated, setShowFormUpdated] = useState(false);
  const [rowIdChangeStatus, setRowIdChangeStatus] = useState([]);
  const [idThisUpdated, setIdThisUpdated] = useState(undefined);

  useEffect(() => {
    if (onRefresh) {
      setShowFormCreated(false);
      setShowFormUpdated(false);
      setRowIdChangeStatus([]);
      setDataSearch([]);
      setIdThisUpdated(undefined);
      dispatch(handleGetEmployeesBranch(params.id));
    }
  }, [onRefresh]);

  useEffect(() => {
    AuthRequest.get("roles/my-role-set").then((res) => {
      setRoleSet(res.data ?? []);
    });
    dispatch(handleGetEmployeesBranch(params.id));
  }, [params.id]);

  useEffect(() => {
    const timerID = setTimeout(() => {
      search
        ? AuthRequest.get(`branches/accounts?search=${search}`).then((res) => {
            setDataSearch(res.data ?? []);
          })
        : setDataSearch([]);
      setRowIdChangeStatus([]);
    }, 500);

    return () => {
      clearTimeout(timerID);
    };
  }, [search]);

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

  const columns = [
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      key: "avatar",

      render: (_, record) => (
        <div className="w-10 h-10 overflow-hidden relative">
          <FallbackImage
            src={`${generateUrlImage(record?.avatar)}`}
            alt="logo"
            className="w-full h-full"
            fill
            sizes="100vw"
          />
        </div>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      ...getColumnSearchProps("fullname"),
      sorter: (a, b) => a.fullname.length - b.fullname.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
      sorter: (a, b) => a.email.length - b.email.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
      sorter: (a, b) => a.phone - b.phone,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      key: "birthday",
      ...getColumnSearchProps("birthday"),
      sorter: (a, b) => (dayjs(a.date).isBefore(b.date) ? -1 : 1),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      // ...getColumnSearchProps("gender"),
      sorter: (a, b) =>
        (a?.gender === "x" ? "Nam" : a?.gender === "y" ? "Nữ" : "Khác").length -
        (b?.gender === "x" ? "Nam" : b?.gender === "y" ? "Nữ" : "Khác").length,
      sortDirections: ["descend", "ascend"],
      render: (_, record) =>
        record?.gender === "x" ? "Nam" : record?.gender === "y" ? "Nữ" : "Khác",
    },
    {
      title: "Usid",
      dataIndex: "usid",
      key: "usid",
      ...getColumnSearchProps("usid"),
    },
    {
      title: "Quyền",
      dataIndex: "roles",
      key: "roles",
      // ...getColumnSearchProps("roles"),
      sorter: (a, b) =>
        JSON.stringify(a?.roles).length - JSON.stringify(b?.roles).length,
      sortDirections: ["descend", "ascend"],
      render: (_, record) => record?.roles?.description || "Khách",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      sortDirections: ["descend", "ascend"],
      render: (_, record) => {
        return <p>{timeDifference(_)}</p>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {/* <Button
            type="primary"
            className=" border border-sky-500 text-sky-500"
            onClick={(e) => {
              const { password, confirmPassword, ...rest } = record;
              Object.entries(rest).forEach(([field, message]) => {
                if ((field && typeof message === "boolean") || message)
                  setValue(field, message);
              });
              setShowEditUser(true);
            }}
          >
            Sửa
          </Button> */}
          <Button
            danger
            className=" cursor-pointer hover:bg-red-500"
            onClick={(e) => {
              let result = window.confirm(
                "Bạn chắc chắn muốn xoá quyền tài khoản " + record.email
              );
              if (result) {
                dispatch(handleDeleteRoleEmployees({ userID: record.id }));
              }
            }}
          >
            Truất quyền
          </Button>
        </Space>
      ),
    },
  ];

  const columnSetRole = [
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      key: "avatar",

      render: (_, record) => (
        <div className="w-10 h-10 overflow-hidden relative">
          <FallbackImage
            src={`${generateUrlImage(record?.avatar)}`}
            alt="logo"
            className="w-full h-full"
            fill
            sizes="100vw"
          />
        </div>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      ...getColumnSearchProps("fullname"),
      sorter: (a, b) => a.fullname.length - b.fullname.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
      sorter: (a, b) => a.email.length - b.email.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
      sorter: (a, b) => a.phone - b.phone,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      key: "birthday",
      ...getColumnSearchProps("birthday"),
      sorter: (a, b) => (dayjs(a.date).isBefore(b.date) ? -1 : 1),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      // ...getColumnSearchProps("gender"),
      sorter: (a, b) =>
        (a.gender === "x" ? "Nam" : a.gender === "y" ? "Nữ" : "Khác").length -
        (b.gender === "x" ? "Nam" : b.gender === "y" ? "Nữ" : "Khác").length,
      sortDirections: ["descend", "ascend"],
      render: (_, record) =>
        record.gender === "x" ? "Nam" : record.gender === "y" ? "Nữ" : "Khác",
    },
    {
      title: "Usid",
      dataIndex: "usid",
      key: "usid",
      ...getColumnSearchProps("usid"),
    },

    {
      title: "Quyền",
      dataIndex: "roles",
      key: "roles",
      render: (_, record) => {
        return (
          <Select
            placeholder="Quyền hạn"
            className=" w-full"
            onChange={(value) => {
              setRowIdChangeStatus((prev) => [...prev, record.id]);
              setDataSearch([
                ...dataSearch.map((item) => {
                  if (record.id == item.id) {
                    return {
                      ...item,
                      roles: value,
                    };
                  }
                  return item;
                }),
              ]);
            }}
            options={roleSet.map((_) => ({
              value: _.description,
              label: _.description,
            }))}
          />
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      sortDirections: ["descend", "ascend"],
      render: (_, record) => {
        return <p>{timeDifference(_)}</p>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {rowIdChangeStatus.includes(record.id) && (
            <Button
              type="primary"
              className=" border border-sky-500 text-sky-500"
              onClick={(e) => {
                dispatch(
                  handleSetRoleEmployees({
                    branchID: params?.id,
                    userID: record.id,
                    role: record.roles,
                  })
                );
              }}
            >
              Lưu
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Table

  return (
    <div className="w-full h-full z-10 text-black relative ">
      <div className="p-6 z-0">
        <div className="flex justify-between items-center">
          <div className="mb-4 font-bold text-5xl text-rose-700">
            <span className=" text-3xl">Quản lý nhân sự cửa hàng</span>
          </div>

          <div
            onClick={() => setShowFormCreated(true)}
            className="font-bold rounded bg-green-500 p-2 px-3 text-white text-lg hover:bg-green-400 cursor-pointer"
          >
            Thêm nhân sự +
          </div>
        </div>
        <div>
          <Table columns={columns} rowKey="id" dataSource={employees} />
        </div>
      </div>

      <FormPopup
        title="Thêm nhân sự"
        isShowForm={showFormCreated}
        onClose={(value) => {
          setShowFormCreated(value);
          setRowIdChangeStatus([]);
          setDataSearch([]);
        }}
      >
        <form>
          <div className=" flex flex-col gap-2">
            <Search
              placeholder="input search text"
              className="w-full"
              onSearch={(value) => setSearch(value)}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Table
              columns={columnSetRole}
              rowKey="id"
              dataSource={dataSearch}
            />
          </div>
        </form>
      </FormPopup>
    </div>
  );
}

export default withRoleGuard(EmployeesPage, [
  allowedRoles.CEO,
  allowedRoles.MANAGE,
  allowedRoles.STAFF,
]);
