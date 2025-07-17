"use client";

import { memo, useState } from "react";

import Image from "next/image";

const FallbackImage = ({
  src,
  alt = "image",
  fallback = "/images/avatar.png",
  ...props
}) => {
  const [error, setError] = useState(false);
  return (
    <Image
      src={error ? fallback : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default memo(FallbackImage);
