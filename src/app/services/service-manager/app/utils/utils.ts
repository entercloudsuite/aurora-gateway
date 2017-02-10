import { InvalidJsonError } from '../common';

export class Utils {
  static getIPAddress(incomingRequest): Promise<any> {
    const ipAddress = incomingRequest.headers['x-forwarded-for'] ||
        incomingRequest.connection.remoteAddress ||
        incomingRequest.socket.remoteAddress ||
        incomingRequest.connection.socket.remoteAddress;
    return Promise.resolve(ipAddress.substring(ipAddress.lastIndexOf(':')+1, ipAddress.length));
  }
}
