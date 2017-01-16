import { RestRouter } from '../../../common';
import { NovaController } from './nova-controller';
import { OpenstackService } from '../../../services';

export class NovaRouter extends RestRouter {
  novaController: NovaController;

  constructor(openstackService: OpenstackService) {
    super();
    this.novaController = new NovaController(openstackService);
    this.initRoutes();
  }

  initRoutes() {
    this.router.all('/*', this.wrapRouteFn(this.novaController, this.novaController.proxyRequest));
  }
}
