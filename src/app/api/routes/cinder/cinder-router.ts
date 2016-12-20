import { RestRouter } from '../../../common';
import { CinderController } from './cinder-controller';
import { OpenstackService } from '../../../openstack';

export class CinderRouter extends RestRouter {
  cinderController: CinderController;

  constructor(openstackService: OpenstackService) {
    super();
    this.cinderController = new CinderController(openstackService);
    this.initRoutes();
  }

  initRoutes() {
    this.router.all('/*', this.wrapRouteFn(this.cinderController, this.cinderController.proxyRequest));
  }
}
