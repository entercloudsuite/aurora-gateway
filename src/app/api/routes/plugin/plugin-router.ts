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
    this.router.get('/', this.wrapRouteFn(this.pluginController, this.pluginController.listRegisteredPlugins));
    this.router.get('/:pluginId', this.wrapRouteFn(this.pluginController, this.pluginController.listRegisteredPlugins));
    this.router.post('/', this.wrapRouteFn(this.pluginController, this.pluginController.addPlugin));
    this.router.put('/:pluginId', this.wrapRouteFn(this.pluginController, this.pluginController.editPlugin));
    this.router.delete('/', this.wrapRouteFn(this.pluginController, this.pluginController.removePlugin));
    this.router.all('/', this.wrapRouteFn(this.pluginController, this.pluginController.throwMethodNotAllowedError));
  }
}
