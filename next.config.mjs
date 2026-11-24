/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow local network IP to access dev server HMR
  allowedDevOrigins: ['10.10.30.84', 'localhost'],
};

export default nextConfig;
