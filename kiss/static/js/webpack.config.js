var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname,'src','index.js'),
  output: {
    filename: 'build/browser-bundle.js',
    publicPath: '/static/'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.jsx','.json']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        query: {
          presets: ['es2015', 'react'],
        }
      },
      {
        test:/\.json$/,
        loader: 'json-loader',
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader'
      }
    ]
  }
};
