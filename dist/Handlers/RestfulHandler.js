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
var AbstractHandler_1 = require("./AbstractHandler");
var Errors_1 = require("../Errors");
var Types_1 = require("../Types");
/**
 * An Handler to implement a REST endpoint.
 */
var RestfulHandler = (function (_super) {
    __extends(RestfulHandler, _super);
    function RestfulHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RestfulHandler.prototype.process = function (request, response) {
        var p;
        var isSingle = this.isSingleRequest();
        // Dispatch the request to the appropriate function based on HTTP verb used.
        switch (request.getMethod()) {
            case Types_1.HttpVerbs.GET:
                if (isSingle) {
                    // Getting a specific record
                    p = this.retrieveSingle();
                }
                else {
                    // Searching a list of records
                    p = this.search();
                }
                break;
            case Types_1.HttpVerbs.POST:
                if (!isSingle) {
                    // creating a new record
                    p = this.create();
                }
                break;
            case Types_1.HttpVerbs.PUT:
                if (isSingle) {
                    // Updating an existing record
                    p = this.update();
                }
                break;
            case Types_1.HttpVerbs.DELETE:
                if (isSingle) {
                    // Deleting a specific record.
                    p = this.delete();
                }
                break;
            case Types_1.HttpVerbs.OPTIONS:
                p = this.preflight();
                break;
        }
        if (p == undefined) {
            p = Promise.reject(new Errors_1.MethodNotAllowedError);
        }
        return p;
    };
    /**
     * Respond to a preflight (OPTIONS) request. Used to return CORS headers.
     */
    RestfulHandler.prototype.preflight = function () {
        this.response.send();
        return Promise.resolve();
    };
    return RestfulHandler;
}(AbstractHandler_1.AbstractHandler));
exports.RestfulHandler = RestfulHandler;
