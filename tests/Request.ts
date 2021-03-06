import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../src/index';
import { fakeEvent as fakeEventSource } from './FakeEvent';
import * as JOI from 'joi';
import * as lambda from 'aws-lambda';


function cloner<T>(original: T): T {
    return JSON.parse(JSON.stringify(original));
}

let fakeEvent: lambda.APIGatewayEvent = cloner(fakeEventSource);

const assert = chai.assert;

describe('Request', () => {
    let clone = cloner(fakeEvent)
    let request = new Lib.Request(clone);

    it('constructor');

    it('getBodyAsJSON', () => {
        let clone = cloner(fakeEvent)
        let request = new Lib.Request(clone);

        assert.deepEqual(request.getBodyAsJSON(), JSON.parse(fakeEvent.body));

        clone = cloner(fakeEvent)
        clone.body = '';
        request = new Lib.Request(clone);
        assert.throws(() => request.getBodyAsJSON(), 'ValidationError');

        clone = cloner(fakeEvent)
        clone.body = 'Non-sense!!!';
        request = new Lib.Request(clone);
        assert.throws(() => request.getBodyAsJSON(), 'ValidationError');

        clone = cloner(fakeEvent)
        clone.body = '12345';
        request = new Lib.Request(clone);
        assert.throws(() => request.getBodyAsJSON(), 'ValidationError');

    });

    it( 'data', () => {
        assert.strictEqual(request.data, clone);
    });

    it( 'originalData', () => {
        assert.deepEqual(request.originalData, fakeEvent);
    });

    it( 'getHeader', () => {
        assert.equal(request.getHeader('UPPER'), 'CASE');
        assert.equal(request.getHeader('upper'), 'CASE');
        assert.equal(request.getHeader('lower'), 'case');
        assert.equal(request.getHeader('LOWER'), 'case');
        assert.equal(request.getHeader('miXed'), 'cAsE');
        assert.equal(request.getHeader('MIxED'), 'cAsE');
        assert.equal(request.getHeader('doesnotexist'), '');
        assert.equal(request.getHeader('limit', '20'), '20');
    });

    it( 'getQueryStringParameter', () => {
        assert.equal(request.getQueryStringParameter('key1'), 'value');
        assert.equal(request.getQueryStringParameter('KEY1'), 'value');
        assert.equal(request.getQueryStringParameter('HeLLo'), 'world');
        assert.equal(request.getQueryStringParameter('hEllO'), 'world');
        assert.equal(request.getQueryStringParameter('FOO'), 'BAR');
        assert.equal(request.getQueryStringParameter('foo'), 'BAR');
        assert.equal(request.getQueryStringParameter('doesnotexist'), '');
        assert.equal(request.getQueryStringParameter('limit', '20'), '20');
    });

    it( 'getStageVariable', () => {
        assert.equal(request.getStageVariable('key1'), 'value');
        assert.equal(request.getStageVariable('KEY1'), '');
        assert.equal(request.getStageVariable('HeLLo'), 'world');
        assert.equal(request.getStageVariable('hEllO'), '');
        assert.equal(request.getStageVariable('FOO'), 'BAR');
        assert.equal(request.getStageVariable('foo'), '');
        assert.equal(request.getStageVariable('doesnotexist'), '');
        assert.equal(request.getStageVariable('limit', '20'), '20');
    });

    it ('getContentType', () => {
        fakeEvent.headers['content-type'] = 'text/plain';
        request = new Lib.Request(fakeEvent);
        assert.equal(request.getContentType(), 'text/plain');

        fakeEvent.headers['content-type'] = undefined;
        fakeEvent.headers['Content-Type'] = 'text/html';
        request = new Lib.Request(fakeEvent);
        assert.equal(request.getContentType(), 'text/html');

        fakeEvent.headers['Content-Type'] = undefined;
        request = new Lib.Request(fakeEvent);
        assert.equal(request.getContentType(), '');
    });

    it ('validateQueryString', () => {
        request = new Lib.Request(fakeEvent);
        // { key1: 'value', hello: 'world', foo: 'BAR' }
        return request.validateQueryString({
            'key1': JOI.string().required(),
            'hello': JOI.string().required(),
            'foo':  JOI.string().required(),
            'optional': JOI.string(),
        }).catch((error) => {
            // Test a valid schema,
            assert(false, 'Valid schema returns error');
        }).then(() => {
            // This will throw an error because `key1` is missing.
            return request.validateQueryString({
                'hello': JOI.string().required(),
                'foo':  JOI.string().required()
            })
        }).then(() => {
            assert(false, 'Invalid schema does not return error');
        }).catch((error) => {
            if (error.message != 'ValidationError') {
                throw error;
            }
        });
    });

    it ('getCookies', () => {
        // Empty cookie
        request = new Lib.Request(fakeEvent);
        assert.deepEqual(request.getCookies(), {});

        let alteredEvent = cloner(fakeEvent);

        // Malformed cookied
        alteredEvent.headers['cookie'] = 'sda7gy78&*&*&*&*!Yfg8DS&gvsdh7 ; ^YG^A&FG(^7fagsf67)';
        request = new Lib.Request(alteredEvent);
        assert.deepEqual(request.getCookies(), {});

        // Properly form cookie
        alteredEvent.headers['cookie'] = 'hello=world';
        request = new Lib.Request(alteredEvent);
        assert.deepEqual(request.getCookies(), {'hello': 'world'});

        alteredEvent.headers['cookie'] = 'hello=world;value2=foo%20bar';
        request = new Lib.Request(alteredEvent);
        assert.deepEqual(request.getCookies(), {'hello': 'world', 'value2':'foo bar'});

    });

    it ('getCookie', () => {
        // Empty cookie
        request = new Lib.Request(fakeEvent);
        assert.equal(request.getCookie('hello'), '');
        assert.equal(request.getCookie('hello', '0'), '0');

        let alteredEvent = cloner(fakeEvent);

        // Malformed cookied
        alteredEvent.headers['cookie'] = 'sda7gy78&*&*&*&*!Yfg8DS&gvsdh7 ; ^YG^A&FG(^7fagsf67)';
        request = new Lib.Request(alteredEvent);
        assert.equal(request.getCookie('hello'), '');
        assert.equal(request.getCookie('hello', '0'), '0');

        // Properly form cookie
        alteredEvent.headers['cookie'] = 'hello=world';
        request = new Lib.Request(alteredEvent);
        assert.equal(request.getCookie('hello'), 'world');
        assert.equal(request.getCookie('hello', '0'), 'world');
        assert.equal(request.getCookie('value2'), '');

        alteredEvent.headers['cookie'] = 'hello=world;value2=foo%20bar';
        request = new Lib.Request(alteredEvent);
        assert.equal(request.getCookie('hello'), 'world');
        assert.equal(request.getCookie('hello', '0'), 'world');
        assert.equal(request.getCookie('value2'), 'foo bar');

    });

    it ('getOriginPort', () => {
        // Empty cookie
        request = new Lib.Request(fakeEvent);
        assert.equal(request.getOriginPort(), '');

        let alteredEvent = cloner(fakeEvent);

        // Malformed cookied
        alteredEvent.headers['origin'] = 'https://example.com:8080';
        request = new Lib.Request(alteredEvent);
        assert.equal(request.getOriginPort(), '8080');
    });


});
