import express = require('express');
import { Router } from 'express';
import { KeystoneRouter } from './routes/keystone/keystone-router'
import { Logger, LoggerFactory, InvalidResourceUrlError } from '../common';

////////////////////

export class ApiRouterFactory {

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(): Router {
    const router: Router = express.Router();

    const keystoneRouter: Router = new KeystoneRouter().router;

    ApiRouterFactory.LOGGER.info('Mounting keystone route');
    router.use('/keystone', keystoneRouter);

    router.get('/', (req, res) => {
      res.json("Aurora API");
    })

    router.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return router;
  }
}
