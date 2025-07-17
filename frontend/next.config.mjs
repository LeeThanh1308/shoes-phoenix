/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverMinification: true,
    scrollRestoration: true,
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8888",
      },
      {
        protocol: "https",
        hostname: "apishoes.phoenix.id.vn",
      },
      {
        protocol: "https",
        hostname: "api.vietqr.io",
      },
    ],
  },
};

export default nextConfig;
