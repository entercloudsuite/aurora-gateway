import { RestRouter } from '../../../common';
import { KeystoneController } from './keystone-controller';

export class KeystoneRouter extends RestRouter {
  keystoneCtrl: KeystoneController;

  constructor() {
    super();
    this.keystoneCtrl = new KeystoneController();
    this.initRoutes();
  }

  initRoutes() {

  }
}
