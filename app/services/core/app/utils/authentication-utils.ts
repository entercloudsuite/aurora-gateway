import { InvalidJsonError } from '../common';

export class AuthenticationUtils {
  /**
   * Parse standard authentication body and return an object depending on the Keystone API version
   * 
   * @static
   * @param {{}} credentials 
   * @param {string} apiVersion 
   * @returns {Promise<any>} 
   * 
   * @memberOf AuthenticationUtils
   */
  static parseCredentials(credentials: {}, apiVersion: string): Promise<any> {
    return new Promise((resolve, reject) => {
      switch (apiVersion) {
        case '2.0':
          if (credentials['username'] && credentials['password']) {
            return resolve({
              auth: {
                tenantName: credentials['tenant'] || '',
                passwordCredentials: {
                  username: credentials['username'],
                  password: credentials['password']
                }
              }
            });
            // TODO: Add InvalidCredentialsError
          } else return reject(new InvalidJsonError());
        default:
          // TODO: Handle exceptions
          return resolve(credentials);
      }
    });
  }
}
