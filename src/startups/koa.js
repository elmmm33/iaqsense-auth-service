/******************************************************
 *  EVQSense
 *  Boilerplate for Koa Web Server
 *  Last Update 2020-03-12
 ***************************************************** */
const http = require('http');
const Koa = require('koa');
const responseTime = require('koa-response-time');
const helmet = require('koa-helmet');
const koaLogger = require('koa-logger');
const cors = require('kcors');
const bodyParser = require('koa-bodyparser');

const errorMiddleware = require('../middlewares/error-middleware');
const routes = require('../routes');
const logger = require('../lib/logger');

module.exports = ({ port, useLogger }) => {
  const app = new Koa();
  app.proxy = true;
  app.use(responseTime());
  app.use(helmet());
  if (useLogger) {
    app.use(koaLogger());
  }
  app.use(errorMiddleware);
  app.use(
    cors({
      origin: '*',
      exposeHeaders: ['Authorization'],
      credentials: true,
      allowMethods: ['GET', 'PUT', 'POST', 'DELETE'],
      allowHeaders: ['Authorization', 'Content-Type'],
      keepHeadersOnError: true
    })
  );
  app.use(bodyParser());
  app.use(routes.routes());
  app.use(routes.allowedMethods());

  app.shutDown = () => {
    logger.info('Shutdown');
    if (this.server.listening) {
      this.server.shutdown(error => {
        if (error) {
          logger.error(error);
          process.exit(1);
        } else {
          process.exit(0);
        }
      });
    }
  };

  app.server = require('http-shutdown')(http.createServer(app.callback()));

  app.server.on('error', error => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
      case 'EACCES':
        logger.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        logger.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  app.server.on('listening', () => {
    const addr = app.server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    logger.info('Listening on ' + bind);
  });

  app.server.listen(port);

  return app;
};
