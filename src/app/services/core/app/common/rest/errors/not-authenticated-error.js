"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var api_error_1 = require('./api-error');
var NotAuthenticated = (function (_super) {
    __extends(NotAuthenticated, _super);
    function NotAuthenticated(message) {
        if (message === void 0) { message = 'Authentication required.'; }
        _super.call(this, message, 403, 'FORBIDDEN');
        this.message = message;
        this.name = 'Forbidden';
    }
    return NotAuthenticated;
}(api_error_1.ApiError));
exports.NotAuthenticated = NotAuthenticated;
//# sourceMappingURL=not-authenticated-error.js.map