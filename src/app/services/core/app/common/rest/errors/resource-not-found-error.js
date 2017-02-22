"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var api_error_1 = require('./api-error');
var ResourceNotFoundError = (function (_super) {
    __extends(ResourceNotFoundError, _super);
    function ResourceNotFoundError(message) {
        if (message === void 0) { message = 'The resource could not be found.'; }
        _super.call(this, message, 404, 'RESOURCE_NOT_FOUND');
        this.message = message;
        this.name = 'ResourceNotFoundError';
    }
    return ResourceNotFoundError;
}(api_error_1.ApiError));
exports.ResourceNotFoundError = ResourceNotFoundError;
//# sourceMappingURL=resource-not-found-error.js.map