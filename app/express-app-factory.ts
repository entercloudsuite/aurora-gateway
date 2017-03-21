import { Express, Router, RequestHandler, ErrorRequestHandler } from 'express';
import express = require('express');
import bodyParser = require('body-parser');
import morgan = require('morgan');
import { Options, StreamOptions } from 'morgan';
import { Logger, LoggerFactory, RedisClient } from './common';
import { APP_CONFIG } from './config';
import expressSession = require('express-session');
import cors = require('cors');
import connectRedis = require('connect-redis');
import { RabbitClient } from './common';
import { ApiRouterFactory } from './api';

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
      secret: APP_CONFIG.sessionSecret,
      saveUninitialized: true,
      resave: true,
      cookie: {
        maxAge: 3600000,
        httpOnly: false
      }
    };

    app.use(expressSession(sessionOptions));

    app.use(cors({
      origin: true,
      credentials: true
    }));
    
    if (APP_CONFIG.serveStatic) {
      ExpressAppFactory.LOGGER.info(`Serving static files from public`);
      app.use(express.static('public'));
    }

    if (APP_CONFIG.enableHttpRequestLogging) {
      ExpressAppFactory.LOGGER.info(`Request logging is enabled`);
      app.use(
        morgan(
          ':remote-addr :user-agent :method :url :status :response-time ms - :res[content-length]',
          {'stream': LoggerFactory.stream }
        ));
    }

    if (preApiRouterMiddlewareFns != null) {
      postApiRouterMiddlewareFns.forEach((middlewareFn) => app.use(middlewareFn));
    }

    app.use('/api', apiRouter);

    /**
     * Logic used to register and dynamically add a new route for a service
     */
    app.post('/register', (req, res, next) => {
      ExpressAppFactory.LOGGER.debug(`Mounting new route - ${JSON.stringify(req.body)}`);
      const newRouter = ApiRouterFactory.registerNewAPI(req.body);
      app.use(req.body.routingPath, newRouter);
    
      res.json({'info': 'successfully registered new route'});
    });
    
    if (postApiRouterMiddlewareFns != null) {
      postApiRouterMiddlewareFns.forEach((middlewareFn) => app.use(middlewareFn));
    }

    return app;
  }

}
