import { BsFillSuitSpadeFill } from "react-icons/bs";
import { GiDiamonds } from "react-icons/gi";
import Image from "next/image";
import { IoMdHeart } from "react-icons/io";
import Marquee from "react-fast-marquee";
import { RiPokerClubsFill } from "react-icons/ri";
import { bootstrapSelector } from "@/services/redux/Slices/bootstrap";
import { generateUrlImage } from "@/services/utils";
import { useSelector } from "react-redux";

const suitIcons = [
  <GiDiamonds size={12} className=" text-rose-500" />,
  <IoMdHeart size={12} className=" text-blue-500" />,
  <BsFillSuitSpadeFill size={12} className=" text-yellow-500" />,
  <RiPokerClubsFill size={12} className=" text-green-500" />,
];

function MarqueeBrands({ width = 30, height = 20, ...props }) {
  const { brands = [] } = useSelector(bootstrapSelector);
  return (
    <Marquee {...props}>
      {brands.map((_, index) => {
        const suit = suitIcons?.[index % 4];
        return (
          <div key={index} className=" flex items-center">
            {suit}
            <div className=" px-8 flex gap-2 items-center ">
              <Image
                src={`${generateUrlImage(_.logo)}`}
                style={{ objectFit: "contain", width: "auto", height: "auto" }}
                width={width}
                height={height}
                alt="logo"
              />
              <p>{_.name}</p>
            </div>
            {brands?.length - 1 == index && suitIcons?.[(index + 1) % 4]}
          </div>
        );
      })}
    </Marquee>
  );
}

export default MarqueeBrands;
