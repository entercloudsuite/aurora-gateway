import { InvalidJsonError, ApiError } from '../common';

export class RouterUtils {
  static checkCredentials(req, res, next): any {
    if (req.body.password && req.body.username) {
      next();
    } else {
      res.statusCode = 400;
      res.json(new InvalidJsonError().toJSON());
    }
  }
  
  static checkTenantID(req, res, next): any {
    if (req.headers['tenant-id']) {
      next();
    } else {
      res.statusCode = 400;
      res.json(new ApiError('Missing Tenant-ID header', 400, 'BAD_REQUEST'));
    }
  }

  static checkEndpointID(req, res, next): any {
    if (req.headers['endpoint-id']) {
      next();
    } else {
      res.statusCode = 400;
      res.json(new ApiError('Missing Endpoint-ID header', 400, 'BAD_REQUEST'));
    }
  }
}