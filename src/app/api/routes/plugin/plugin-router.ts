import { RestRouter } from '../../../common';
import { PluginController } from './plugin-controller';
import { PluginManager } from '../../../services';

export class PluginRouter extends RestRouter {
  pluginController: PluginController;

  constructor(pluginManager: PluginManager) {
    super();
    this.pluginController = new PluginController(pluginManager);
    this.initRoutes();
  }

  initRoutes() {
   // this.router.get('/', this.wrapRouteFn(this.pluginController, this.pluginController.listRegisteredPlugins));
    this.router.post('/', this.wrapRouteFn(this.pluginController, this.pluginController.registerPlugin));
   // this.router.get('/extensions', this.wrapRouteFn(this.pluginController, this.pluginController.removePlugin));
  //  this.router.get('/tenants', this.wrapRouteFn(this.pluginController, this.pluginController.getPluginStatus));
    this.router.all('/', this.wrapRouteFn(this.pluginController, this.pluginController.throwMethodNotAllowedError));
  }
}
