const http = require('http');
const debug = require('debug')('node-angular');
const app = require('../../backend/app'); // Path to your backend app.js

// Normalize port function
const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val; // named pipex`
  if (port >= 0) return port;  // port number
  return false;
};

// Error handler function
const onError = error => {
  if (error.syscall !== 'listen') throw error;

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Listening handler
const onListening = () => {
  const addr = server.address();
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;
  debug('Listening on ' + bind);
  console.log('Server is listening on', bind);
};

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);
server.listen(port);
