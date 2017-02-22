"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var api_error_1 = require('./api-error');
var InvalidJsonError = (function (_super) {
    __extends(InvalidJsonError, _super);
    function InvalidJsonError(message) {
        if (message === void 0) { message = 'Request does not contain valid JSON data.'; }
        _super.call(this, message, 400, 'INVALID_JSON_ERROR');
        this.message = message;
        this.name = 'InvalidJsonError';
    }
    return InvalidJsonError;
}(api_error_1.ApiError));
exports.InvalidJsonError = InvalidJsonError;
//# sourceMappingURL=invalid-json-error.js.map