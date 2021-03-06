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
var AmazonResourceName_1 = require("./AmazonResourceName");
var SQSQueueARN = (function (_super) {
    __extends(SQSQueueARN, _super);
    function SQSQueueARN() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.service = 'sqs';
        return _this;
    }
    /**
     * Build a URL for this queue.
     * @throws {Error} If a component is missing from the ARN
     * @return {string} [description]
     */
    SQSQueueARN.prototype.url = function () {
        if (this.service != 'sqs' || !this.region.trim() || !this.resource.trim()) {
            throw new Error('Invalid ARN subcomponent');
        }
        else {
            return 'https://' +
                this.service + '.' +
                this.region.trim() +
                '.amazonaws.com/' +
                this.accountId + '/' +
                this.resource.trim();
        }
    };
    /**
     * Receives an ARN and return a matching SQS Arn.
     * @param  {string|AmazonResourceName} arn
     * @return {SQSQueueARN}
     */
    SQSQueueARN.normalize = function (arn) {
        if (arn instanceof SQSQueueARN) {
            return arn;
        }
        else {
            return new SQSQueueARN(arn.toString());
        }
    };
    return SQSQueueARN;
}(AmazonResourceName_1.AmazonResourceName));
exports.SQSQueueARN = SQSQueueARN;
