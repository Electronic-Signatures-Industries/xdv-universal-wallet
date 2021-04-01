module.exports = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on server-only modules
    if (!isServer) {
      config.node = {
        child_process: 'empty',
        fs: 'empty'
      }
    }

    return config;
  }
}