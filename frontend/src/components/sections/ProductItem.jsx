"use client";

import { generateUrlImage, handleConvertPrice } from "@/services/utils";
import { memo, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useElementSize } from "@/hooks/useElementSize";

function ProductItem({ showTypes = false, data = {}, ...props }) {
  const [imageActive, setImageActive] = useState(0);
  const [productImageRef, productImageSize] = useElementSize();
  return (
    <div
      className=" flex flex-col text-rose-500 text-xl rounded-xl bg-white shadow-md hover:shadow-lg shadow-black/25 transition-shadow space-y-2 relative mb:rounded-sm overflow-hidden"
      key={`ProductItem-${data?.id}`}
      {...props}
    >
      {Number(data?.discount) > 0 && (
        <div className=" absolute top-0 left-0 px-3 py-0.5 z-20 bg-rose-500 rounded-br-xl text-sm  font-bold text-white">
          {data?.discount}%
        </div>
      )}
      <Link
        className=" h-full flex flex-col justify-between p-3"
        href={`/products/${data?.slug}`}
      >
        {/* Hình ảnh sản phẩm */}
        <div
          ref={productImageRef}
          className="relative w-full aspect-square overflow-hidden shrink-0"
        >
          <Image
            src={`${generateUrlImage(
              showTypes
                ? data?.colors[imageActive]?.images?.[0]?.src
                : data?.src ?? data?.images?.[0]?.src
            )}`}
            alt="image products"
            width={productImageSize.width}
            height={productImageSize.height}
          />

          {showTypes && (
            <div
              className="absolute bottom-1 right-0 left-0 m-auto"
              onClick={(e) => e.preventDefault()}
            >
              <div className="flex justify-center gap-2">
                {data?.colors?.map((_, index) => (
                  <div
                    key={index}
                    className={`h-8 w-8 rounded-md overflow-hidden relative text-shadow ${
                      imageActive == index && "border border-black"
                    }`}
                    onClick={() => {
                      setImageActive(index);
                    }}
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_DOMAIN_API}${process.env.NEXT_PUBLIC_PARAM_GET_FILE_API}${_?.images?.[0]?.src}`}
                      alt="image"
                      width={32}
                      height={32}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="h-full flex flex-col justify-between">
          {/* Thông tin sản phẩm */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700 ">
              {data?.brand?.name}
            </h2>
            <div className="flex items-center gap-1">
              {/* <span className="text-lg font-medium text-gray-700">5</span>
          <FaStar size={14} className="text-rose-500" /> */}
            </div>
          </div>

          <p className="text-gray-800 line-clamp-2">{data?.name}</p>

          {/* Giá sản phẩm */}
          <div className="flex items-center gap-2">
            {data?.discount ? (
              <h2 className="text-lg font-bold text-red-500">
                {handleConvertPrice(
                  data?.sellingPrice * (1 - data?.discount / 100)
                )}
              </h2>
            ) : null}
            <h2
              className={`text-sm font-bold text-red-500 ${
                data.discount > 0 && "line-through"
              }`}
            >
              {handleConvertPrice(
                data?.sizes?.sellingPrice
                  ? data?.sizes?.sellingPrice
                  : data?.sellingPrice
              )}
            </h2>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductItem);
