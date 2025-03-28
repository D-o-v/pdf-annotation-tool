// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['uploadthing.com']
  },
  webpack: (config) => {
    // config.resolve.fallback = { 
    //   fs: false,  // PDF manipulation workaround
    //   net: false,
    //   tls: false 
    // }
    config.resolve.alias.canvas = false;
    return config
  },
  experimental: {
    // serverActions: true,
    optimizePackageImports: ['lucide-react', 'react-hot-toast','react-pdf']
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  productionBrowserSourceMaps: false
};

export default nextConfig;