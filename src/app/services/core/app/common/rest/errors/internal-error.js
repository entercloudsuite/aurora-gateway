"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var api_error_1 = require('./api-error');
var InternalError = (function (_super) {
    __extends(InternalError, _super);
    function InternalError(originalError, message) {
        if (message === void 0) { message = 'An unexpected error has occurred.'; }
        _super.call(this, message, 500, 'INTERNAL_ERROR');
        this.originalError = originalError;
        this.message = message;
        this.name = 'InternalError';
    }
    return InternalError;
}(api_error_1.ApiError));
exports.InternalError = InternalError;
//# sourceMappingURL=internal-error.js.map