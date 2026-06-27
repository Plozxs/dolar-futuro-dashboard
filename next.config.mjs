/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El backend PyRofex (Python) vive en /backend y no debe ser procesado por Next.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
