/**
 * 
 * 
 * @export
 * @interface Request
 */
export interface Request {
    protocol: string;
    host: string;
    port: number;
    path: string;
    method: string;
    headers: {};
    body?: {};
}

/**
 * 
 */
export interface Service {
    name: string;
    routingPath: string;
    options: {};
}