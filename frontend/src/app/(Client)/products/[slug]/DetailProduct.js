"use client";

import { Breadcrumb, Button, Result } from "antd";
import {
  authSelector,
  handleToggleLoginRequiredPrompt,
} from "@/services/redux/Slices/auth";
import {
  commentsSelector,
  handleGetWhereComments,
} from "@/services/redux/Slices/comments";
import {
  generateUrlImage,
  getDistanceFromLatLonInKm,
  handleConvertPrice,
} from "@/services/utils";
import {
  handleCreateCart,
  handleUpdateCart,
} from "@/services/redux/Slices/carts";
import {
  handleGetProduct,
  productsSelector,
} from "@/services/redux/Slices/products";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import Comments from "@/components/sections/Comments";
import Image from "next/image";
import InputQuantitySpinner from "@/components/ui/InputQuantitySpinner";
import IsArray from "@/components/ui/IsArray";
import { LiaDirectionsSolid } from "react-icons/lia";
import Link from "next/link";
import Responsive from "@/components/layout/Responsive";
import SendComment from "@/components/sections/Comments/SendComment";
import SlideProduct from "@/components/sections/SlideProduct";
import { TiLocation } from "react-icons/ti";
import Toastify from "@/components/sections/Toastify";
import { useGeolocated } from "react-geolocated";
import { useParams } from "next/navigation";
import { useRequireLogin } from "@/hooks/useRequireLogin";

function DetailProductPage() {
  const dispatch = useDispatch();
  const requireLogin = useRequireLogin();
  const { isAuthenticated } = useSelector(authSelector);
  const { product, isLoading } = useSelector(productsSelector);
  const { comments = [], onRefresh: onRefreshComments } =
    useSelector(commentsSelector);
  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeColor, setActiveColor] = useState(0);
  const [activeType, setActiveType] = useState(undefined);
  const [showFullProduct, setShowFullProduct] = useState({
    status: false,
    index: 0,
  });

  const sortedBranches = isGeolocationEnabled
    ? [
        ...(product?.colors?.[activeColor]?.sizes?.[activeType]?.branches ||
          []),
      ].sort((a, b) => {
        const distA = getDistanceFromLatLonInKm(
          coords?.latitude,
          coords?.longitude,
          a?.latitude,
          a?.longitude
        );
        const distB = getDistanceFromLatLonInKm(
          coords?.latitude,
          coords?.longitude,
          b?.latitude,
          b?.longitude
        );
        return distA - distB; // tăng dần
      })
    : product?.colors?.[activeColor]?.sizes?.[activeType]?.branches;

  useEffect(() => {
    if (!showFullProduct.status) {
      if (typeof window !== "undefined") {
        window.scrollTo(0, 100);
      }
    }
  }, [showFullProduct.status]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(handleGetProduct({ slug: slug }));
      getPosition();
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (product?.id)
      dispatch(handleGetWhereComments({ productID: product.id }));
  }, [product?.id, onRefreshComments]);

  return (
    <div className=" min-h-screen">
      {product?.id ? (
        <Responsive className="py-3 font-barlow">
          <div className="pb-3">
            <Breadcrumb
              items={[
                {
                  title: <Link href={"/"}>Trang chủ</Link>,
                },
                {
                  title: (
                    <Link href={`/search?category=${product?.category?.name}`}>
                      {product?.category?.name}
                    </Link>
                  ),
                },
                {
                  title: product?.name,
                },
              ]}
            />
          </div>
          <div className="relative flex justify-between gap-4 h-fit">
            <div className=" w-6/11">
              <div className="sticky top-0">
                <SlideProduct
                  data={product?.images ?? []}
                  onShowFull={setShowFullProduct}
                  scrollToSlider={product?.images?.findIndex((_) => {
                    if (
                      +_?.id == +product?.colors?.[activeColor]?.images?.[0]?.id
                    )
                      return _;
                  })}
                />
              </div>
            </div>
            <div className="w-5/11 flex-col flex gap-2">
              <div className="font-bold text-xl flex gap-1">
                <h1 className="">Thương hiệu: </h1>
                <h2 className=" text-blue-700">{product?.brand?.name}</h2>
              </div>
              <h1 className="font-bold text-2xl text-gray-950">
                {product?.name}
              </h1>

              {/* <div className=" w-full flex items-center text-[#4a4f63]">
                <div className="sku">
                  <span className="text-base font-normal cursor-pointer hover:opacity-70 transition-all duration-300">
                    {product?.sku}
                  </span>
                </div>
                <div className=" w-1 h-1 rounded-full bg-gray-400 mx-1.5"></div>
                <div className=" flex items-center gap-0.5">
                  <span>{product?.reviews?.star ?? 0}</span>
                  <FaStar className="text-yellow-500 text-sm" />
                </div>
                <div className=" w-1 h-1 rounded-full bg-gray-400 mx-1.5"></div>
                <span className=" text-blue-700 text-base">
                  {product?.reviews?.items?.length} đánh giá
                </span>
                <div className=" w-1 h-1 rounded-full bg-gray-400 mx-1.5"></div>
                <span className=" text-blue-700 text-base">
                  {product?.comments?.length} bình luận
                </span>
              </div> */}
              {/* Giá */}
              <div className=" text-blue-700 text-4xl font-bold flex items-center gap-2 my-2">
                <span>
                  {handleConvertPrice(
                    product?.colors?.[activeColor].sizes?.[activeType]
                      ?.sellingPrice *
                      (1 -
                        product?.colors?.[activeColor].sizes?.[activeType]
                          ?.discount /
                          100) >
                      0
                      ? product?.colors?.[activeColor].sizes?.[activeType]
                          ?.sellingPrice *
                          (1 -
                            product?.colors?.[activeColor].sizes?.[activeType]
                              ?.discount /
                              100)
                      : product?.sellingPrice * (1 - product?.discount / 100)
                  )}
                </span>

                {(product?.colors?.[activeColor].sizes?.[activeType]?.discount >
                  0 || product?.discount / 100) > 0 && (
                  <span
                    className={`${
                      (product?.colors?.[activeColor].sizes?.[activeType]
                        ?.sellingPrice *
                        (1 -
                          product?.colors?.[activeColor].sizes?.[activeType]
                            ?.discount /
                            100) >
                        0 ||
                        product?.sellingPrice *
                          (1 - product?.discount / 100)) &&
                      "line-through text-3xl text-slate-500"
                    }`}
                  >
                    {handleConvertPrice(
                      product?.colors?.[activeColor].sizes?.[activeType]
                        ?.sellingPrice > 0
                        ? product?.colors?.[activeColor].sizes?.[activeType]
                            ?.sellingPrice
                        : product?.sellingPrice
                    )}
                  </span>
                )}
              </div>

              <div className=" font-medium text-xl flex flex-col gap-1">
                <h1 className="font-bold ">Màu sắc: </h1>
                <div className="flex flex-wrap gap-2">
                  {product?.colors?.map((_, index) => {
                    return (
                      <div
                        key={index}
                        className={`w-16 h-16 rounded-lg overflow-hidden relative ${
                          activeColor == index && ""
                        }`}
                        style={{
                          borderColor: _?.hexCode,
                          boxShadow:
                            activeColor == index &&
                            `0 5px 10px -3px ${_?.hexCode}, 0 4px 6px -4px ${_?.hexCode}`,
                        }}
                        onClick={() => setActiveColor(index)}
                      >
                        <Image
                          src={generateUrlImage(_?.images?.[0]?.src)}
                          alt="colors"
                          fill
                          sizes="100vw"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className=" font-medium text-xl flex flex-col gap-1">
                <h1 className="font-bold ">Size: </h1>
                <div className="flex flex-wrap gap-2">
                  {product?.colors?.[activeColor]?.sizes?.map((_, index) => {
                    return (
                      <div
                        className={` rounded-sm py-0.5 px-5 border border-gray-400 ${
                          _?.inventory <= 0
                            ? `opacity-20 cursor-no-drop`
                            : activeType == index
                            ? "bg-slate-950 text-white font-bold"
                            : "hover:bg-slate-500 hover:text-white cursor-pointer"
                        }`}
                        onClick={() => {
                          if (_?.inventory > 0) {
                            getPosition();
                            setActiveType(index);
                          }
                        }}
                        key={index}
                      >
                        <span>{_?.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className=" font-medium text-xl flex flex-col gap-1">
                <h1 className="font-bold ">Số lượng: </h1>
                <div
                  className={`${
                    typeof activeType !== "number" && "opacity-25"
                  }`}
                >
                  <InputQuantitySpinner
                    defaultValue={+quantity ?? 0}
                    refresh={activeType}
                    max={
                      product?.colors?.[activeColor]?.sizes?.[activeType]
                        ?.inventory
                        ? +product?.colors?.[activeColor]?.sizes?.[activeType]
                            ?.inventory
                        : 0
                    }
                    onOption={(quantity) => setQuantity(+quantity)}
                  />
                </div>
              </div>

              <div className=" flex justify-between gap-2 mt-2">
                <Button
                  type="primary"
                  disabled={
                    product?.colors?.[activeColor]?.sizes?.[activeType]
                      ?.inventory <= 0
                  }
                  onClick={() => {
                    if (
                      product?.colors?.[activeColor]?.sizes?.[activeType]
                        ?.inventory <= 0
                    ) {
                      Toastify(1, "Sản phẩm đã được bán hết.");
                    }

                    requireLogin(() => {
                      if (
                        +product?.colors?.[activeColor]?.id &&
                        +product?.colors?.[activeColor]?.sizes?.[activeType]?.id
                      ) {
                        dispatch(
                          handleCreateCart({
                            colorID: +product?.colors?.[activeColor]?.id,
                            sizeID:
                              +product?.colors?.[activeColor]?.sizes?.[
                                activeType
                              ]?.id,
                            quantity,
                          })
                        );
                      } else {
                        if (!product?.colors?.[activeColor]?.id) {
                          Toastify(0, "Vui lòng chọn màu sắc sản phẩm.");
                        }
                        if (
                          !product?.colors?.[activeColor]?.sizes?.[activeType]
                            ?.id
                        ) {
                          Toastify(0, "Vui lòng chọn kích thước sản phẩm.");
                        }
                      }
                    });
                  }}
                  className="w-full"
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>

              {/* Cửa hàng gần nhất */}
              <IsArray
                data={
                  product?.colors?.[activeColor]?.sizes?.[activeType]?.branches
                }
              >
                <div className=" border border-gray-300 rounded-lg w-full text-sm font-medium my-3">
                  <div className=" p-3">
                    <h1 className=" text-slate-800 py-2">
                      Gợi ý cửa hàng gần bạn
                    </h1>

                    <div className=" flex flex-col gap-2 pt-2">
                      {product?.colors?.[activeColor]?.sizes?.[
                        activeType
                      ]?.branches?.map((_, index) => {
                        return (
                          <div
                            key={index}
                            className={`flex justify-between items-center pb-2 ${
                              index < 2 && "border-b border-gray-300"
                            }`}
                          >
                            <div className=" flex flex-col gap-1">
                              <div className=" flex items-center gap-2">
                                <h1 className=" text-base text-slate-950 font-semibold">
                                  {_?.name}{" "}
                                </h1>

                                <div className=" text-green-500">
                                  <div className="flex items-center gap-1">
                                    <div className=" w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className=" text-sm">Có hàng</span>
                                  </div>
                                </div>
                              </div>
                              <div className=" flex items-center gap-2 font-normal text-sm">
                                <TiLocation className=" text-gray-500" />
                                <span className=" font-medium">
                                  {_?.address}
                                </span>

                                <span className="font-bold">
                                  {isGeolocationEnabled &&
                                    getDistanceFromLatLonInKm(
                                      coords?.latitude,
                                      coords?.longitude,
                                      _?.latitude,
                                      _?.longitude
                                    )}
                                  KM
                                </span>
                              </div>
                            </div>
                            <a
                              href={`https://www.google.com/maps?q=${_?.latitude},${_?.longitude}`}
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(
                                  `https://www.google.com/maps?q=${_?.latitude},${_?.longitude}`
                                );
                              }}
                            >
                              <div className=" text-blue-700 font-medium text-sm flex-center gap-1">
                                <LiaDirectionsSolid />
                                <span>Chỉ đường</span>
                              </div>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </IsArray>

              <div className=" font-medium text-xl mt-2">
                <h1 className="font-bold ">Mô tả: </h1>
                <div
                  className="ql-editor text-xl font-barlow"
                  dangerouslySetInnerHTML={{ __html: product?.description }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 text-lg font-semibold rounded-sm  p-3 shadow-sm">
            <div className="">
              <SendComment
                fieldComment={{
                  productID: +product?.id,
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

          {/* Đánh giá sản phẩm */}
          {/* <div className="mt-8 p-3 text-lg font-semibold bg-white rounded-lg">
            <div className=" flex items-center gap-2 mb-4 pb-3">
              <span className="">Đánh giá sản phẩm</span>
              <span className=" text-slate-500 text-base font-normal">
                {product?.reviews.items.length} đánh giá
              </span>
            </div>
            <div className=" border-y border-gray-300 py-3 flex gap-8">
              <div className=" flex flex-col gap-2 w-fit">
                <h2 className=" font-medium text-base text-slate-800">
                  Trung bình
                </h2>
                <div className=" flex items-center gap-0.5 text-4xl">
                  <span>{product?.reviews.star || 0}</span>
                  <FaStar className="text-orange-500 text-xl" />
                </div>
                <Button
                  className=" bg-blue-700 text-white font-medium"
                  text="Gửi đánh giá"
                />
              </div>

              <div className=" flex gap-2">
                <div className=" flex-1 flex flex-col items-center gap-2">
                  {FackData.slice(0, 5).map((_, index) => {
                    const currentTotalStar = product?.reviews.items.filter(
                      (value) => {
                        if (value.score == 5 - index) return value;
                      }
                    ).length;

                    console.log(currentTotalStar);
                    return (
                      <div key={index} className=" flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {FackData.slice(0, 5).map((star, ix) => {
                            const starActive = 5 - index;
                            return (
                              <FaStar
                                key={ix}
                                size={14}
                                className={`${
                                  ix >= starActive
                                    ? "text-slate-500"
                                    : "text-orange-500"
                                }`}
                              />
                            );
                          })}
                        </div>
                        <div className="h-2 w-52 rounded-full bg-gray-300 overflow-hidden">
                          <div
                            className={`h-full bg-orange-500 rounded-full ${
                              product?.reviews.items && currentTotalStar
                                ? `w-[${
                                    (100 / product?.reviews.items.length) *
                                    currentTotalStar
                                  }%]`
                                : `w-0`
                            }`}
                          ></div>
                        </div>

                        <span className=" text-sm font-normal">
                          {currentTotalStar}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className=" py-3">
              <div className=" flex items-center gap-3">
                <span className=" font-normal text-base">Lọc theo:</span>
                <div>
                  {FackData.slice(0, 5).map((it, ix) => {
                    const currentStar = 5 - ix;
                  })}
                </div>
              </div>
              {product?.reviews.items.map((_, key) => {
                if (filterReviewStars) {
                  if (_.score === filterReviewStars) return <Comments {..._} />;
                } else {
                  return <Comments {..._} />;
                }
              })}
            </div>
          </div>

          <div className="mt-8 p-3 text-lg font-semibold bg-white rounded-lg">
            <div className=" flex items-center gap-2 mb-4 pb-3">
              <span className="">Hỏi đáp</span>
              <span className=" text-slate-500 text-base font-normal">
                ( {product?.comments.length} bình luận )
              </span>
            </div>

            <div className=" py-3">
              <div className=" flex items-center gap-3">
                <span className=" font-normal text-base">Lọc theo:</span>
                <div></div>
              </div>
              {product?.comments.map((_, key) => {
                return <Comments {..._} key={key} />;
              })}
            </div>
          </div> */}
        </Responsive>
      ) : (
        !isLoading && (
          <Result
            status="404"
            title="404"
            subTitle="Sản phẩm không tồn tại trên hệ thống."
          />
        )
      )}
    </div>
  );
}

export default DetailProductPage;
