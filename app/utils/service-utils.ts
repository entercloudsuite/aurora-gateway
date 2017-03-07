import { Logger, LoggerFactory, InternalError, Request } from '../common';
import { APP_CONFIG } from '../config';
import http = require('http');


export class ServiceUtils {
  private static LOGGER: Logger = LoggerFactory.getLogger();
  
  /**
   * Creates a new request with the specified parameters, parses and returns the response
   * 
   * @static
   * @param {Request} requestOptions 
   * @param {*} [requestBody] 
   * @returns 
   * 
   * @memberOf ServiceUtils
   */
  static sendRequest(requestOptions: Request, requestBody?: any) {
    if (requestBody) {
      requestBody = JSON.stringify(requestBody);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(requestBody).toString();
    }
    
    ServiceUtils.LOGGER.debug(`Sending new request with ${JSON.stringify(requestOptions)}`);
    return new Promise((resolve, reject) => {
      let responseBody: string = '';
      const newRequest = http.request(requestOptions, res => {
        res.setEncoding('utf8');
        res.on('data', chunk => {
          responseBody += chunk;
        });

        res.on('end', () => {
          ServiceUtils.LOGGER.debug(`Response body - ${responseBody}`);
          res['body'] = responseBody;
          return resolve(res);
        });
      });
      
      newRequest.on('error', requestError => {
        ServiceUtils.LOGGER.error(`Request error - ${JSON.stringify(requestError)}`);
        return reject(new InternalError(requestError));
      });

      if (requestBody) {
        newRequest.write(requestBody);
      }

      newRequest.end();
    });
  }
}
