import { RestRouter } from '../../../common';
import { NeutronController } from './neutron-controller';
import { OpenstackService } from '../../../openstack';

export class NeutronRouter extends RestRouter {
  novaController: NeutronController;

  constructor(openstackService: OpenstackService) {
    super();
    this.novaController = new NeutronController(openstackService);
    this.initRoutes();
  }

  initRoutes() {
    this.router.all('/*', this.wrapRouteFn(this.novaController, this.novaController.proxyRequest));
  }
}
