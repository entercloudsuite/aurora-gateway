import { InvalidJsonError, NotAuthenticated, ApiError } from '../common';

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
}