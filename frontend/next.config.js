/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://fittrack-prod6-env.eba-2dfmaze5.us-east-1.elasticbeanstalk.com/:path*",
      },
    ];
  },
};

module.exports = nextConfig;