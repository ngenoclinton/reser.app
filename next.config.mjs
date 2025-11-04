/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
    ],
    domains: [
      'cloud.appwrite.io',       // ✅ Allow Appwrite-hosted files
      'images.unsplash.com',     // ✅ If you also use Unsplash images
    ],
  },
 experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // or higher if needed
    },
  },
};

export default nextConfig;
