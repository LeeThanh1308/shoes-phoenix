"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { BsFillSuitSpadeFill } from "react-icons/bs";
import { GiDiamonds } from "react-icons/gi";
import Image from "next/image";
import { IoMdHeart } from "react-icons/io";
import Marquee from "react-fast-marquee";
import { RiPokerClubsFill } from "react-icons/ri";
import { bootstrapSelector } from "@/services/redux/Slices/bootstrap";
import { useSelector } from "react-redux";

const suitIcons = [
  <GiDiamonds size={12} className=" text-rose-500" />,
  <IoMdHeart size={12} className=" text-blue-500" />,
  <BsFillSuitSpadeFill size={12} className=" text-yellow-500" />,
  <RiPokerClubsFill size={12} className=" text-green-500" />,
];
function AuthLayout({ children }) {
  const divRef = useRef(null);
  const { brands = [] } = useSelector(bootstrapSelector);
  const [loopMarquee, setLoopMarquee] = useState([]);
  useEffect(() => {
    const timerID = setTimeout(() => {
      if (typeof window !== "undefined" && divRef.current) {
        const lengthArray = Math.ceil(
          +window.innerHeight /
            +divRef?.current?.getBoundingClientRect()?.height
        );
        const newLoopMarquee = new Array(lengthArray).fill("");
        setLoopMarquee(newLoopMarquee);
      }
    }, 500);

    return () => clearTimeout(timerID);
  }, [divRef?.current?.getBoundingClientRect()?.height]);
  return (
    <div>
      <div className=" absolute top-0 right-0 left-0 bottom-0 z-0 w-full h-screen overflow-hidden opacity-60">
        <Marquee
          speed={Math.floor(Math.random() * 10) + 1}
          gradient={false}
          ref={divRef}
          className="z-0"
        >
          {[...brands, ...brands].map((_, index) => {
            const suit = suitIcons?.[index % 4];
            return (
              <div key={index} className=" flex items-center">
                {index == 0 && suit}
                <div className=" px-8 flex gap-2 items-center font-dancing-script">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_DOMAIN_API}${process.env.NEXT_PUBLIC_PARAM_GET_FILE_API}${_.logo}`}
                    style={{
                      objectFit: "contain",
                      width: "auto",
                      height: "auto",
                    }}
                    width={30}
                    height={20}
                    alt="logo"
                  />
                  <p>{_.name}</p>
                </div>
                {suitIcons?.[(index + 1) % 4]}
              </div>
            );
          })}
        </Marquee>

        {loopMarquee?.map((_, index) => {
          return (
            <Marquee
              direction={`${index % 2 == 0 ? "right" : "left"}`}
              speed={Math.floor(Math.random() * 10) + 1}
              gradient={false}
              key={index}
              className="z-0"
            >
              {[...brands, ...brands].map((_, index) => {
                const suit = suitIcons?.[index % 4];
                return (
                  <div key={index} className=" flex items-center">
                    {index == 0 && suit}
                    <div className=" px-8 flex gap-2 items-center font-dancing-script">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_DOMAIN_API}${process.env.NEXT_PUBLIC_PARAM_GET_FILE_API}${_.logo}`}
                        style={{
                          objectFit: "contain",
                          width: "auto",
                          height: "auto",
                        }}
                        width={30}
                        height={20}
                        alt="logo"
                      />
                      <p>{_.name}</p>
                    </div>
                    {suitIcons?.[(index + 1) % 4]}
                  </div>
                );
              })}
            </Marquee>
          );
        })}
      </div>
      <div className="relative font-barlow z-10">{children}</div>
    </div>
  );
}

export default AuthLayout;
