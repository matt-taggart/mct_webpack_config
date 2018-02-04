const webpack = require('webpack');
const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const merge = require('webpack-merge');

const parts = require('./webpack.parts');

const commonConfig = merge([
  {
    entry: {
      src: ['babel-polyfill', join(__dirname, 'src', 'index.jsx')],
    },
    output: {
      path: join(__dirname, 'dist'),
      filename: '[name].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Project',
        minify: {
          collapseWhitespace: true,
        },
        hash: true,
        template: join(__dirname, 'src', './index.ejs'),
      }),
      new webpack.NamedModulesPlugin(),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
    resolve: {
      extensions: ['.js', '.jsx'],
    },
  },
  parts.loadFonts({
    options: {
      name: '[name].[hash].[ext]',
    },
  }),
  parts.loadJavascript({
    include: join(__dirname, 'src'),
    exclude: /node_modules/,
  }),
]);

const productionConfig = merge([
  {
    output: {
      chunkFilename: '[name].[chunkhash].js',
      filename: '[name].[chunkhash].js',
    },
    plugins: [
      new BundleAnalyzerPlugin(),
      new CleanWebpackPlugin('dist'),
    ],
  },
  parts.extractBundles([
    {
      name: 'vendor',
      minChunks: ({ resource }) => /node_modules/.test(resource),
    },
    {
      name: 'manifest',
      minChunks: Infinity,
    },
  ]),
  parts.extractCSS({
    use: [
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          plugins: () => [require('autoprefixer')],
        },
      },
      'sass-loader',
    ],
  }),
  parts.purifyCSS({
    paths: glob.sync(`${join(__dirname, 'src')}/**/*.js`, { nodir: true }),
  }),
  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[hash].[ext]',
    },
  }),
  parts.generateSourceMaps({ type: 'source-map' }),
  parts.minifyJavascript(),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      safe: true,
    },
  }),
  parts.setVariable('process.env.NODE_ENV', 'production'),
]);

const developmentConfig = merge([
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages(),
  parts.generateSourceMaps({
    type: 'cheap-module-eval-source-map',
  }),
  {
    output: {
      publicPath: '/',
      devtoolModuleFilenameTemplate:
        'webpack:///[absolute-resource-path]',
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ],
  },
]);

module.exports = env => {
  if (env === 'production') {
    return merge(commonConfig, productionConfig);
  }
  return merge(commonConfig, developmentConfig);
};

// TODO: Add webpack dashboard plugin
// TODO: Add SourceMapDevToolPlugin
