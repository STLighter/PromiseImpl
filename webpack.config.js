var webpack = require('webpack');
const path = require('path');

const webConfig = {
  mode: "production",
  entry: './src/promise.js',
  output: {
    filename: 'promise.js',
    path: path.resolve(__dirname, 'dist'),
    library: "Promise",
    libraryTarget: "umd"
  },
  node: false,
  target: 'web',
  plugins: [
    new webpack.DefinePlugin({ TARGET: JSON.stringify('web')})
  ]
}

const nodeConfig = {
  mode: "production",
  entry: './src/promise.js',
  output: {
    filename: 'promise.node.js',
    path: path.resolve(__dirname, 'dist'),
    library: "Promise",
    libraryTarget: "commonjs2"
  },
  node: false,
  target: 'node',
  plugins: [
    new webpack.DefinePlugin({ TARGET: JSON.stringify('node')})
  ]
}

module.exports = [webConfig, nodeConfig];