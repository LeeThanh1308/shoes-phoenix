import Image from "next/image";
import MarqueeBrands from "./MarqueeBrands";
import ProductItem from "./ProductItem";
import { generateUrlImage } from "@/services/utils";
import { memo } from "react";

function ProductSection({ title = "", data = [], key = "" }) {
  if (Array.isArray(data) && data?.length > 0)
    return (
      <div className=" mt-8" key={`ProductSection-${key}`}>
        <div className=" flex items-center justify-center">
          <div className="h-0.5 flex-[0.3] bg-rose-700"></div>

          <h2 className=" shrink-0 font-dancing-script font-bold text-3xl text-center text-rose-700 px-8">
            {title}
          </h2>
          <div className="h-0.5 flex-[0.3] bg-rose-700"></div>
        </div>

        <div className=" grid lt:grid-cols-5 mb:grid-cols-1 gap-3">
          {data?.map((_, index) => {
            return <ProductItem data={_} key={index} />;
          })}
        </div>
        <div className="pt-2 pb-3">
          <MarqueeBrands width={20} height={10} className="!text-xs" />
        </div>
      </div>
    );
}

export default memo(ProductSection);
