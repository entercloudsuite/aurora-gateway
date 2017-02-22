"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var api_error_1 = require('./api-error');
var MethodNotAllowedError = (function (_super) {
    __extends(MethodNotAllowedError, _super);
    function MethodNotAllowedError(message) {
        if (message === void 0) { message = 'The endpoint does not support this HTTP method.'; }
        _super.call(this, message, 405, 'METHOD_NOT_ALLOWED');
        this.message = message;
        this.name = 'MethodNotAllowedError';
    }
    return MethodNotAllowedError;
}(api_error_1.ApiError));
exports.MethodNotAllowedError = MethodNotAllowedError;
//# sourceMappingURL=method-not-allowed-error.js.map