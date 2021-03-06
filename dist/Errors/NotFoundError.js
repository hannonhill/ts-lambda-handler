"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var HttpError_1 = require("./HttpError");
/**
 * Represents an error raised when the client attempts to access a ressource that doesn't exist.
 */
var NotFoundError = (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError() {
        return _super.call(this, 'NotFoundError', 404, [{
                message: 'NotFoundError',
                type: 'NotFoundError',
                path: ''
            }]) || this;
    }
    return NotFoundError;
}(HttpError_1.HttpError));
exports.NotFoundError = NotFoundError;
