/*
 * @Description:
 * @Autor: shen
 * @Date: 2020-08-17 22:12:18
 * @LastEditTime: 2020-08-18 10:17:13
 */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'
module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'), //必须是绝对路径
    filename: 'bundle.[hash:6].js',
    publicPath: './', //通常是CDN地址
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/, //排除 node_modules 目录
      },
    ],
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      minify: {
        removeAttributeQuotes: false, //是否删除属性的双引号
        collapseWhitespace: false, //是否折叠空白
      },
    }),
    // '**/*':表示要删除全部；'!test'不删除啥
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!test', '!test/*'],
    }), //删除dist文件内容
  ],
}
