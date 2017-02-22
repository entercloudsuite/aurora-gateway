"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var api_error_1 = require('./api-error');
var InvalidResourceUrlError = (function (_super) {
    __extends(InvalidResourceUrlError, _super);
    function InvalidResourceUrlError(message) {
        if (message === void 0) { message = 'Not a valid resource url.'; }
        _super.call(this, message, 404, 'INVALID_RESOURCE_URL');
        this.message = message;
        this.name = 'InvalidResourceUrlError';
    }
    return InvalidResourceUrlError;
}(api_error_1.ApiError));
exports.InvalidResourceUrlError = InvalidResourceUrlError;
//# sourceMappingURL=invalid-resource-url-error.js.map