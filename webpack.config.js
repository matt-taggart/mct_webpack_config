const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const cssDevMode = ['style-loader', 'css-loader', 'sass-loader'];
const cssProdMode = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: ['css-loader', 'sass-loader'],
});

module.exports = ({ production = false }) => ({
  context: resolve('src'),
  entry: ['./index.jsx', './style.scss'],
  output: {
    path: resolve('dist'),
    filename: 'bundle.js',
    pathinfo: !production,
    publicPath: '/',
  },
  devtool: production ? 'source-map' : 'eval',
  devServer: {
    contentBase: resolve('dist'),
    compress: true,
    historyApiFallback: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', {
                targets: {
                  node: 'current',
                },
              }],
              'react',
              'stage-2',
            ],
          },
        },
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: production ? cssProdMode : cssDevMode,
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: './style.css',
      allChunks: true,
      disable: !production,
    }),
    new HtmlWebpackPlugin({
      title: 'Project',
      minify: {
        collapseWhitespace: production,
      },
      hash: true,
      template: './index.ejs',
    }),
    new webpack.optimize.UglifyJsPlugin({
      exclude: /node_modules/,
      compress: {
        warnings: false,
        drop_console: false,
      },
      sourceMap: true,
    }),
    new webpack.NamedModulesPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
});
