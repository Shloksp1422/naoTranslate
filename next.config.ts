/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY, // Reads from .env.local
  },
  
    reactStrictMode: false, // Disables strict mode checks in development
  
};

module.exports = nextConfig;
