/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      constants: false,
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      path: false,
    };
    config.experiments = { asyncWebAssembly: true };

    return config;
  },
}

module.exports = nextConfig
