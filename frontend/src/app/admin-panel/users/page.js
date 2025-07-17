"use client";

import { Button, Input, Space, Statistic, Table } from "antd";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  LockOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import { generateUrlImage, removeEmptyObjectFields } from "@/services/utils";
import {
  handleChangeBanAccounts,
  handleCreateAccountByAdmin,
  handleGetListAccountCustomers,
  handleUpdateInfoCustomers,
  usersSelector,
} from "@/services/redux/Slices/users";
import {
  registerSchema,
  registerSchemaUpdated,
} from "@/services/schema/registerSchema";
import { useDispatch, useSelector } from "react-redux";

import AuthRequest from "@/services/axios/AuthRequest";
import FallbackImage from "@/components/ui/FallbackImage";
import FormPopup from "@/components/sections/FormPopup";
import Highlighter from "react-highlight-words";
import Toastify from "@/components/sections/Toastify";
import { allowedRoles } from "@/services/utils/allowedRoles";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { withRoleGuard } from "@/hooks/withRoleGuard";
import { zodResolver } from "@hookform/resolvers/zod";

function UserPage() {
  const { validators, users, onRefresh } = useSelector(usersSelector);
  const { data = [], count = 0 } = users;
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
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
    resolver: zodResolver(showAddUser ? registerSchema : registerSchemaUpdated),
  });
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  // Create accounts
  const onSubmit = async (data) => {
    if (showAddUser) dispatch(handleCreateAccountByAdmin(data));
    if (showEditUser) {
      const dataUpdate = await removeEmptyObjectFields(data);
      dispatch(handleUpdateInfoCustomers(dataUpdate));
    }
  };

  const [totalUsers, setTotalUsers] = useState(0);

  const [dataColum, setDataColum] = useState([]);
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
            className="text-black"
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
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
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
      title: "Khóa tài khoản",
      dataIndex: "ban",
      key: "ban",
      sorter: (a, b) => a.ban - b.ban,
      render: (_, record) => (
        <>
          {record.ban ? (
            <p className=" text-red-500">
              <LockOutlined /> Lock
            </p>
          ) : (
            <p className=" text-sky-500">
              <UnlockOutlined /> Unlock
            </p>
          )}
        </>
      ),
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
        const currentDate = new Date(record.createdAt);
        const newDate = new Date();
        const createdAt = dayjs(record.createdAt);
        const currentMoment = dayjs(newDate);

        let years = currentMoment.diff(createdAt, "years");
        createdAt.add(years, "years");

        let months = currentMoment.diff(createdAt, "months");
        createdAt.add(months, "months");

        let days = currentMoment.diff(createdAt, "days");
        return (
          <p>
            {currentDate.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}{" "}
            - {`${years} năm, ${months} tháng, ${days} ngày`}
          </p>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
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
          </Button>
          <Button
            danger
            className=" cursor-pointer hover:bg-red-500"
            onClick={(e) => {
              let result = window.confirm(
                "Bạn chắc chắn muốn xoá tài khoản " + record.email
              );
              if (result) {
                AuthRequest.delete("accounts/" + record.id)
                  .then((response) =>
                    response.statusText === "OK" ? response.data : null
                  )
                  .then((data) => {
                    if (data) {
                      Toastify(1, data.message);
                    }
                  })
                  .finally(() => {});
              }
            }}
          >
            Delete
          </Button>

          <Button
            className=" cursor-pointer hover:text-sky-500 flex items-center"
            onClick={() => {
              let result = window.confirm(
                `Bạn chắc chắn muốn ${
                  record.ban ? "mở khóa" : "khóa"
                } tài khoản ` + record.email
              );
              if (result) {
                dispatch(
                  handleChangeBanAccounts({ id: record.id, ban: !record.ban })
                );
              }
            }}
          >
            {record.ban ? <UnlockOutlined /> : <LockOutlined />}
            {record.ban ? "Mở khóa" : "Khóa tài khoản"}
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (showAddUser) setShowAddUser(false);
    if (showEditUser) setShowEditUser(false);
    reset();
    clearErrors();
  }, [onRefresh]);

  // Get List Accounts
  useEffect(() => {
    if (data?.length == 0) dispatch(handleGetListAccountCustomers());
  }, [data]);

  useEffect(() => {
    Object.entries(validators).forEach(([field, message]) => {
      setError(field, { type: "server", message });
    });
  }, [validators]);
  return (
    <div className="w-full h-auto z-10 text-black relative">
      <div className="">
        <div className="flex justify-between items-center">
          <div className="mb-4 font-bold text-5xl">Quản trị user</div>
          <div
            className="font-bold rounded bg-green-500 p-2 px-3 text-white text-lg hover:bg-green-400 cursor-pointer"
            onClick={(e) => setShowAddUser(true)}
          >
            Thêm user +
          </div>
        </div>
        <div className="w-full h-auto bg-white">
          <Table columns={columns} dataSource={data ?? []} />
        </div>
        <div className=" absolute left-6 bottom-0">
          <Statistic title="Tổng tài khoản người dùng" value={count} />
        </div>
      </div>

      <FormPopup
        title="Tạo tài khoản"
        isShowForm={showAddUser}
        onClose={(state) => {
          setShowAddUser(state);
          reset();
          clearErrors();
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 mb-3">
            <div className="mb-2 w-full mr-1">
              <input
                type="text"
                name="fullname"
                placeholder="Họ và tên"
                className={`p-2 rounded-md w-full border border-solid border-blue-700 outline-none placeholder:text-rose-700 bg-slate-50/0 ${
                  !errors.fullname?.message ? null : "!border-red-500"
                }`}
                {...register("fullname")}
              />
              <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                {errors.fullname?.message}
              </p>
            </div>

            <div className="mb-2 w-full mr-1">
              <input
                type="date"
                name="birthday"
                className={`p-2 rounded-md w-full border border-solid outline-none border-blue-700 placeholder:text-rose-700  ${
                  !watch("birthday") ? "text-rose-700" : "text-black"
                } ${!errors.birthday?.message ? "" : "!border-red-500"}`}
                {...register("birthday")}
              />
              <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                {errors.birthday?.message}
              </p>
            </div>

            <div className="w-full mx-auto mb-2">
              <select
                name="gender"
                className={`w-full p-2 border border-solid rounded-md border-blue-700  ${
                  !watch("gender") ? "text-rose-700" : "text-black"
                } ${!errors.gender?.message ? null : "!border-red-500"}`}
                defaultValue={""}
                {...register("gender")}
              >
                <option value="" disabled hidden className="">
                  Giới tính
                </option>
                <option value="x">Nam</option>
                <option value="y">Nữ</option>
                <option value="z">Khác</option>
              </select>
              <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                {errors.gender?.message}
              </p>
            </div>

            <div className="w-full flex justify-between">
              <div className="mb-2 w-3/6 mr-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mật khẩu"
                  className={`p-2 rounded-md w-full border border-solid outline-none placeholder:text-rose-700 border-blue-700 bg-slate-50/0 ${
                    !errors.password?.message ? null : "!border-red-500"
                  }`}
                  {...register("password")}
                />
                <div className="absolute right-3 top-0 bottom-0 flex items-center cursor-pointer">
                  {showPassword ? (
                    <FaEye
                      className="image-shadow"
                      onClick={(e) => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <FaEyeSlash
                      className="image-shadow"
                      onClick={(e) => setShowPassword(!showPassword)}
                    />
                  )}
                </div>

                <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                  {errors.password?.message}
                </p>
              </div>

              <div className="w-3/6 mx-auto mb-2">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  className={`p-2 rounded-md w-full border border-solid outline-none border-blue-700 placeholder:text-rose-700 ${
                    !errors.confirmPassword?.message ? null : "!border-red-500"
                  }`}
                  {...register("confirmPassword")}
                />
                <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                  {errors.confirmPassword?.message}
                </p>
              </div>
            </div>

            <div className="w-full flex justify-between">
              <div className="mb-2 w-3/6 mr-1">
                <div className="w-full mx-auto mb-2">
                  <input
                    type="text"
                    name="phone"
                    placeholder="Số điện thoại"
                    className={`p-2 rounded-md w-full border border-solid outline-none placeholder:text-rose-700 border-blue-700 text-slate-950 ${
                      !errors.phone?.message ? null : "!border-red-500"
                    }`}
                    {...register("phone")}
                  />
                  <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                    {errors.phone?.message}
                  </p>
                </div>
              </div>
              <div className="mb-2 w-3/6">
                <div className="w-full mx-auto mb-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className={`p-2 rounded-md w-full border border-solid outline-none placeholder:text-rose-700 border-blue-700 text-slate-950 ${
                      !errors.email?.message ? null : "!border-red-500"
                    }`}
                    {...register("email")}
                  />
                  <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                    {errors.email?.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-1 rounded-md hover:opacity-75 w-full bg-blue-500 text-white"
          >
            Tạo tài khoản
          </button>
        </form>
      </FormPopup>

      <FormPopup
        title="Sửa thông tin tài khoản"
        isShowForm={showEditUser}
        onClose={(state) => {
          setShowEditUser(state);
          reset();
          clearErrors();
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4 mb-3">
            <div className="mb-2 w-full mr-1">
              <input
                type="text"
                name="fullname"
                placeholder="Họ và tên"
                className={`p-2 rounded-md w-full border border-solid border-blue-700 outline-none placeholder:text-rose-700 bg-slate-50/0 ${
                  !errors.fullname?.message ? null : "!border-red-500"
                }`}
                {...register("fullname")}
              />
              <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                {errors.fullname?.message}
              </p>
            </div>

            <div className="mb-2 w-full mr-1">
              <input
                type="date"
                name="birthday"
                className={`p-2 rounded-md w-full border border-solid outline-none border-blue-700 placeholder:text-rose-700  ${
                  !watch("birthday") ? "text-rose-700" : "text-black"
                } ${!errors.birthday?.message ? "" : "!border-red-500"}`}
                {...register("birthday")}
              />
              <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                {errors.birthday?.message}
              </p>
            </div>

            <div className="w-full mx-auto mb-2">
              <select
                name="gender"
                className={`w-full p-2 border border-solid rounded-md border-blue-700  ${
                  !watch("gender") ? "text-rose-700" : "text-black"
                } ${!errors.gender?.message ? null : "!border-red-500"}`}
                defaultValue={""}
                {...register("gender")}
              >
                <option value="" disabled hidden className="">
                  Giới tính
                </option>
                <option value="x">Nam</option>
                <option value="y">Nữ</option>
                <option value="z">Khác</option>
              </select>
              <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                {errors.gender?.message}
              </p>
            </div>

            <div className="w-full flex justify-between">
              <div className="mb-2 w-3/6 mr-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mật khẩu mới"
                  className={`p-2 rounded-md w-full border border-solid outline-none placeholder:text-rose-700 border-blue-700 bg-slate-50/0 ${
                    !errors.password?.message ? null : "!border-red-500"
                  }`}
                  {...register("password")}
                />
                <div className="absolute right-3 top-0 bottom-0 flex items-center cursor-pointer">
                  {showPassword ? (
                    <FaEye
                      className="image-shadow"
                      onClick={(e) => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <FaEyeSlash
                      className="image-shadow"
                      onClick={(e) => setShowPassword(!showPassword)}
                    />
                  )}
                </div>

                <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                  {errors.password?.message}
                </p>
              </div>

              <div className="w-3/6 mx-auto mb-2">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  className={`p-2 rounded-md w-full border border-solid outline-none border-blue-700 placeholder:text-rose-700 ${
                    !errors.confirmPassword?.message ? null : "!border-red-500"
                  }`}
                  {...register("confirmPassword")}
                />
                <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                  {errors.confirmPassword?.message}
                </p>
              </div>
            </div>

            <div className="w-full flex justify-between">
              <div className="mb-2 w-3/6 mr-1">
                <div className="w-full mx-auto mb-2">
                  <input
                    type="text"
                    name="phone"
                    placeholder="Số điện thoại"
                    className={`p-2 rounded-md w-full border border-solid outline-none placeholder:text-rose-700 border-blue-700 text-slate-950 ${
                      !errors.phone?.message ? null : "!border-red-500"
                    }`}
                    {...register("phone")}
                  />
                  <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                    {errors.phone?.message}
                  </p>
                </div>
              </div>
              <div className="mb-2 w-3/6">
                <div className="w-full mx-auto mb-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className={`p-2 rounded-md w-full border border-solid outline-none placeholder:text-rose-700 border-blue-700 text-slate-950 ${
                      !errors.email?.message ? null : "!border-red-500"
                    }`}
                    {...register("email")}
                  />
                  <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
                    {errors.email?.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-1 rounded-md hover:opacity-75 w-full bg-blue-500 text-white"
          >
            Lưu
          </button>
        </form>
      </FormPopup>
    </div>
  );
}

export default withRoleGuard(UserPage, [allowedRoles.CEO]);
