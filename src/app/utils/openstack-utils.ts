import { InvalidJsonError, ApiError } from '../common';

export class OpenstackUtils {
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

  static parseApiResponse(APIResponse): Promise<any> {
    return new Promise((resolve, reject) => {
      if (APIResponse.statusCode < 200 || APIResponse.statusCode > 299) {
        // In some cases OpenStack APIs return an html in case of error
        let OSApiError = {};
        try {
          OSApiError = JSON.parse(APIResponse.body);
        } catch (e) {
          OSApiError = {
            'error': {
              'message': APIResponse.body,
              'code': APIResponse.statusCode,
              'title': 'Unknown OpenStack API error'
            }
          };
        }
        return reject(new ApiError(OSApiError.error.message, OSApiError.error.code, OSApiError.error.title));
      } else if (parseInt(APIResponse.headers['content-length']) === 0) {
        // In some cases OS API returns an empty body (eg - on nova server actions)
        APIResponse.body = {'info': 'Successful API call'};
        return resolve(APIResponse);
      } else {
        APIResponse.body = JSON.parse(APIResponse.body);
        return resolve(APIResponse);
      }
    });
  }
}