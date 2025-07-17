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
  branchesSelector,
  handleGetBranch,
} from "@/services/redux/Slices/branches";
import {
  formatPrice,
  handleRegexSlug,
  handleSetFieldForm,
  parsePrice,
} from "@/services/utils";
import {
  handleCreateStore,
  handleGetStores,
  handleUpdateStore,
  storesSelector,
} from "@/services/redux/Slices/stores";
import {
  handleGetSizeWhereProductID,
  sizesSelector,
} from "@/services/redux/Slices/sizes";
import {
  storeItemsSchema,
  storeItemsSchemaUpdate,
  storeSchema,
  storeSchemaUpdate,
} from "@/services/schema/storesSchema";
import { useDispatch, useSelector } from "react-redux";

import FormPopup from "@/components/sections/FormPopup";
import Highlighter from "react-highlight-words";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import { IoIosCloseCircle } from "react-icons/io";
import IsArray from "@/components/ui/IsArray";
import { MdModeEdit } from "react-icons/md";
import { SearchOutlined } from "@ant-design/icons";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import StoresTable from "@/components/pages/stores/StoresTable";
import { allowedRoles } from "@/services/utils/allowedRoles";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { withRoleGuard } from "@/hooks/withRoleGuard";
import { zodResolver } from "@hookform/resolvers/zod";

function Stores() {
  const [showFormPopup, setShowFormPopup] = useState({
    action: undefined,
    state: undefined,
    index: undefined,
  });
  const [showFormItems, setShowFormItems] = useState({
    action: undefined,
    state: undefined,
    index: undefined,
  });
  const params = useParams();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    reset,
    setError,
    control,
  } = useForm({
    resolver: zodResolver(
      showFormPopup?.action == "created" ? storeSchema : storeSchemaUpdate
    ),
  });
  const {
    register: registerStoreItems,
    handleSubmit: handleSubmitStoreItems,
    watch: watchStoreItems,
    setValue: setValueStoreItems,
    formState: { errors: errorsStoreItems },
    clearErrors: clearErrorsStoreItems,
    reset: resetStoreItems,
    setError: setErrorStoreItems,
  } = useForm({
    resolver: zodResolver(
      showFormItems.action == "created"
        ? storeItemsSchema
        : storeItemsSchemaUpdate
    ),
  });
  const dispatch = useDispatch();
  const { branch, onRefresh: onRefreshBranch } = useSelector(branchesSelector);
  const [valueSearch, setValueSearch] = useState("");
  const { stores, validators, onRefresh } = useSelector(storesSelector);
  const [idsSelectedRows, setIdsselectedRows] = useState([]);
  const [idThisUpdated, setIdThisUpdated] = useState(undefined);
  const onSubmitStoreItems = useCallback(
    async (data) => {
      console.log(data);
      if (showFormItems.action == "created") {
        const items = watch("items") ?? [];
        if (!data?.sizeID) {
          console.log(true);
          const sizes = await dispatch(
            handleGetSizeWhereProductID({ id: data?.productID })
          ).unwrap();
          console.log(sizes);
          const results = data?.colorID
            ? sizes.map((_, index) => {
                return {
                  ...data,
                  sizeID: _?.id,
                  size: _,
                };
              })
            : data?.product?.colors?.reduce((acc, item) => {
                console.log(item);
                const sizeItems = sizes.map((_, index) => {
                  return {
                    ...data,
                    color: item,
                    colorID: item?.id,
                    sizeID: _?.id,
                    size: _,
                  };
                });
                acc.push(...sizeItems);
                return acc;
              }, []);
          setValue("items", [...items, ...results]);
          console.log(watch("items"));
          resetStoreItems();
          setShowFormItems({
            state: undefined,
            action: undefined,
          });
        } else {
          let IsUnique = items.every((_, index) => {
            return _?.size?.id != data?.size?.id;
          });
          if (IsUnique) {
            setValue("items", [...items, data]);
            resetStoreItems();
            setShowFormItems({
              state: undefined,
              action: undefined,
            });
          } else {
            setErrorStoreItems("sizeID", {
              type: "server",
              message: "Loại sản phẩm đã tồn tại.",
            });
          }
        }
      }
      if (showFormItems.action == "updated") {
        const items = watch("items") ?? [];
        if (Array.isArray(items)) {
          let IsUnique = items.every((_, index) => {
            if (index === showFormItems?.index) return true;
            return _?.size?.id != data?.size?.id;
          });
          if (IsUnique) {
            items.splice(showFormItems?.index, 1, data);
            setValue("items", items);
            setShowFormItems({
              state: undefined,
              action: undefined,
            });
          } else {
            setErrorStoreItems("sizeID", {
              type: "server",
              message: "Loại sản phẩm đã tồn tại.",
            });
          }
        }
      }
    },
    [showFormItems]
  );

  useEffect(() => {
    Object.entries(validators).forEach(([field, message]) => {
      setError(field, { type: "server", message });
    });
  }, [validators]);

  useEffect(() => {
    if (onRefresh) {
      reset();
      setShowFormPopup({
        action: undefined,
        state: undefined,
        index: undefined,
      });
      setShowFormItems({});
      setIdThisUpdated(undefined);
    }
  }, [onRefresh]);

  const onSubmit = (data) => {
    if (showFormPopup.action == "created") {
      dispatch(handleCreateStore(data));
    }
    if (showFormPopup.action == "updated") {
      dispatch(handleUpdateStore(data));
    }
  };

  return (
    <div className="w-full h-full z-10 text-black relative ">
      <div className="p-6 z-0">
        <div className="flex justify-between items-center mb-2">
          <div className="mb-4 font-bold text-2xl text-rose-700">
            <span>Quản trị kho hàng</span>
          </div>
          <div
            className="font-bold rounded bg-green-500 p-2 px-3 text-white text-lg hover:bg-green-400 cursor-pointer"
            onClick={(e) =>
              setShowFormPopup({
                action: "created",
                state: true,
              })
            }
          >
            Thêm kho hàng +
          </div>
        </div>
        <div>
          <StoresTable
            data={stores}
            onUpdate={(data) => {
              Object.entries(data).forEach(([field, message]) => {
                if ((field && typeof message === "boolean") || message)
                  setValue(field, message);
              });
              setShowFormPopup({
                action: "updated",
                state: true,
              });
            }}
          />
        </div>
      </div>

      <FormPopup
        isShowForm={showFormPopup?.action && showFormPopup?.action == "created"}
        onClose={(state) => {
          reset();
          setShowFormPopup({
            action: undefined,
            state: state,
          });
        }}
        title="Thêm sản phẩm kinh doanh."
      >
        <form className=" relative" onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-2 col-span-4 flex flex-col">
            <input
              value={params?.id}
              className=" opacity-0 hidden"
              type="text"
              disabled
              {...register("branchID")}
            />
            <label className="text-xs text-gray-500">Thêm sản phẩm</label>
            <div className="flex flex-wrap gap-2 mb-2 mt-3">
              <IsArray data={watch("items")}>
                {watch("items")?.length > 0 &&
                  watch("items")?.map((_, key) => (
                    <div
                      className="border border-solid border-sky-500 px-4 py-3 rounded-xl flex-1 text-blue-700 font-bold basis-auto relative"
                      key={key}
                    >
                      <div>
                        <h1 className="">
                          Tên sản phẩm:{" "}
                          <span className="font-bold text-rose-700">
                            {_?.product?.name}
                          </span>
                        </h1>
                        <h1 className="">
                          Số lượng:{" "}
                          <span className="font-bold text-rose-700">
                            {formatPrice(String(_?.quantity))}
                          </span>
                        </h1>
                        <h1 className="">
                          Màu sắc:{" "}
                          <span className="font-bold text-rose-700">
                            {_?.color?.name}
                          </span>
                        </h1>
                        <h1 className="">
                          Loại:{" "}
                          <span className="font-bold text-rose-700">
                            {_?.size?.type}
                          </span>
                        </h1>
                      </div>

                      <div className="absolute right-2 top-2 flex gap-1">
                        <div
                          className=" w-4 h-4 bg-green-500 hover:bg-green-700 rounded-full group cursor-pointer flex-center"
                          onClick={() => {
                            handleSetFieldForm(
                              {
                                ..._,
                                productID: String(_?.productID),
                                sizeID: String(_?.sizeID),
                              },
                              setValueStoreItems
                            );
                            setShowFormItems({
                              action: "updated",
                              state: true,
                              index: key,
                            });
                          }}
                        >
                          <MdModeEdit className=" text-white text-xs hidden group-hover:block" />
                        </div>
                        <div
                          className=" w-4 h-4 bg-rose-400 hover:bg-rose-700 rounded-full cursor-pointer"
                          onClick={() => {
                            const thisArrayItems = watch("items");
                            thisArrayItems.splice(key, 1);
                            setValue("items", thisArrayItems);
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </IsArray>
            </div>
            <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
              {errors.items?.message}
            </p>
            <Button
              className=""
              onClick={() =>
                setShowFormItems({
                  state: true,
                  action: "created",
                })
              }
              type="primary"
            >
              Thêm sản phẩm
            </Button>
            <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
              {errors.sizes?.message}
            </p>
          </div>
          <div className="fixed right-2 bottom-2">
            <Button
              type="primary"
              htmlType="submit"
              className={`w-full hover:opacity-75 bg-blue-700 text-white font-bold`}
            >
              Thêm
            </Button>
          </div>
        </form>
      </FormPopup>

      <FormPopup
        isShowForm={showFormPopup?.action && showFormPopup?.action == "updated"}
        onClose={(state) => {
          reset();
          setShowFormPopup({
            action: undefined,
            state: state,
          });
        }}
        title="Sửa sản phẩm kinh doanh."
      >
        <form className=" relative" onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-2 col-span-4 flex flex-col">
            <label className="text-xs text-gray-500">Sửa sản phẩm</label>
            <div className=" relative w-full">
              <input
                value={valueSearch}
                onChange={(e) => setValueSearch(e.target.value)}
                className=" outline-none text-base font-normal border border-slate-500 rounded-sm p-2 w-full"
                type="text"
                placeholder="Tìm kiếm theo tên, loại, số lượng."
              />
              {valueSearch && (
                <div
                  className=" absolute top-0 bottom-0 right-2 flex items-center"
                  onClick={() => {
                    setValueSearch("");
                  }}
                >
                  <IoIosCloseCircle className=" text-lg hover:text-rose-700 cursor-pointer" />
                </div>
              )}
            </div>
            <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
              {errors.items?.message}
            </p>
            <Button
              className=""
              onClick={() =>
                setShowFormItems({
                  state: true,
                  action: "created",
                })
              }
              type="primary"
            >
              Thêm sản phẩm
            </Button>
            <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
              {errors.sizes?.message}
            </p>
            <div className="flex flex-wrap gap-2 mb-2 mt-3">
              <IsArray data={watch("items")}>
                {watch("items")?.length > 0 &&
                  watch("items")?.map((_, key) => {
                    const regex = new RegExp(valueSearch, "gim");
                    if (
                      regex.test(_?.product?.name ?? "") ||
                      regex.test(_?.size?.type ?? "") ||
                      regex.test(_?.quantity) ||
                      regex.test(_?.color?.name)
                    )
                      return (
                        <div
                          className="border border-solid border-sky-500 px-4 py-3 rounded-xl flex-1 text-blue-700 font-bold basis-auto relative"
                          key={key}
                        >
                          <div>
                            <h1 className="">
                              Tên sản phẩm:{" "}
                              <span className=" font-bold text-rose-700">
                                <Highlighter
                                  highlightStyle={{
                                    backgroundColor: "#ffc069",
                                    padding: 0,
                                  }}
                                  searchWords={[valueSearch]}
                                  autoEscape
                                  textToHighlight={_?.product?.name || ""}
                                />
                              </span>
                            </h1>
                            <h1 className="">
                              Loại:{" "}
                              <span className=" font-bold text-rose-700">
                                <Highlighter
                                  highlightStyle={{
                                    backgroundColor: "#ffc069",
                                    padding: 0,
                                  }}
                                  searchWords={[valueSearch]}
                                  autoEscape
                                  textToHighlight={_?.size?.type || ""}
                                />
                              </span>
                            </h1>
                            <h1 className="">
                              Màu sắc:{" "}
                              <span className=" font-bold text-rose-700">
                                <Highlighter
                                  highlightStyle={{
                                    backgroundColor: "#ffc069",
                                    padding: 0,
                                  }}
                                  searchWords={[valueSearch]}
                                  autoEscape
                                  textToHighlight={_?.color?.name || ""}
                                />
                              </span>
                            </h1>
                            <h1 className="">
                              Số lượng:{" "}
                              <span className=" font-bold text-rose-700">
                                <Highlighter
                                  highlightStyle={{
                                    backgroundColor: "#ffc069",
                                    padding: 0,
                                  }}
                                  searchWords={[valueSearch]}
                                  autoEscape
                                  textToHighlight={String(_?.quantity) || ""}
                                />
                              </span>
                            </h1>
                          </div>

                          <div className="absolute right-2 top-2 flex gap-1">
                            <div
                              className=" w-4 h-4 bg-green-500 hover:bg-green-700 rounded-full group cursor-pointer flex-center"
                              onClick={() => {
                                handleSetFieldForm(
                                  {
                                    ..._,
                                    productID: String(_?.product?.id),
                                    sizeID: String(_?.size?.id),
                                  },
                                  setValueStoreItems
                                );
                                setShowFormItems({
                                  action: "updated",
                                  state: true,
                                  index: key,
                                });
                              }}
                            >
                              <MdModeEdit className=" text-white text-xs hidden group-hover:block" />
                            </div>
                            <div
                              className=" w-4 h-4 bg-rose-400 hover:bg-rose-700 rounded-full cursor-pointer"
                              onClick={() => {
                                const thisArrayItems = watch("items");
                                thisArrayItems.splice(key, 1);
                                setValue("items", thisArrayItems);
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                  })}
              </IsArray>
            </div>
          </div>
          <div className="fixed right-2 bottom-2">
            <Button
              type="primary"
              htmlType="submit"
              className={`w-full hover:opacity-75 bg-blue-700 text-white font-bold`}
            >
              Lưu
            </Button>
          </div>
        </form>
      </FormPopup>

      <FormPopup
        title={
          showFormItems.action == "created"
            ? "Thêm loại sản phẩm kinh doanh"
            : "Sửa loại sản phẩm kinh doanh"
        }
        isShowForm={showFormItems.state}
        onClose={(state) => {
          resetStoreItems();
          setShowFormItems({
            action: undefined,
            state,
          });
        }}
      >
        <form onSubmit={handleSubmitStoreItems(onSubmitStoreItems)}>
          <div className=" flex gap-2">
            <InputFormAdmin
              classNameDiv={` flex-[0.5] `}
              className={
                errorsStoreItems.quantity?.message ? "!border-red-500" : null
              }
              title="Số lượng"
              warn={errorsStoreItems.quantity?.message}
              type="text"
              placeholder="Số lượng"
              value={formatPrice(watchStoreItems("quantity") || "")}
              {...registerStoreItems("quantity", {
                setValueAs: (value) => parsePrice(value),
              })}
            />

            <div className="flex-[0.5]">
              <SearchableDropdown
                className={
                  errorsStoreItems.productID?.message ? "!border-red-500" : null
                }
                activeOptions={!watchStoreItems("productID")}
                title={"Sản phẩm"}
                placeholder="Nhập từ khóa tìm kiếm."
                defaultOptions={watchStoreItems("product")}
                fieldName="name"
                fieldIcon="image"
                domain="products"
                onOption={(_) => {
                  clearErrorsStoreItems("productID");
                  if (_?.id) {
                    setValueStoreItems("product", _);
                    setValueStoreItems("productID", String(_?.id));
                  } else {
                    const { productID, sizeID, ...args } = watchStoreItems();
                    resetStoreItems(args);
                  }
                }}
                warn={errorsStoreItems.productID?.message}
              />
            </div>
          </div>

          <div className=" flex gap-2">
            <div className="flex-[0.5]">
              <SearchableDropdown
                className={`${!watchStoreItems("productID") && "opacity-25"} ${
                  errorsStoreItems.sizeID?.message ? "!border-red-500" : null
                }`}
                activeOptions={!watchStoreItems("productID")}
                disabled={!watchStoreItems("productID")}
                defaultOptions={watchStoreItems("size")}
                title={"Loại sản phẩm"}
                placeholder="Nhập từ khóa tìm kiếm loại sản phẩm."
                fieldName="type"
                domain={`product-sizes/products/${watchStoreItems(
                  "productID"
                )}`}
                onOption={(_) => {
                  clearErrorsStoreItems("sizeID");
                  if (_?.id) {
                    setValueStoreItems("size", _);
                    setValueStoreItems("sizeID", String(_?.id));
                  } else {
                    const { sizeID, ...args } = watchStoreItems();
                    resetStoreItems(args);
                  }
                }}
                warn={errorsStoreItems.sizeID?.message}
              />
            </div>

            <div className="flex-[0.5]">
              <SearchableDropdown
                className={`${!watchStoreItems("productID") && "opacity-25"} ${
                  errorsStoreItems.colorID?.message ? "!border-red-500" : null
                }`}
                dataOptions={watchStoreItems("product")?.colors}
                disabled={!watchStoreItems("product")?.colors}
                title={"Màu sắc sản phẩm"}
                placeholder="Chọn màu sắc sản phẩm"
                fieldName="name"
                fieldColor="hexCode"
                onOption={(_) => {
                  clearErrorsStoreItems("colorID");
                  if (_?.id) {
                    setValueStoreItems("color", _);
                    setValueStoreItems("colorID", String(_?.id));
                  } else {
                    const { colorID, ...args } = watchStoreItems();
                    resetStoreItems(args);
                  }
                }}
                warn={errorsStoreItems.colorID?.message}
              />
            </div>
          </div>

          <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
            Lưu ý: Để trống loại sản phẩm sẽ nhập tất cả size của sản phẩm với
            số lượng như nhau.
          </p>

          <div className="flex gap-2 mt-2">
            <Button
              type="primary"
              danger
              className={`w-full hover:opacity-75 text-white font-bold`}
              onClick={() => {
                resetStoreItems();
              }}
            >
              Clear
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              className={`w-full hover:opacity-75 bg-blue-700 text-white font-bold`}
            >
              {showFormItems?.action == "created" ? "Tạo" : "Lưu"}
            </Button>
          </div>
        </form>
      </FormPopup>
    </div>
  );
}

export default withRoleGuard(Stores, [
  allowedRoles.CEO,
  allowedRoles.MANAGE,
  allowedRoles.STAFF,
]);
