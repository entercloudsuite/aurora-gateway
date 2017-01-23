import { RestController, Logger, LoggerFactory, Publisher } from '../../../common';
import { PluginManager } from '../../../services';

export class PluginController extends RestController {
  constructor(private pluginManager: PluginManager) {
    super();
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  addPlugin(req, res): Promise<any> {
    return this.pluginManager.registerPlugin(Publisher.messageTypes.ADD, req.body)
      .then((result) => {
        return this.respond(res, result);
    });
  }
  
  editPlugin(req, res): Promise<any> {
    return this.pluginManager.registerPlugin(Publisher.messageTypes.UPDATE, req.body)
      .then((result) => {
        return this.respond(res, result);
      });
  }

  removePlugin(req, res): Promise<any> {
    return this.pluginManager.registerPlugin(Publisher.messageTypes.DELETE, req.body)
      .then((result) => {
        return this.respond(res, result);
      });
  }

  listRegisteredPlugins(req, res): Promise<any> {
    return this.pluginManager.listPlugins()
      .then((result) => {
        this.respond(res, result);
      });
  }
}