import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../src/index';
import * as Lambda from 'aws-lambda';
import { Buffer } from 'buffer';
import 'mocha';

const assert = chai.assert;
let error: Error;
let proxyResult: Lambda.ProxyResult;
const callback:Lambda.ProxyCallback = (err: Error, data:Lambda.ProxyResult) => {
    error = err;
    proxyResult = data;
};

let response: Lib.Response;

describe('Response', () => {

    beforeEach(() => {
        response =  new Lib.Response(callback);
    });


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
        assert.isNotOk(response.sent);
        response.redirect('https://example.com/abc.html');
        assert.isTrue(response.sent);

        assert.isOk(proxyResult);
        assert.equal(proxyResult.statusCode, 302);
        assert.isNotOk(proxyResult.body);
        assert.isOk(proxyResult.headers);
        assert.equal(proxyResult.headers['location'], 'https://example.com/abc.html');

    });

    it('sent', () => {
        response = new Lib.Response(callback);
        // Response should be unsent to begin with.
        assert.isNotOk(response.sent);

        response.send();
        assert.isTrue(response.sent);

        // Trying to send an error a second time should faile
        assert.throw(response.send);
    });

    it('addCookie', function() {
        assert.equal(response.addCookie('key', 'value').headers['set-cookie'], 'key=value; path=/; Secure; HttpOnly');
        assert.equal(response.addCookie('key', 'value', {domain: 'example.com'}).headers['set-cookie'], 'key=value; domain=example.com; path=/; Secure; HttpOnly');

        const dateTimeString = 'Wed, 07 Dec 2016 05:00:00 GMT'
        assert.equal(response.addCookie('key', 'value', {expires: dateTimeString}).headers['set-cookie'], 'key=value; path=/; expires=' + dateTimeString + '; Secure; HttpOnly');
        assert.equal(response.addCookie('key', 'value', {expires: new Date(dateTimeString)}).headers['set-cookie'], 'key=value; path=/; expires=' + dateTimeString + '; Secure; HttpOnly');

        const maxAgeString = new Date(new Date().getTime() + 60 * 1000).toUTCString();
        assert.equal(response.addCookie('key', 'value', {maxAge: 60}).headers['set-cookie'], 'key=value; path=/; expires=' + maxAgeString + '; Secure; HttpOnly');

        assert.equal(response.addCookie('key', 'value', {maxAge: 60, expires: 'some date'}).headers['set-cookie'], 'key=value; path=/; expires=some date; Secure; HttpOnly');

        assert.equal(response.addCookie('key', 'value', {secure: true}).headers['set-cookie'], 'key=value; path=/; Secure; HttpOnly');
        assert.equal(response.addCookie('key', 'value', {secure: false}).headers['set-cookie'], 'key=value; path=/; HttpOnly');

        assert.equal(response.addCookie('key', 'value', {httpOnly: true}).headers['set-cookie'], 'key=value; path=/; Secure; HttpOnly');
        assert.equal(response.addCookie('key', 'value', {httpOnly: false}).headers['set-cookie'], 'key=value; path=/; Secure');

        assert.equal(response.addCookie('key', 'value', {secure: true}).headers['set-cookie'], 'key=value; path=/; Secure; HttpOnly');
        assert.equal(response.addCookie('key', 'value', {secure: false}).headers['set-cookie'], 'key=value; path=/; HttpOnly');

        assert.equal(response.addCookie('key', 'value', {httpOnly: true, secure: true}).headers['set-cookie'], 'key=value; path=/; Secure; HttpOnly');
        assert.equal(response.addCookie('key', 'value', {httpOnly: false, secure: true}).headers['set-cookie'], 'key=value; path=/; Secure');
        assert.equal(response.addCookie('key', 'value', {httpOnly: true, secure: false}).headers['set-cookie'], 'key=value; path=/; HttpOnly');
        assert.equal(response.addCookie('key', 'value', {httpOnly: false, secure: false}).headers['set-cookie'], 'key=value; path=/');
    });

    it('setMaxAge', () => {
        assert.isNotOk(response.headers['cache-control']);

        let chain = response.setMaxAge(10);
        assert.equal(chain, response, 'setMaxAge should be chainable');
        assert.isOk(response.headers['cache-control']);
        assert.equal(response.headers['cache-control'].toLowerCase(), 'max-age=10');

        response.setMaxAge(1);
        assert.equal(response.headers['cache-control'].toLowerCase(), 'max-age=1');

        response.setMaxAge(0);
        assert.equal(response.headers['cache-control'].toLowerCase(), 'no-cache');

        response.setMaxAge(-10);
        assert.equal(response.headers['cache-control'].toLowerCase(), 'no-cache');
    });

});
