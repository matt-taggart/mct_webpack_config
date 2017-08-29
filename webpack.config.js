const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const cssDevMode = [ 'style-loader', 'css-loader', 'sass-loader' ];
const cssProdMode = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: [ 'css-loader', 'sass-loader' ]
});

module.exports = ({ production = false }) => ({
  context: resolve('src'),
  entry: [ './index.js', './style.scss' ],
  output: {
    path: resolve('dist'),
    filename: 'bundle.js',
    pathinfo: !production
  },
  devtool: production ? 'source-map' : 'eval',
  devServer: {
    contentBase: resolve('dist'),
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: [ 'env', 'react' ] },
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: production ? cssProdMode : cssDevMode
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: './style.css',
      allChunks: true,
      disable: !production
    }),
    new HtmlWebpackPlugin({
      title: 'Project',
      minify: {
        collapseWhitespace: production
      },
      hash: true,
      template: './index.ejs'
    }),
    new webpack.optimize.UglifyJsPlugin({
      exclude: /node_modules/,
      compress: {
        warnings: false,
        drop_console: false,
      }
    }),
    new webpack.NamedModulesPlugin()
  ],
  resolve: {
    extensions: [ '.js', '.jsx' ]
  }
});
