/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/erp/:path*',
        destination: 'https://erp.betopiagroup.com/:path*',
      },
    ];
  },
  // Allow local network IP to access dev server HMR
  allowedDevOrigins: ['10.10.30.84', 'localhost'],
};

export default nextConfig;
