const path = require('path');
const { createConfig } = require('@openedx/frontend-build');
const { applySignozWebpackConfig } = require('./webpack.otel');

const config = createConfig('webpack-dev', {
  resolve: {
    alias: {
      // Plugins can use 'CourseAuthoring' as an import alias for this app:
      CourseAuthoring: path.resolve(__dirname, 'src/'),
      // Explicit alias so @src/* resolves even if TsconfigPathsPlugin misses baseUrl
      '@src': path.resolve(__dirname, 'src'),
    },
    fallback: {
      fs: false,
      constants: false,
    },
  },
});

module.exports = applySignozWebpackConfig(config, { withDevProxy: true });
