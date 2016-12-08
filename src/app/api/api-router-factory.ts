import express = require('express');
import { Router } from 'express';
import { KeystoneRouter } from './routes/keystone/keystone-router';
import { Logger, LoggerFactory, InvalidResourceUrlError, RestController } from '../common';
import { OpenstackService } from '../openstack';

export class ApiRouterFactory {

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  private constructor() {}

  static getApiRouter(openstackService: OpenstackService): Router {
    const router: Router = express.Router();
    const restController: RestController = new RestController();
    const keystoneRouter: Router = new KeystoneRouter().router;

    ApiRouterFactory.LOGGER.info('Mounting keystone route');
    router.use('/keystone', keystoneRouter);

    router.get('/', (req, res, next) => {
      OpenstackService.sendRequest({'uri': openstackService.authUrl})
          .then((result) => {
            restController.respond(res, result[1], result[0].statusCode, true);
          })
          .catch((error) => { next(error); });
    });

    router.all('*', (req, res, next) => {
      next(new InvalidResourceUrlError());
    });

    return router;
  }
}
