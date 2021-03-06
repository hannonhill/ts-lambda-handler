"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("./Errors");
var Url = require("url");
var JOI = require("joi");
var Cookie = require("cookie");
/**
 * Abstract an AWS APIGatewayEvent object. `Request` provides various utility methods to
 * * read query string parameters or header values in a case insensitive way ;
 * * validate query string parameters ;
 * * Read common request data like the origin domain, content-type header ;
 * * Parse request body to sensible object.
 */
var Request = (function () {
    /**
     * Initialize the request from a APIGatewayEvent.
     * @param  {APIGatewayEvent} event APIGatewayEvent received from AWS Lambda
     */
    function Request(event) {
        this.event = event;
        this.originalEvent = JSON.parse(JSON.stringify(event));
        if (this.event) {
            // Make sure our Parameter arrays always resolve to objects
            if (this.event.queryStringParameters == null) {
                this.event.queryStringParameters = {};
            }
            if (this.event.pathParameters == null) {
                this.event.pathParameters = {};
            }
            // Normalize the keys for objects that should have case insensitive keys.
            this.normalizeKeys(this.event.headers);
            this.normalizeKeys(this.event.queryStringParameters);
            this.normalizeKeys(this.event.pathParameters);
        }
    }
    Object.defineProperty(Request.prototype, "data", {
        /**
         * Event data received from AWS Lambda. The keys of some parameters will have been lowercase to make it easier to
         * search for specific entries in a case insensitive way.
         */
        get: function () {
            return this.event;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "originalData", {
        /**
         * Raw event data received from AWS Lambda.
         */
        get: function () {
            return this.originalEvent;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Lower case all the keys in the provided list.
     * @param {[key:string]: string}
     */
    Request.prototype.normalizeKeys = function (list) {
        for (var key in list) {
            var value = list[key];
            delete list[key];
            list[key.toLowerCase()] = value;
        }
    };
    /**
     * Retrieve a header value if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    Request.prototype.getHeader = function (key, defaultVal) {
        if (defaultVal === void 0) { defaultVal = ''; }
        return this.getValue(this.event.headers, key, defaultVal);
    };
    /**
     * Retrieve the method used to initiate this request.
     */
    Request.prototype.getMethod = function () {
        return this.event.httpMethod.toUpperCase();
    };
    /**
     * Retrieve a query string parameter if it exists.
     * @param  {string}    key  Case Insensitive query string parameter
     * @param  {string}    defaultVal Value to return if that query string parameter is undefined.
     * @return {string}
     */
    Request.prototype.getQueryStringParameter = function (key, defaultVal) {
        if (defaultVal === void 0) { defaultVal = ''; }
        return this.getValue(this.event.queryStringParameters, key, defaultVal);
    };
    /**
     * Retrieve a path parameter if it exists.
     * @param  {string}    key  Case Insensitive path parameter
     * @param  {string}    defaultVal Value to return if that path parameter is undefined.
     * @return {string}
     */
    Request.prototype.getPathParameter = function (key, defaultVal) {
        if (defaultVal === void 0) { defaultVal = ''; }
        return this.getValue(this.event.pathParameters, key, defaultVal);
    };
    /**
     * Retrieve a stage variable if it exists. The key for is case sensitive for this function unlike the other get
     * functions.
     * @param  {string}    key  Case sensitive key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    Request.prototype.getStageVariable = function (key, defaultVal) {
        if (defaultVal === void 0) { defaultVal = ''; }
        return this.getValue(this.event.stageVariables, key, defaultVal, false);
    };
    /**
     * Retrieve a resource ID path parameter. Assumes that path parameter name is _id_.
     * @todo Need to rethink this method.
     * @deprecated
     * @return {string} [description]
     */
    Request.prototype.getResourceId = function () {
        return this.getPathParameter('id');
    };
    /**
     * Retrieve a specific value from an array or return a default value.
     * @param  {[key:string]: string}    list
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @param  {boolean}   lcKey Whatever the key should be lowercase before trying to find the value.
     * @return {string}
     */
    Request.prototype.getValue = function (list, key, defaultVal, lcKey) {
        if (lcKey === void 0) { lcKey = true; }
        if (lcKey) {
            key = key.toLowerCase();
        }
        if (list && list[key] != undefined) {
            return list[key];
        }
        else {
            return defaultVal;
        }
    };
    /**
     * Retrieve the content-type of this request as defined by the content-type header.
     * @return {string}
     */
    Request.prototype.getContentType = function () {
        return this.getHeader('content-type');
    };
    /**
     * Return the request origin's as defined by the origin header.
     * @return {string} [description]
     */
    Request.prototype.getOrigin = function () {
        return this.getHeader('origin');
    };
    /**
     * Return the request origin's domain.
     * @return {string} [description]
     */
    Request.prototype.getOriginDomain = function () {
        var origin = this.getOrigin();
        if (origin) {
            var url = Url.parse(origin);
            if (url.hostname) {
                return url.hostname;
            }
        }
        return '';
    };
    /**
     * Return the protocol of the Request Origin.
     * @return {string} [description]
     */
    Request.prototype.getOriginProtocol = function () {
        var origin = this.getOrigin();
        if (origin) {
            var url = Url.parse(origin);
            if (url.protocol) {
                return url.protocol.replace(/:$/, '');
            }
        }
        return '';
    };
    /**
     * Return the port of the Request Origin.
     * @return {string}
     */
    Request.prototype.getOriginPort = function () {
        var origin = this.getOrigin();
        if (origin) {
            var url = Url.parse(origin);
            if (url.port) {
                return url.port;
            }
        }
        return '';
    };
    /**
     * Attempt to parse the body content has defined by the content type header
     * @param   {string}    type    Optional parameter to explicitely define the MIME type to use when parsing the body.
     * @return {any}
     */
    Request.prototype.getParseBody = function (type) {
        if (type === void 0) { type = ''; }
        if (type == '') {
            type = this.getContentType();
        }
        var parseBody = null;
        switch (type) {
            case 'text/json':
            case 'text/x-json':
            case 'application/json':
                parseBody = this.getBodyAsJSON();
                break;
            case 'text/plain':
            default:
                return this.event.body;
        }
        return parseBody;
    };
    /**
     * Attempt to parse the request body as JSON.
     * @throws BadRequestError
     * @return {any}
     */
    Request.prototype.getBodyAsJSON = function () {
        try {
            var data = JSON.parse(this.event.body);
            if (typeof data == 'object') {
                return data;
            }
        }
        catch (error) {
        }
        throw new Errors_1.ValidationError([{
                message: 'Can not parse JSON string.',
                type: 'BadRequestError',
                path: ''
            }]);
    };
    /**
     * Validate the Query string parameter using the provided shcema. If the validation passes, a void promise is
     * return. Otherwise the promise is rejected with an appropriate HTTP error
     * @param  {JOI.SchemaMap} schema
     * @return {Promise<void>}
     */
    Request.prototype.validateQueryString = function (schema) {
        var result = JOI.validate(this.data.queryStringParameters, JOI.object().keys(schema));
        if (result.error) {
            return Promise.reject(new Errors_1.ValidationError(result.error.details));
        }
        else {
            return Promise.resolve();
        }
    };
    /**
     * Retrieve the list of cookies from the request. If the cookie header is not present or if the cookie string is
     * malformed than an empty object is returned.
     * is returned.
     * @return {Map<string>}
     */
    Request.prototype.getCookies = function () {
        if (this.cookies == undefined) {
            var cookieStr = this.getHeader('cookie').trim();
            this.cookies = Cookie.parse(cookieStr);
        }
        return this.cookies;
    };
    /**
     * Retrieve a cookie by its key
     * @param  {string} key [description]
     * @param  {string} defaultVal Default value to return if the cookie key is unset.
     * @return {string}
     */
    Request.prototype.getCookie = function (key, defaultVal) {
        if (defaultVal === void 0) { defaultVal = ''; }
        var cookies = this.getCookies();
        return cookies[key] == undefined ? defaultVal : cookies[key];
    };
    return Request;
}());
exports.Request = Request;
