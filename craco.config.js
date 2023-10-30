const { addBeforeLoader, loaderByName } = require('@craco/craco');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const wasmExtensionRegExp = /\.wasm$/;
      webpackConfig.resolve.extensions.push('.wasm');
      webpackConfig.experiments = {
        asyncWebAssembly: true
      };
      webpackConfig.resolve.fallback = {
        buffer: require.resolve('buffer/'),
        stream: false
      }
      webpackConfig.module.rules.forEach((rule) => {
        (rule.oneOf || []).forEach((oneOf) => {
          if (oneOf.type === "asset/resource") {
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        });
      });
      webpackConfig.plugins.push(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }));
      webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

      return webpackConfig;

      // const wasmExtensionRegExp = /\.wasm$/;
      // webpackConfig.resolve.extensions.push('.wasm');
      // webpackConfig.module.rules.forEach((rule) => {
      //   (rule.oneOf || []).forEach((oneOf) => {
      //     if (oneOf.use && oneOf.use.some(u => u.loader?.indexOf('file-loader') >= 0)) {
      //       oneOf.exclude = oneOf.exclude || [];
      //       oneOf.exclude.push(wasmExtensionRegExp);
      //     }
      //   });
      // });

      // const wasmLoader = {
      //   test: /\.wasm$/,
      //   exclude: /node_modules/,
      //   loader: 'wasm-loader'
      // };
   
      // // Add before another loader because a bug on 'file-loader'
      // // FIX after bug is fixed: 
      // webpackConfig.module.rules[1].oneOf.splice(0, 0, wasmLoader);
      // console.log(JSON.stringify(webpackConfig.module.rules[1].oneOf, null, 2));
      // // addBeforeLoader(webpackConfig, loaderByName('file-loader'), wasmLoader);

      // return webpackConfig;
    },
  },
};