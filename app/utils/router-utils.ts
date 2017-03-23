import { InvalidJsonError, NotAuthenticated, ApiError, Service } from '../common';

export class RouterUtils {
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
}
