/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config, { dev }) => {
    if (dev) config.cache = false; // desativa o cache do webpack em dev
    return config;
  },
};