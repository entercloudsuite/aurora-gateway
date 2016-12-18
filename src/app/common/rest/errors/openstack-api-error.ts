import { ApiError } from './api-error';

export class OpenstackAPIError extends ApiError {
    constructor(
        public message: string = '',
        public statusCode: number,
        public title: string
    ) {
        super(message, statusCode, title);
        
    }
}