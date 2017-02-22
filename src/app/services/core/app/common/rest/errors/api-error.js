"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ApiError = (function (_super) {
    __extends(ApiError, _super);
    function ApiError(message, httpStatusCode, code) {
        _super.call(this, message);
        this.message = message;
        this.httpStatusCode = httpStatusCode;
        this.code = code;
        this.name = 'RestError';
        this.stack = (new Error()).stack;
    }
    ApiError.prototype.toJSON = function () {
        return {
            code: this.httpStatusCode,
            message: this.message,
            title: this.code
        };
    };
    return ApiError;
}(Error));
exports.ApiError = ApiError;
//# sourceMappingURL=api-error.js.map