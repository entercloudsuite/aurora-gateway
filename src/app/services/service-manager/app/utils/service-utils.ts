import { Logger, LoggerFactory, InternalError  } from '../common';
import http = require('http');


export class ServiceUtils {
  private static LOGGER: Logger = LoggerFactory.getLogger();

  static getIPAddress(incomingRequest): Promise<any> {
    const ipAddress = incomingRequest.headers['x-forwarded-for'] ||
      incomingRequest.connection.remoteAddress ||
      incomingRequest.socket.remoteAddress ||
      incomingRequest.connection.socket.remoteAddress;
    return Promise.resolve(ipAddress.substring(ipAddress.lastIndexOf(':')+1, ipAddress.length));
  }
  
  static sendRequest(requestOptions: {}, requestBody?: any) {
    if (requestBody) {
      requestBody = JSON.stringify(requestBody);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(requestBody);
    }
    
    return new Promise((resolve, reject) => {
      let responseBody: string = '';
      const newRequest = http.request(requestOptions, res => {
        res.setEncoding('utf8');
        res.on('data', chunk => {
          responseBody += chunk;
        });

        res.on('end', () => {
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
