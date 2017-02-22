"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var api_error_1 = require('./api-error');
var NotImplementedError = (function (_super) {
    __extends(NotImplementedError, _super);
    function NotImplementedError(message) {
        if (message === void 0) { message = 'Feature not implemented'; }
        _super.call(this, message, 501, 'NOT_IMPLEMENTED');
        this.message = message;
        this.name = 'NotImplemented';
    }
    return NotImplementedError;
}(api_error_1.ApiError));
exports.NotImplementedError = NotImplementedError;
//# sourceMappingURL=not-implemented-error.js.map