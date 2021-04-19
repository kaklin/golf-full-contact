const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
	module: {
	    rules: [
	      {
	        test: /\.css$/,
	        use: [
	          'style-loader',
	          'css-loader'
	        ],
	      },
	    ],
	  },
	mode: 'development',
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		port: 5000,
	},
});
