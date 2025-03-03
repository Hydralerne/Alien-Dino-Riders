import { NextConfig } from 'next';

const config: NextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'bufferutil', 'utf-8-validate'];
    return config;
  },
};

export default config;