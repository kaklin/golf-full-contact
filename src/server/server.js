const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../../webpack.dev.js');

const socketio = require('socket.io');

// Setup an Express server
const app = express();

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}


// Listen on port
const port = process.env.PORT || 5000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

io.on('connection', socket => {
	console.log('New connection', socket.id)

	socket.on('disconnect', () => {
		console.log(socket.id, ' disconnected')

	})
})