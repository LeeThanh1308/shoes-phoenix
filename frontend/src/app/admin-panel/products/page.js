"use client";

import { Button, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  formatCurrencyVND,
  formatPrice,
  handleRegexSlug,
  handleSetFieldForm,
  parsePrice,
} from "@/services/utils";
import {
  handleChangeLoading,
  handleCreateProduct,
  handleGetProducts,
  handleUpdateProduct,
  productsSelector,
} from "@/services/redux/Slices/products";
import {
  productsSchema,
  productsSchemaUpdated,
  productsSubSizesSchema,
} from "@/services/schema/productsSchema";
import { useDispatch, useSelector } from "react-redux";

import FormPopup from "@/components/sections/FormPopup";
import InputFormAdmin from "@/components/ui/InputFormAdmin";
import IsArray from "@/components/ui/IsArray";
import { MdModeEdit } from "react-icons/md";
import ProductTable from "@/components/pages/products/ProductTable";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import UploadImages from "@/components/sections/UploadImages";
import { allowedRoles } from "@/services/utils/allowedRoles";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { withRoleGuard } from "@/hooks/withRoleGuard";
import { zodResolver } from "@hookform/resolvers/zod";

const RichTextEditor = dynamic(
  () => import("@/components/sections/RichTextEditor"),
  {
    ssr: false,
  }
);

function Products() {
  const [showFormPopup, setShowFormPopup] = useState({
    state: false,
    action: undefined,
  });
  const [showSubFormSize, setShowSubFormSize] = useState({
    state: false,
    action: undefined,
  });
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
      showFormPopup.action == "created" ? productsSchema : productsSchemaUpdated
    ),
  });

  const {
    register: registerSizes,
    handleSubmit: handleSubmitSizes,
    watch: watchSizes,
    setValue: setValueSizes,
    formState: { errors: errorsSize },
    clearErrors: clearErrorsSizes,
    reset: resetSizes,
    setError: setErrorSizes,
  } = useForm({
    resolver: zodResolver(productsSubSizesSchema),
  });
  const dispatch = useDispatch();
  const editorRef = useRef(null); // Ref for RichTextEditor
  const [modal, contextHolder] = Modal.useModal();
  const { products, validators, onRefresh, isLoading } =
    useSelector(productsSelector);
  const onSubmit = (data) => {
    console.log(data);
    if (showFormPopup.action == "created") dispatch(handleCreateProduct(data));
    if (showFormPopup.action == "updated") {
      dispatch(handleUpdateProduct(data));
    }
  };
  const onSubmitSizes = async (data) => {
    const sizes = watch("sizes");
    if (showSubFormSize.action == "created") {
      const type = data?.type?.split("=>");
      if (Array.isArray(type) && type.length > 1) {
        const [a, b] = type;
        if (isNaN(a) || isNaN(b)) {
          setErrorSizes("type", {
            type: "server",
            message: `Không đúng định dạng số.`,
          });
        } else {
          dispatch(handleChangeLoading(true));
          if (+a > +b) {
            setErrorSizes("type", {
              type: "server",
              message: `Cấu trúc không hợp lệ vui lòng nhập từ bé đến lớn (${b}=>${a})`,
            });
          } else {
            const storeTypes = [];
            for (let index = +a; index <= +b; index++) {
              let IsUnique = Array.isArray(sizes)
                ? sizes.every((_) => _.type != String(index))
                : true;
              if (IsUnique) storeTypes.push(String(index));
            }

            const resultAutoCreate = await Promise.all(
              storeTypes.map((_) => ({
                ...data,
                type: _,
              }))
            );
            if (Array.isArray(sizes) && sizes?.length > 0) {
              sizes.push(...resultAutoCreate);
              setValue("sizes", sizes);
            } else {
              setValue("sizes", resultAutoCreate);
            }
          }
          setTimeout(() => {
            dispatch(handleChangeLoading(false));
          }, 1000);
        }
      } else {
        if (Array.isArray(sizes) && sizes?.length > 0) {
          let IsUnique = sizes.every((_) => _.type != data.type);
          if (IsUnique) {
            sizes.push(data);
            setValue("sizes", sizes);
          } else {
            setErrorSizes("type", {
              type: "server",
              message: "Loại sản phẩm đã tồn tại.",
            });
          }
        } else {
          setValue("sizes", [data]);
        }
      }
    }
    if (showSubFormSize.action == "updated") {
      if (Array.isArray(sizes) && sizes?.length > 0) {
        let IsUnique = sizes.every((_, index) => {
          if (index === showSubFormSize.index) return true;
          return _.type != data.type;
        });
        if (IsUnique) {
          sizes.splice(showSubFormSize.index, 1, watchSizes());
          setValue("sizes", sizes);
          setShowSubFormSize({
            state: true,
            action: "created",
          });
        } else {
          setErrorSizes("type", {
            type: "server",
            message: "Loại sản phẩm đã tồn tại.",
          });
        }
      }
    }
  };

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (products?.length == 0) dispatch(handleGetProducts());
    }, 200);
    return () => clearTimeout(timerID);
  }, [products?.length]);

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
      setShowFormPopup({
        state: false,
        action: undefined,
      });
    }
  }, [onRefresh]);

  console.log("errors", errors);
  console.log("watch", watch());
  return (
    <div className="w-full h-full z-10 text-black relative ">
      <div className="p-6 z-0">
        <div className="flex justify-between items-center">
          <div className="mb-4 font-bold text-5xl text-rose-700">
            <span>Quản trị sản phẩm </span>
            <span className=" text-3xl">({products?.length} sản phẩm)</span>
          </div>
          <div
            className="font-bold rounded bg-green-500 p-2 px-3 text-white text-lg hover:bg-green-400 cursor-pointer"
            onClick={(e) => {
              setShowFormPopup({
                state: true,
                action: "created",
              });
              reset();
            }}
          >
            Thêm sản phẩm +
          </div>
        </div>
        <div>
          <ProductTable
            data={products}
            onUpdate={(data) => {
              console.log(data);
              const { targetGroup, category, brand } = data;
              if (targetGroup.id)
                setValue("targetGroupID", String(targetGroup.id));
              if (category.id) setValue("categoryID", String(category.id));
              if (brand?.id) setValue("brandID", String(brand?.id));
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
      {contextHolder}
      <FormPopup
        title={"Thêm sản phẩm"}
        isShowForm={showFormPopup?.state && showFormPopup.action == "created"}
        onClose={(state) => {
          reset();
          setShowFormPopup({
            action: undefined,
            state,
          });
        }}
      >
        <form
          className="grid grid-cols-4 gap-x-2 relative"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputFormAdmin
            classNameDiv={`col-span-2`}
            className={`${errors.name?.message ? "!border-red-500" : null}`}
            title="Tên sản phẩm"
            warn={errors.name?.message}
            type="text"
            placeholder="Tên sản phẩm"
            {...register("name")}
          />
          <InputFormAdmin
            classNameDiv={`col-span-2`}
            className={` ${errors.slug?.message ? "!border-red-500" : null}`}
            title="Slug"
            warn={errors.slug?.message}
            type="text"
            placeholder="Slug sản phẩm"
            {...register("slug")}
          />

          <InputFormAdmin
            classNameDiv={``}
            className={errors.barcode?.message ? "!border-red-500" : null}
            title="Barcode"
            warn={errors.barcode?.message}
            type="text"
            placeholder="Mã vạch sản phẩm"
            {...register("barcode")}
          />

          <InputFormAdmin
            classNameDiv={``}
            className={errors.costPrice?.message ? "!border-red-500" : null}
            title="Giá nhập (VNĐ)"
            warn={errors.costPrice?.message}
            type="text"
            placeholder="Giá nhập"
            value={formatPrice(watch("costPrice") || "")}
            {...register("costPrice", {
              setValueAs: (value) => parsePrice(value),
            })}
          />

          <InputFormAdmin
            classNameDiv={``}
            className={errors.sellingPrice?.message ? "!border-red-500" : null}
            title="Giá bán (VNĐ)"
            warn={errors.sellingPrice?.message}
            type="text"
            placeholder="Giá bán"
            value={formatPrice(watch("sellingPrice") || "")}
            {...register("sellingPrice", {
              setValueAs: (value) => parsePrice(value),
            })}
          />

          <InputFormAdmin
            classNameDiv={``}
            className={errors.discount?.message ? "!border-red-500" : null}
            title="Giảm giá (%)"
            warn={errors.discount?.message}
            type="text"
            placeholder="Giảm giá"
            {...register("discount")}
          />

          <SearchableDropdown
            className={errors.brandID?.message ? "!border-red-500" : null}
            title={"Thương hiệu"}
            placeholder="Nhập từ khóa tìm kiếm nhãn hàng."
            fieldIcon="logo"
            domain="product-brands"
            onOption={(_) => {
              clearErrors("brandID");
              if (_?.id) {
                setValue("brandID", String(_?.id));
              } else {
                const { brandID, ...args } = watch();
                reset(args);
              }
            }}
            warn={errors.brandID?.message}
          />
          <SearchableDropdown
            className={errors.categoryID?.message ? "!border-red-500" : null}
            title={"Danh mục"}
            placeholder="Nhập từ khóa tìm kiếm danh mục."
            domain="categories"
            onOption={(_) => {
              clearErrors("categoryID");
              if (_?.id) {
                setValue("categoryID", String(_?.id));
              } else {
                const { categoryID, ...args } = watch();
                reset(args);
              }
            }}
            warn={errors.categoryID?.message}
          />

          <SearchableDropdown
            className={errors.colors?.message ? "!border-red-500" : null}
            title={"Màu sắc"}
            fieldColor="hexCode"
            placeholder="Nhập từ khóa tìm kiếm."
            domain="product-colors"
            onOption={(_) => {
              clearErrors("colors");
              if (_?.id) {
                const colors = watch("colors");
                const storeColors = [];
                Array.isArray(colors) && storeColors.push(...colors);
                storeColors.push(_);
                setValue("colors", storeColors);
                console.log(watch("colors"));
              } else {
                const { categoryID, ...args } = watch();
                reset(args);
              }
            }}
            activeOptions={true}
            warn={errors.colors?.message}
          />

          <div className=" ">
            <SearchableDropdown
              className={
                errors.targetGroupID?.message ? "!border-red-500" : null
              }
              title={"Đối tượng sử dụng"}
              placeholder="Nhập từ khóa tìm kiếm đối tượng."
              domain="target-groups"
              onOption={(_) => {
                clearErrors("targetGroupID");
                if (_?.id) {
                  setValue("targetGroupID", String(_?.id));
                } else {
                  const { targetGroupID, ...args } = watch();
                  reset(args);
                }
              }}
              warn={errors.targetGroupID?.message}
            />
          </div>

          <div className="mt-2 col-span-4 flex flex-col">
            <label className="text-xs text-gray-500">Thêm loại sản phẩm</label>
            <div className="flex flex-wrap gap-2 mb-2 mt-3">
              <IsArray data={watch("sizes")}>
                {watch("sizes")?.map((_, key) => (
                  <div
                    className="border border-solid border-sky-500 px-4 py-3 rounded-xl text-blue-700 font-bold flex-[1] basis-auto relative"
                    key={key}
                  >
                    <div>
                      <h1 className=" ">
                        Loại:{" "}
                        <span className=" font-bold text-rose-700">
                          {_.type}
                        </span>
                      </h1>
                      <h1 className=" ">
                        Giá gốc:{" "}
                        <span className=" font-bold text-rose-700">
                          {formatCurrencyVND(+_.costPrice)}
                        </span>
                      </h1>
                      <h1 className=" ">
                        Giá bán:{" "}
                        <span className=" font-bold text-rose-700">
                          {formatCurrencyVND(+_.sellingPrice)}
                        </span>
                      </h1>
                      <h1 className=" ">
                        Giảm giá:{" "}
                        <span className=" font-bold text-rose-700">
                          {_.discount || 0}%
                        </span>
                      </h1>
                    </div>

                    <div className="absolute right-2 top-2 flex gap-1">
                      <div
                        className=" w-4 h-4 bg-green-500 hover:bg-green-700 rounded-full group cursor-pointer flex-center"
                        onClick={() => {
                          handleSetFieldForm(_, setValueSizes);
                          setShowSubFormSize({
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
                          const thisArraySize = watch("sizes");
                          thisArraySize.splice(key, 1);
                          setValue("sizes", thisArraySize);
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </IsArray>
            </div>
            <Button
              className=""
              onClick={() =>
                setShowSubFormSize({
                  action: "created",
                  state: true,
                })
              }
              type="primary"
            >
              Thêm loại sản phẩm
            </Button>
            <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
              {errors.sizes?.message}
            </p>
          </div>
          <IsArray data={watch("colors")}>
            <div className="mt-2 col-span-4 flex flex-col">
              <label className="text-xs text-gray-500">
                Màu sắc và ảnh sản phẩm
              </label>
              <div className="grid grid-cols-2 gap-2">
                {watch("colors")?.map((_, index) => {
                  return (
                    <div
                      className="border border-solid border-sky-500 px-4 py-3 rounded-xl text-blue-700 font-bold flex-[1] basis-auto relative"
                      key={index}
                    >
                      <div className=" flex flex-col justify-center">
                        <div
                          className=" w-6 h-6 rounded-lg shadow shadow-black"
                          style={{
                            backgroundColor: _.hexCode,
                          }}
                        ></div>
                        <span
                          className=" font-bold"
                          style={{
                            color: _.hexCode,
                          }}
                        >
                          {_.name}
                        </span>
                        <div className="">
                          <UploadImages
                            aspect={1 / 1}
                            quanlity={50}
                            getData={(value) => {
                              clearErrors("colors");
                              const colors = watch("colors");
                              const { files, ...rest } = colors[index];
                              colors.splice(index, 1, {
                                files: value,
                                ...rest,
                              });
                              setValue("colors", colors);
                            }}
                            placeholder="Upload picture products..."
                            warn={errors?.colors?.[index]?.files?.message}
                          />
                        </div>
                      </div>

                      <div className="absolute right-2 top-2 flex gap-1">
                        <div
                          className=" w-4 h-4 bg-rose-400 hover:bg-rose-700 rounded-full cursor-pointer"
                          onClick={async () => {
                            const confirmed = await modal.confirm({
                              title: `Bạn chắc chắn muốn xóa màu ${_.name}.`,
                            });
                            if (confirmed) {
                              const colors = watch("colors");
                              colors.splice(index, 1);
                              setValue("colors", colors);
                            }
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </IsArray>

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

          {/* <div className="mt-4 mb-3 w-11/12 mx-auto"> */}
          <div className="mt-4 flex justify-end fixed right-4 bottom-4">
            <button
              type="submit"
              className="px-4 py-1 rounded-md hover:opacity-75 bg-sky-500 text-white font-bold"
            >
              Cập nhật
            </button>
          </div>
          {/* </div> */}
        </form>
      </FormPopup>

      <FormPopup
        title={"Sửa sản phẩm"}
        isShowForm={showFormPopup?.state && showFormPopup.action == "updated"}
        onClose={(state) => {
          reset();
          setShowFormPopup({
            action: undefined,
            state,
          });
        }}
      >
        <form
          className="grid grid-cols-4 gap-x-2 relative"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputFormAdmin
            classNameDiv={`col-span-2`}
            className={`${errors.name?.message ? "!border-red-500" : null}`}
            title="Tên sản phẩm"
            warn={errors.name?.message}
            type="text"
            placeholder="Tên sản phẩm"
            {...register("name")}
          />
          <InputFormAdmin
            classNameDiv={`col-span-2`}
            className={` ${errors.slug?.message ? "!border-red-500" : null}`}
            title="Slug"
            warn={errors.slug?.message}
            type="text"
            placeholder="Slug sản phẩm"
            {...register("slug")}
          />

          <InputFormAdmin
            classNameDiv={``}
            className={errors.barcode?.message ? "!border-red-500" : null}
            title="Barcode"
            warn={errors.barcode?.message}
            type="text"
            placeholder="Mã vạch sản phẩm"
            {...register("barcode")}
          />

          <InputFormAdmin
            classNameDiv={``}
            className={errors.costPrice?.message ? "!border-red-500" : null}
            title="Giá nhập (VNĐ)"
            warn={errors.costPrice?.message}
            type="text"
            placeholder="Giá nhập"
            value={formatPrice(watch("costPrice") || "")}
            {...register("costPrice", {
              setValueAs: (value) => parsePrice(value),
            })}
          />

          <InputFormAdmin
            classNameDiv={``}
            className={errors.sellingPrice?.message ? "!border-red-500" : null}
            title="Giá bán (VNĐ)"
            warn={errors.sellingPrice?.message}
            type="text"
            placeholder="Giá bán"
            value={formatPrice(watch("sellingPrice") || "")}
            {...register("sellingPrice", {
              setValueAs: (value) => parsePrice(value),
            })}
          />

          <InputFormAdmin
            classNameDiv={``}
            className={errors.discount?.message ? "!border-red-500" : null}
            title="Giảm giá (%)"
            warn={errors.discount?.message}
            type="text"
            placeholder="Giảm giá"
            {...register("discount")}
          />

          <SearchableDropdown
            className={errors.brandID?.message ? "!border-red-500" : null}
            title={"Thương hiệu"}
            defaultOptions={watch("brand")}
            fieldIcon="logo"
            placeholder="Nhập từ khóa tìm kiếm nhãn hàng."
            domain="product-brands"
            onOption={(_) => {
              clearErrors("brandID");
              if (_?.id) {
                setValue("brandID", String(_?.id));
              } else {
                const { brandID, ...args } = watch();
                reset(args);
              }
            }}
            warn={errors.brandID?.message}
          />
          <SearchableDropdown
            className={errors.categoryID?.message ? "!border-red-500" : null}
            title={"Danh mục"}
            defaultOptions={watch("category")}
            placeholder="Nhập từ khóa tìm kiếm danh mục."
            domain="categories"
            onOption={(_) => {
              clearErrors("categoryID");
              if (_?.id) {
                setValue("categoryID", String(_?.id));
              } else {
                const { categoryID, ...args } = watch();
                reset(args);
              }
            }}
            warn={errors.categoryID?.message}
          />

          <SearchableDropdown
            className={errors.colors?.message ? "!border-red-500" : null}
            title={"Màu sắc"}
            placeholder="Nhập từ khóa tìm kiếm."
            domain="product-colors"
            onOption={(_) => {
              clearErrors("colors");
              if (_?.id) {
                const colors = watch("colors");
                const storeColors = [];
                Array.isArray(colors) && storeColors.push(...colors);
                storeColors.push(_);
                setValue("colors", storeColors);
                console.log(watch("colors"));
              } else {
                const { categoryID, ...args } = watch();
                reset(args);
              }
            }}
            activeOptions={true}
            warn={errors.colors?.message}
          />

          <div className=" ">
            <SearchableDropdown
              className={
                errors.targetGroupID?.message ? "!border-red-500" : null
              }
              title={"Đối tượng sử dụng"}
              placeholder="Nhập từ khóa tìm kiếm đối tượng."
              domain="target-groups"
              defaultOptions={watch("targetGroup")}
              onOption={(_) => {
                clearErrors("targetGroupID");
                if (_?.id) {
                  setValue("targetGroupID", String(_?.id));
                } else {
                  const { targetGroupID, ...args } = watch();
                  reset(args);
                }
              }}
              warn={errors.targetGroupID?.message}
            />
          </div>

          <InputFormAdmin
            classNameDiv={"flex flex-col mt-2"}
            className={`${
              !errors.isActive?.message ? null : "!border-red-500"
            } !w-fit`}
            warn={errors.isActive?.message}
            title={"Kích hoạt danh mục"}
            type="checkbox"
            {...register("isActive")}
          />

          <div className="mt-2 col-span-4 flex flex-col">
            <label className="text-xs text-gray-500">
              Danh sách loại sản phẩm
            </label>
            <div className="flex flex-wrap gap-2 mb-2 mt-3">
              <IsArray data={watch("sizes")}>
                {watch("sizes")?.map((_, key) => (
                  <div
                    className="border border-solid border-sky-500 px-4 py-3 rounded-xl text-blue-700 font-bold flex-[1] basis-auto relative"
                    key={key}
                  >
                    <div>
                      <h1 className=" ">
                        Loại:{" "}
                        <span className=" font-bold text-rose-700">
                          {_.type}
                        </span>
                      </h1>
                      <h1 className=" ">
                        Giá gốc:{" "}
                        <span className=" font-bold text-rose-700">
                          {formatCurrencyVND(+_.costPrice)}
                        </span>
                      </h1>
                      <h1 className=" ">
                        Giá bán:{" "}
                        <span className=" font-bold text-rose-700">
                          {formatCurrencyVND(+_.sellingPrice)}
                        </span>
                      </h1>
                      <h1 className=" ">
                        Giảm giá:{" "}
                        <span className=" font-bold text-rose-700">
                          {_.discount || 0}%
                        </span>
                      </h1>
                    </div>

                    <div className="absolute right-2 top-2 flex gap-1">
                      <div
                        className=" w-4 h-4 bg-green-500 hover:bg-green-700 rounded-full group cursor-pointer flex-center"
                        onClick={() => {
                          handleSetFieldForm(_, setValueSizes);
                          setShowSubFormSize({
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
                          const thisArraySize = watch("sizes");
                          const removes = watch("removes") ?? {};
                          const removeSizes = thisArraySize.splice(key, 1);
                          if (removeSizes) {
                            const { sizes = [] } = removes;
                            setValue("removes", {
                              ...removes,
                              sizes: [...sizes, removeSizes?.[0]?.id],
                            });
                          }
                          setValue("sizes", thisArraySize);
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </IsArray>
            </div>
            <Button
              className=""
              onClick={() =>
                setShowSubFormSize({
                  action: "created",
                  state: true,
                })
              }
              type="primary"
            >
              Sửa loại sản phẩm
            </Button>
            <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
              {errors.sizes?.message}
            </p>
          </div>
          <IsArray data={watch("colors")}>
            <div className="mt-2 col-span-4 flex flex-col">
              <label className="text-xs text-gray-500">
                Màu sắc và ảnh sản phẩm
              </label>
              <div className="grid grid-cols-2 gap-2">
                {watch("colors")?.map((_, index) => {
                  return (
                    <div
                      className="border border-solid border-sky-500 px-4 py-3 rounded-xl text-blue-700 font-bold flex-[1] basis-auto relative"
                      key={index}
                    >
                      <div className=" flex flex-col justify-center">
                        <div
                          className=" w-6 h-6 rounded-lg shadow shadow-black"
                          style={{
                            backgroundColor: _.hexCode,
                          }}
                        ></div>
                        <span
                          className=" font-bold"
                          style={{
                            color: _.hexCode,
                          }}
                        >
                          {_.name}
                        </span>
                        <div className="">
                          <UploadImages
                            aspect={1 / 1}
                            quanlity={50}
                            onDelete={(value = []) => {
                              const { images = [], ...rest } =
                                watch("removes") ?? {};
                              if (Array.isArray(watch("images"))) {
                                const removeImageID = watch("images").reduce(
                                  (acc, image) => {
                                    if (image?.src == value)
                                      acc.push(image?.id);
                                    return acc;
                                  },
                                  []
                                );
                                setValue("removes", {
                                  ...rest,
                                  images: [...images, ...removeImageID],
                                });
                              }
                            }}
                            getData={(value) => {
                              const filterValue = value.filter((_) => {
                                if (_.uid) return _;
                              });
                              clearErrors("colors");
                              const colors = watch("colors");
                              const { files, ...rest } = colors[index];
                              colors.splice(index, 1, {
                                ...rest,
                                files: filterValue,
                              });
                              setValue("colors", colors);
                            }}
                            restImage={(value) => {
                              console.log(value);
                              // clearErrors("colors");
                              // const colors = watch("colors");
                              // const { files, ...rest } = colors[index];
                              // colors.splice(index, 1, {
                              //   ...rest,
                              //   files: value,
                              // });
                              // setValue("colors", colors);
                            }}
                            defaultDataUrl={
                              Array.isArray(watch("images"))
                                ? watch("images").reduce((acc, image) => {
                                    if (image?.color?.id == _?.id) {
                                      acc.push(image.src);
                                    }
                                    return acc;
                                  }, [])
                                : []
                            }
                            placeholder="Upload picture products..."
                            warn={errors?.colors?.[index]?.files?.message}
                          />
                        </div>
                      </div>

                      <div className="absolute right-2 top-2 flex gap-1">
                        <div
                          className=" w-4 h-4 bg-rose-400 hover:bg-rose-700 rounded-full cursor-pointer"
                          onClick={async () => {
                            const confirmed = await modal.confirm({
                              title: `Bạn chắc chắn muốn xóa màu ${_.name}.`,
                            });
                            if (confirmed) {
                              const watchColors = watch("colors");
                              const removes = watch("removes") ?? {};
                              const removeColors = watchColors.splice(index, 1);
                              if (Array.isArray(watch("images"))) {
                                const { images = [], colors = [] } = removes;
                                const removeImageID = watch("images").reduce(
                                  (acc, image) => {
                                    if (
                                      image?.color?.id == removeColors?.[0]?.id
                                    )
                                      acc.push(image?.id);
                                    return acc;
                                  },
                                  []
                                );
                                setValue("removes", {
                                  ...removes,
                                  images: [...images, ...removeImageID],
                                  colors: [...colors, removeColors?.[0]?.id],
                                });
                              }
                              setValue("colors", watchColors);
                            }
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </IsArray>
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
          {/* <div className="mt-4 mb-3 w-11/12 mx-auto"> */}
          <div className="mt-4 flex justify-end fixed right-4 bottom-4">
            <button
              type="submit"
              className="px-4 py-1 rounded-md hover:opacity-75 bg-sky-500 text-white font-bold"
            >
              Cập nhật
            </button>
          </div>
          {/* </div> */}
        </form>
      </FormPopup>

      <FormPopup
        title={
          showSubFormSize.action === "created"
            ? "Thêm loại sản phẩm"
            : "Sửa loại sản phẩm"
        }
        isShowForm={showSubFormSize.state}
        onClose={(state) => {
          resetSizes();
          setShowSubFormSize({
            action: undefined,
            state,
          });
        }}
      >
        <form onSubmit={handleSubmitSizes(onSubmitSizes)}>
          <div className=" flex gap-2">
            <InputFormAdmin
              classNameDiv={` flex-[0.5] `}
              className={` ${
                errorsSize.type?.message ? "!border-red-500" : null
              }`}
              warn={errorsSize.type?.message}
              title="Tên kích thước"
              type="text"
              placeholder="Tên kích thước"
              {...registerSizes("type")}
            />

            <InputFormAdmin
              classNameDiv={` flex-[0.5] `}
              className={
                errorsSize.costPrice?.message ? "!border-red-500" : null
              }
              title="Giá nhập (VNĐ)"
              warn={errorsSize.costPrice?.message}
              type="text"
              placeholder="Giá nhập"
              value={formatPrice(watchSizes("costPrice") || "")}
              {...registerSizes("costPrice", {
                setValueAs: (value) => parsePrice(value),
              })}
            />

            <InputFormAdmin
              classNameDiv={` flex-[0.5] `}
              className={
                errorsSize.sellingPrice?.message ? "!border-red-500" : null
              }
              title="Giá bán (VNĐ)"
              warn={errorsSize.sellingPrice?.message}
              type="text"
              placeholder="Giá bán"
              value={formatPrice(watchSizes("sellingPrice") || "")}
              {...registerSizes("sellingPrice", {
                setValueAs: (value) => parsePrice(value),
              })}
            />

            <InputFormAdmin
              classNameDiv={` flex-[0.5] `}
              className={
                errorsSize.discount?.message ? "!border-red-500" : null
              }
              title="Giảm giá (%)"
              warn={errorsSize.discount?.message}
              type="text"
              placeholder="Giảm giá"
              {...registerSizes("discount")}
            />
          </div>

          <InputFormAdmin
            classNameDiv={"flex flex-col gap-2 mt-2"}
            className={`${
              !errorsSize.isActive?.message ? null : "!border-red-500"
            } !w-fit`}
            defaultChecked
            warn={errorsSize.isActive?.message}
            title={"Kích hoạt"}
            type="checkbox"
            {...registerSizes("isActive")}
          />
          <div className="flex gap-2">
            {showSubFormSize.action == "updated" && (
              <Button
                type="primary"
                danger
                className={`w-full hover:opacity-75 text-white font-bold`}
                onClick={() => {
                  resetSizes();
                  setShowSubFormSize({
                    action: "created",
                    state: true,
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="primary"
              htmlType="submit"
              className={`w-full hover:opacity-75 bg-blue-700 text-white font-bold`}
            >
              {showSubFormSize.action == "created" ? "Thêm" : "Cập nhật"}
            </Button>
          </div>
          <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm ">
            Lưu ý: Tự động tạo nhiều size cùng lúc bằng cách nhập ô tên kích
            thước vd(1=&gt40)
          </p>
        </form>

        {showSubFormSize.action === "created" && (
          <div className="flex flex-wrap gap-2 mb-2 mt-3">
            <IsArray data={watch("sizes")}>
              {watch("sizes")?.map((_, key) => (
                <div
                  className="border border-solid border-sky-500 px-4 py-3 rounded-xl text-blue-700 font-bold flex-[1] relative basis-auto"
                  key={key}
                >
                  <div>
                    <h1 className=" ">
                      Loại:{" "}
                      <span className=" font-bold text-rose-700">{_.type}</span>
                    </h1>
                    <h1 className=" ">
                      Giá gốc:{" "}
                      <span className=" font-bold text-rose-700">
                        {formatCurrencyVND(+_.costPrice)}
                      </span>
                    </h1>
                    <h1 className=" ">
                      Giá bán:{" "}
                      <span className=" font-bold text-rose-700">
                        {formatCurrencyVND(+_.sellingPrice)}
                      </span>
                    </h1>
                    <h1 className=" ">
                      Giảm giá:{" "}
                      <span className=" font-bold text-rose-700">
                        {_.discount || 0}%
                      </span>
                    </h1>
                  </div>

                  <div className="absolute right-2 top-2 flex gap-1">
                    <div
                      className=" w-4 h-4 bg-green-500 hover:bg-green-700 rounded-full group cursor-pointer flex-center"
                      onClick={() => {
                        handleSetFieldForm(_, setValueSizes);
                        setShowSubFormSize({
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
                        const thisArraySize = watch("sizes");
                        thisArraySize.splice(key, 1);
                        setValue("sizes", thisArraySize);
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </IsArray>
          </div>
        )}
      </FormPopup>
    </div>
  );
}

export default withRoleGuard(Products, [allowedRoles.CEO]);
