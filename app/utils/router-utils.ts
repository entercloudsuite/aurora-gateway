import { Logger, LoggerFactory, InvalidJsonError, NotAuthenticated, ApiError, Service } from '../common';
import yaml = require('js-yaml');
import fs = require('fs');

export class RouterUtils {
  private static LOGGER: Logger = LoggerFactory.getLogger();
  /**
   * Middleware to check for a token in the session object
   *
   * @static
   * @param {any} req
   * @param {any} res
   * @param {any} next
   * @returns {*}
   *
   * @memberOf RouterUtils
   */
  static isAuthenticated(req, res, next): any {
    if (req.session.token) {
      next();
    } else {
      res.statusCode = 403;
      res.json(new NotAuthenticated().toJSON());
    }
  }

  static evaluateNewServiceMessage(messageBody: Service, routes: [string]): Promise<any> {
    // TODO: Add method to check if a route is already being used
    if (!messageBody.name || !messageBody.routingPath) {
      return Promise.reject(`Invalid message body ${JSON.stringify(messageBody)}`)
  }// else if (routes.indexOf(messageBody.routingPath ) !== -1) {
  //    return Promise.reject(`An existing service type has already been mounted for ${messageBody.routingPath}`);}
   else {
      return Promise.resolve(messageBody);
    }
  }

  static readYMLFile(filePath: string): Promise<any> {
    try {
      return Promise.resolve(yaml.safeLoad(fs.readFileSync(filePath, 'utf8')));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static writeYMLFile(jsObject: {}, filePath: string): Promise<any> {
    try {
      fs.writeFile(filePath, yaml.safeDump(jsObject), err => {
        if (err) {
          return Promise.reject(err);
        }

        return Promise.resolve('Successfully updated YAML file');
      })
    } catch(error) {
      return Promise.reject(error);
    }
  }

  static updateRoutesFile(newService: Service) {
    RouterUtils.readYMLFile('./routes.yml')
      .then(result => {
        if (result === undefined) {
          result = {}
        }
        result[newService.name] = {
          path: newService.routingPath,
          options: newService.options || ''
        };
        return RouterUtils.writeYMLFile(result, './routes.yml');
      })
      .then(result => {
        RouterUtils.LOGGER.debug(result);
      })
      .catch(error => {
        RouterUtils.LOGGER.error(`Error while updating routes file ${JSON.stringify(error)}`);
      });
    }

    static parseRouteConfigFile(): Promise<any> {
      return RouterUtils.readYMLFile('./routes.yml')
        .then(yamlObject => {
          if (yamlObject === undefined) {
            return Promise.reject('Encountered empty routes file');
          }
          return Promise.resolve(Object.keys(yamlObject).map(key => {
            RouterUtils.LOGGER.debug(`Adding ${key}, with ${JSON.stringify(yamlObject[key])} to routes list.`)
            return {
              name: key,
              routingPath: yamlObject[key].path,
              options: yamlObject[key].options
            };
          }));
        })
    }
  }
