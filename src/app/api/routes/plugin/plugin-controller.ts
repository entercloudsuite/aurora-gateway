import { RestController, Logger, LoggerFactory } from '../../../common';
import { PluginManager } from '../../../services';

export class PluginController extends RestController {
  constructor(private pluginManager: PluginManager) {
    super();
  }

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  registerPlugin(req, res, next): Promise<any> {
    return this.pluginManager.registerPlugin(req.body)
      .then((result) => {
        return this.respond(res, result);
    });
  }
}