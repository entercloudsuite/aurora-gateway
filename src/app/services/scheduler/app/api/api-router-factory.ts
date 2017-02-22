import express = require('express');
import { Router } from 'express';
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';
import { Scheduler } from '../services';
import { SchedulerRouter } from './routes';

export class ApiRouterFactory {

  private static LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const apiRouter: Router = express.Router({ mergeParams: true });

    const scheduler = new Scheduler();

    scheduler.registerMessageHandlers();

    const schedulerRouter: Router = new SchedulerRouter(scheduler).router;

    ApiRouterFactory.LOGGER.info('Mounting routes');
    apiRouter.use('/', schedulerRouter);
    apiRouter.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return apiRouter;
  }
}
