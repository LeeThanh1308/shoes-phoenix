"use client";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./stylesSliderShowImage.css";

import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import React, { memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import Image from "next/image";
import Link from "next/link";
import { generateUrlImage } from "@/services/utils";
import { useElementSize } from "@/hooks/useElementSize";

function SliderShowImage({ data, onActiveImage = (index) => {}, ...props }) {
  const [parentRef, { width, height }] = useElementSize();
  return (
    <Swiper
      effect="fade"
      fadeEffect={{ crossFade: true }}
      grabCursor={true}
      centeredSlides={true}
      slidesPerView={1}
      pagination={true}
      onActiveIndexChange={(swiper) => onActiveImage(swiper?.activeIndex)}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      modules={[EffectFade, Pagination, Navigation, Autoplay]}
      ref={parentRef}
      className=" w-full h-full relative z-0"
      {...props}
    >
      {data.map((_, i) => {
        return (
          <SwiperSlide key={i}>
            {_?.href ? (
              <Link href={_?.href ?? "/"}>
                <Image
                  src={`${generateUrlImage(_?.src)}`}
                  alt={`Slider-${_?.name}`}
                  style={{
                    objectFit: "cover",
                  }}
                  width={width}
                  height={height}
                  priority={i == 0}
                />
              </Link>
            ) : (
              <Image
                src={`${generateUrlImage(_?.src)}`}
                alt={`Slider-${_?.name}`}
                style={{ objectFit: "cover" }}
                width={width}
                height={height}
                priority={i == 0}
              />
            )}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

export default memo(SliderShowImage);
