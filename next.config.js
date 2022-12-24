/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  reactStrictMode: true,
  webpack: (config, options) => 
  { 
    config.module.rules.push(
    {  test: /\.js$/, parser: { amd: false } });

    // config.module.rules.push(
    // { resolve: {preferRelative: true}})
    
    return config; 
  },

}

// module.exports = nextConfig
