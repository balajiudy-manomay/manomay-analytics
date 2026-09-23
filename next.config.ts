import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    sharepointWorkbook: {
      stale: 60,
      revalidate: 300,
      expire: 1800,
    },
  },
};

export default nextConfig;
