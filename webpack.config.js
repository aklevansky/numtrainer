'use strict';
const path = require('path');
const webpack = require('webpack');

const config = {
  entry: "./js/app.js",
  output: {
    path: path.join(__dirname, 'public'),
    filename: "script.js"
  },

  module: {
    rules: [{
      test: /\.js?$/,
      include: path.resolve(__dirname, 'js' ),
      exclude: /(node_modules)/,

      loader: 'babel-loader',
      options: {
        presets: ['env'],
        plugins: ['transform-runtime']
      }
    }, {
      test: /\.html$/,
      include: path.resolve(__dirname, 'resources'),
      exclude: /(node_modules)/,

      loader: 'html-loader'
    }, {
      test: /\.css$/,
      include: path.resolve(__dirname, 'resources'),
      exclude: /(node_modules)/,

      loader: 'style-loader!css-loader'
    }]
  }
};



const devConfig = () => {

  const dev = {
    devServer: { // used to edit html and css, 'npm run html'
      contentBase: './public',
      historyApiFallback: true,
      // stats: 'errors-only',
      host: process.env.HOST, // Defaults to `localhost`
      port: process.env.PORT, // Defaults to 8080
    },
    watch: true,
    watchOptions: {
      aggregateTimeout: 100
    },
    devtool: "cheap-inline-module-source-map"

  };

  return Object.assign({}, config, dev)
}

const productionConfig = () => {

  const prod = {
    plugins: [
      new webpack.optimize.UglifyJsPlugin()
    ]
  }

  return Object.assign({}, config, prod);
}

module.exports = (env) => {
  return env === 'development' ? devConfig() : productionConfig()
}