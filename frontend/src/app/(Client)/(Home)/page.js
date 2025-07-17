"use client";

import {
  bootstrapSelector,
  handleGetProductBrands,
  handleGetTrendingProducts,
} from "@/services/redux/Slices/bootstrap";
import {
  handleGetSliders,
  sliderSelector,
} from "@/services/redux/Slices/sliders";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Image from "next/image";
import Responsive from "@/components/layout/Responsive";
import dynamic from "next/dynamic";
import { generateUrlImage } from "@/services/utils";

const ProductSection = dynamic(
  () => import("@/components/sections/ProductSection"),
  { ssr: false }
);
const SliderShowImage = dynamic(
  () => import("@/components/sections/SliderShowImage/SliderShowImage"),
  { ssr: false }
);

function Page() {
  const dispatch = useDispatch();
  const { trendings, productBrands } = useSelector(bootstrapSelector);
  const { sliders } = useSelector(sliderSelector);
  const [activeImage, setActiveImage] = useState(0);

  const handleActiveImageChange = useCallback((index) => {
    setActiveImage(index);
  }, []);

  useEffect(() => {
    if (trendings?.products?.length === 0) {
      dispatch(handleGetTrendingProducts());
    }
    if (productBrands?.length === 0) {
      dispatch(handleGetProductBrands());
    }
    if (sliders?.length === 0) {
      dispatch(handleGetSliders());
    }
  }, [
    dispatch,
    trendings?.products?.length,
    productBrands?.length,
    sliders?.length,
  ]);

  return (
    <div>
      <Responsive>
        <div className=" w-full h-[40vh] relative z-10 flex justify-between gap-1 mt-3 mb:mt-0">
          <div className="tl:w-3/4 mb:w-full relative rounded-sm overflow-hidden h-full">
            <SliderShowImage
              data={sliders}
              speed={5000}
              onActiveImage={handleActiveImageChange}
            />
          </div>
          <div className="w-1/4 flex flex-col gap-1 mb:hidden lt:flex tl:flex">
            <div className=" flex-1 w-full rounded-sm overflow-hidden relative">
              {sliders?.[
                sliders.length >= activeImage + 2 ? activeImage + 1 : 0
              ]?.src && (
                <Image
                  src={generateUrlImage(
                    sliders?.[
                      sliders.length >= activeImage + 2 ? activeImage + 1 : 0
                    ]?.src
                  )}
                  fill
                  sizes="25vw"
                  alt="banner"
                />
              )}
            </div>
            <div className=" flex-1 w-full rounded-sm overflow-hidden relative">
              {sliders?.[
                sliders?.length > activeImage + 2 ? activeImage + 2 : 1
              ]?.src && (
                <Image
                  src={generateUrlImage(
                    sliders?.[
                      sliders?.length > activeImage + 2 ? activeImage + 2 : 1
                    ]?.src
                  )}
                  fill
                  sizes="25vw"
                  alt="banner 2"
                />
              )}
            </div>
          </div>
        </div>

        <ProductSection
          title="Sản phẩm bán chạy"
          data={trendings?.products?.slice(0, 8)}
        />

        {productBrands.map((_, index) => {
          return (
            <ProductSection
              key={index}
              title={`${_.name}`}
              data={_?.products?.slice(0, 8)}
            />
          );
        })}
      </Responsive>
    </div>
  );
}

export default Page;
