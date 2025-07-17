import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "./styles.css";

import {
  Controller,
  EffectFade,
  FreeMode,
  Navigation,
  Pagination,
  Thumbs,
} from "swiper/modules";
import { FcNext, FcPrevious } from "react-icons/fc";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import Image from "next/image";
import { Image as ImageAntd } from "antd";
import { generateUrlImage } from "@/services/utils";

export default function SlideProduct({
  data = [],
  fieldImageUrl = "src",
  slidesPerView = 4,
  showFull = false,
  scrollToSlider = null,
  children,
  ...rest
}) {
  const swiperRef = useRef(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const goToSlide = (index) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  useEffect(() => {
    if (Number(scrollToSlider) >= 0) {
      goToSlide(scrollToSlider);
    }
  }, [scrollToSlider]);
  return (
    <React.Fragment>
      <div className="!overflow-hidden mb-3 rounded-sm">
        <Swiper
          style={{
            "--swiper-navigation-color": "#fff",
            "--swiper-pagination-color": "#fff",
          }}
          effect={showFull ? "fade" : "slide"}
          spaceBetween={10}
          thumbs={{ swiper: thumbsSwiper }}
          onActiveIndexChange={(value) => setCurrentIndex(value.activeIndex)}
          pagination={{
            type: "fraction",
            el: ".custom-pagination",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[FreeMode, Pagination, Navigation, Thumbs, EffectFade]}
          className="mySwiper2"
          keyboard={{
            enabled: true,
          }}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          {...rest}
        >
          {data.map((item, index) => (
            <SwiperSlide className="" key={index}>
              <div>
                <ImageAntd
                  src={generateUrlImage(item?.[fieldImageUrl])}
                  className="relative aspect-auto w-full rounded-sm !overflow-hidden object-cover"
                  alt="product"
                />
              </div>
            </SwiperSlide>
          ))}
          <div className=" absolute right-3 bottom-4 z-50 flex justify-center items-center">
            <div className="custom-pagination"></div>
          </div>
          <button
            className={`custom-prev absolute top-0 bottom-0 my-auto left-3 w-8 h-8 rounded-full bg-white border  z-50 flex text-base text-blue-500 items-center justify-center ${
              +currentIndex == 0
                ? "opacity-30"
                : "hover:border-blue-500 shadow shadow-gray-400 cursor-pointer"
            }`}
          >
            <FcPrevious />
          </button>

          <button
            className={`custom-next  absolute top-0 bottom-0 my-auto right-3 w-8 h-8 rounded-full bg-white border  z-50 flex text-base text-blue-500 items-center justify-center ${
              +currentIndex == data.length - 1
                ? "opacity-30"
                : "hover:border-blue-500 shadow shadow-gray-400 cursor-pointer"
            }`}
          >
            <FcNext />
          </button>
        </Swiper>
      </div>

      <div className="overflow-hidden">
        <Swiper
          onSwiper={setThumbsSwiper}
          slidesPerView={slidesPerView}
          spaceBetween={8}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs, Controller]}
          className="mySwiper"
        >
          {data.map((item, index) => (
            <SwiperSlide className="" key={index}>
              <div className="w-[90%] h-[80%] relative aspect-square border border-gray-500 rounded-lg cursor-pointer overflow-hidden">
                <div key={index} className="aspect-square w-full relative">
                  <Image
                    src={generateUrlImage(item?.[fieldImageUrl])}
                    className=""
                    fill
                    sizes="100vw"
                    alt="product"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </React.Fragment>
  );
}
