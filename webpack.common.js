const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		game: './src/client/index.js'
	},
	output: {
	  filename: '[name].[contenthash].js',
	  path: path.resolve(__dirname, 'dist'),
	},
	module: {
	  rules: [
	    {
	      test: /\.js$/,
	      exclude: /node_modules/,
	      use: {
	        loader: "babel-loader",
	        options: {
	          presets: ['@babel/preset-env'],
	        },
	      },
	    },
	    {
	      test: /\.html$/,
	      use: [
	        'html-loader'
	      ],
	    },
	    // {
	    //   test: /\.svg$/i,
	    //   use: [
	    //     {
	    //       loader: 'file-loader',
	    //       options: 
	    //       {
	    //         outputPath: 'images'
	    //       }
	    //     },
	    //   ],
	    // },
	  ],
	},
	plugins: [
	  new HtmlWebpackPlugin({
	    filename: 'index.html',
	    template: 'src/client/html/index.html',
	  }),
	],
}