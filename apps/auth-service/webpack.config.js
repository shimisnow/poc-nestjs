const { composePlugins, withNx } = require('@nx/webpack');
const TerserPlugin = require('terser-webpack-plugin');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  const isProduction = process.env['NODE_ENV'] === 'production';

  config.optimization = {
    minimize: isProduction,
    minimizer: isProduction
      ? [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // Optional: remove console.log statements in production
              },
              output: {
                comments: false, // Optional: remove comments from the production build
              },
            },
          }),
        ]
      : [],
  };

  return config;
});
