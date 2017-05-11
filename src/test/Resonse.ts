import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../index';
import * as Lambda from 'aws-lambda';
import { Buffer } from 'buffer';

const assert = chai.assert;
let error: Error;
let proxyResult: Lambda.ProxyResult;
const callback:Lambda.ProxyCallback = (err: Error, data:Lambda.ProxyResult) => {
    error = err;
    proxyResult = data;
};

describe('Response', () => {
    let response = new Lib.Response(callback);

    it('setBody', () => {
        assert.isNull(response.body);

        response.setBody('hello');
        assert.equal(response.body, 'hello');

        response.setBody({hello:"world"});
        assert.equal(response.body, '{"hello":"world"}');

        response.setBody(undefined);
        assert.isNull(response.body);

        response.setBody(null);
        assert.isNull(response.body);

        response.setBody(new Buffer('hello world'));
        assert.equal(response.body, 'hello world');

        response.setBody(1234);
        assert.strictEqual(response.body, '1234');

        response.setBody(['a','b','c']);
        assert.equal(response.body, '["a","b","c"]');

    });

    it('redirect', () => {
        proxyResult = null;
        response.redirect('https://example.com/abc.html');

        console.dir(proxyResult);
        assert.isOk(proxyResult);
        assert.equal(proxyResult.statusCode, 302);
        assert.isNotOk(proxyResult.body);
        assert.isOk(proxyResult.headers);
        assert.equal(proxyResult.headers['location'], 'https://example.com/abc.html');

    });

});
