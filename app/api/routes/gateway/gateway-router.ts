import { RestRouter } from '../../../common';
import { GatewayController } from './gateway-controller';
import { GatewayService } from '../../../services';
import { Logger, LoggerFactory } from '../../../common';

export class GatewayRouter extends RestRouter {
  gatewayController: GatewayController;

  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor(gatewayService: GatewayService) {
    super();
    this.gatewayController = new GatewayController(gatewayService);
    this.initRoutes(gatewayService.options);
  }

  /**
   * Intializes all the routes on a specific path with a forwarding method.
   * Adds separate method for authentication.
   * 
   * @todo Add method for logout/destroy token
   * @todo Add middleware for paths that require authentication
   * @param {} serviceOptions 
   * 
   * @memberOf GatewayRouter
   */
  initRoutes(serviceOptions: {}) {
    if (serviceOptions.hasOwnProperty('AUTHENTICATION')) {
      GatewayRouter.LOGGER.debug('Authentication route attached');
      this.router.post(serviceOptions['AUTHENTICATION'], this.wrapRouteFn(this.gatewayController, this.gatewayController.authenticate));
    }

    this.router.all('/*', this.wrapRouteFn(this.gatewayController, this.gatewayController.forwardRequest));
  }
}
