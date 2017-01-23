import { Express, Router, RequestHandler, ErrorRequestHandler } from 'express';
import express = require('express');
import bodyParser = require('body-parser');
import morgan = require('morgan');
import { Logger, LoggerFactory, RedisClient } from './common';
import expressSession = require('express-session');
import cors = require('cors');
import connectRedis = require('connect-redis');

export class ExpressAppFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getExpressApp(
    apiRouter: Router,
    preApiRouterMiddlewareFns: Array<RequestHandler | ErrorRequestHandler>,
    postApiRouterMiddlewareFns: Array<RequestHandler | ErrorRequestHandler>): Express {

    const app: Express = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    let redisStore = connectRedis(expressSession);
    let sessionOptions = {
      secret: process.env.SESSION_SECRET,
      saveUninitialized: true,
      resave: true,
      cookie: {
        maxAge: 3600000,
        httpOnly: false
      }
    };
    
    if (process.env.ENV !== 'dev') {
      sessionOptions['store'] = new redisStore({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        client: RedisClient,
        ttl: 3600000
      });
    }
    app.use(expressSession(sessionOptions));

    app.use(cors({
      origin: true,
      credentials: true
    }));
    
    if (process.env.SERVE_STATIC === 'true') {
      ExpressAppFactory.LOGGER.info(`Serving static files from public`);
      app.use(express.static('public'));
    }

    if (process.env.ENABLE_HTTP_REQUEST_LOGGING === 'true') {
      ExpressAppFactory.LOGGER.info(`Request logging is enabled`);
      app.use(
        morgan(
          ':remote-addr :user-agent :method :url :status :response-time ms - :res[content-length]',
          {'stream': ExpressAppFactory.LOGGER.stream}
        ));
    }

    if (preApiRouterMiddlewareFns != null) {
      postApiRouterMiddlewareFns.forEach((middlewareFn) => app.use(middlewareFn));
    }

    app.use('/api', apiRouter);

    if (postApiRouterMiddlewareFns != null) {
      postApiRouterMiddlewareFns.forEach((middlewareFn) => app.use(middlewareFn));
    }

    return app;
  }

}
