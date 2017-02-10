import { InvalidJsonError } from '../common';

export class RouterUtils {
  static checkCredentials(req, res, next): any {
    if (req.body.password && req.body.username) {
      next();
    } else {
      res.statusCode = 400;
      res.json(new InvalidJsonError().toJSON());
    }
  }
}