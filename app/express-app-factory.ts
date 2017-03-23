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
import { RouterUtils } from './utils';
import fs = require('fs');

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

    if (APP_CONFIG.getEnvironment() !== 'dev') {
      sessionOptions['store'] = new redisStore({
        host: APP_CONFIG.redisHost,
        port: APP_CONFIG.redisPort,
        client: RedisClient,
        ttl: 3600000
      });
    }

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

    if (fs.existsSync('./routes.yml')) {
      RouterUtils.parseRouteConfigFile()
        .then(routingList => routingList.map(route => {
          ExpressAppFactory.LOGGER.debug(JSON.stringify(route));
          app.use(route.routingPath, ApiRouterFactory.registerNewAPI(route));
        }))
        .catch(error => {
          ExpressAppFactory.LOGGER.warn(error);
        });
    } else {
      ExpressAppFactory.LOGGER.debug('Creating empty routes file')
      fs.closeSync(fs.openSync('./routes.yml', 'w'));
    }


    if (postApiRouterMiddlewareFns != null) {
      postApiRouterMiddlewareFns.forEach((middlewareFn) => app.use(middlewareFn));
    }

    return app;
  }

}
