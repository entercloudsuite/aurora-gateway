import { RestRouter } from '../../../common';
import { GatewayController } from './gateway-controller';
import { GatewayService } from '../../../services';

export class GatewayRouter extends RestRouter {
  gatewayController: GatewayController;

  constructor(gatewayService: GatewayService) {
    super();
    this.gatewayController = new GatewayController(gatewayService);
    this.initRoutes(gatewayService.name);
  }

  initRoutes(serviceName) {
    if (serviceName === 'OS-IDENTITY') {
      this.router.post('/tokens', this.wrapRouteFn(this.gatewayController, this.gatewayController.authenticate));
    }
    this.router.all('/*', this.wrapRouteFn(this.gatewayController, this.gatewayController.forwardRequest));
  }
}
