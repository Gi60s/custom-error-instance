"use strict";
var expect      = require('chai').expect;
var CustomError = require('../index.js');

describe('CustomError', function() {

    describe('define', function() {

        afterEach(emptyDataStore);

        it('returns constructor function', function() {
            expect(CustomError('MyError')).to.be.a('function');
        });

        it('throws error on duplicate', function() {
            CustomError('MyError');
            expect(function() { CustomError('MyError'); }).to.throw(CustomError.CustomError);
        });

        it('accepts default properties', function() {
            var called = false;
            var E = CustomError('MyError', { foo: 'bar' });
            var e = new E();
            expect(e.foo).to.be.equal('bar');
        });

        it('accepts custom constructor', function() {
            var called = false;
            var E = CustomError('MyError', function() { called = true; });
            new E();
            expect(called).to.be.true;
        });

        it('custom constructor has instance scope', function() {
            var scope;
            var E = CustomError('MyError', function() { scope = this; });
            new E();
            expect(scope).to.be.instanceof(E);
        });

        it('custom constructor get\'s message as parameter 1', function() {
            var message;
            var E = CustomError('MyError', function(m) { message = m; });
            new E('a message');
            expect(message).to.be.equal('a message');
        });

        it('custom constructor get\'s properties as parameter 2', function() {
            var config = { foo: 'bar' };
            var properties;
            var E = CustomError('MyError', function(m, p) { properties = p; });
            new E('', { foo: 'bar' });
            expect(properties).to.be.deep.equal(config);
        });

    });

    describe('instance', function() {

        afterEach(emptyDataStore);

        it('produces instanceof match', function() {
            var E = CustomError('MyError');
            var e = new E();
            expect(e).to.be.instanceof(E);
        });

        it('produces named construtor', function() {
            var E = CustomError('MyError');
            var e = new E();
            expect(e.constructor.name).to.be.equal('MyError');
        });

        it('stores instanceof match', function() {
            var E = CustomError('MyError');
            var e = new E();
            expect(e).to.be.instanceof(CustomError.MyError);
        });

        it('accepts zero arguments', function() {
            var E = CustomError('MyError');
            var e = new E();
            expect(e.message).to.be.equal('MyError: ');
        });

        it('accepts message argument', function() {
            var E = CustomError('MyError');
            var e = new E('my message');
            expect(e.message).to.be.equal('MyError: my message');
        });

        it('accepts properties argument', function() {
            var E = CustomError('MyError');
            var e = new E('', { foo: 'bar' });
            expect(e.foo).to.be.equal('bar');
        });

        it('merges default and injected properties', function() {
            var E = CustomError('MyError', { a: 1, b: 2 });
            var e = new E('', { b: 'B', c: 3 });
            expect(e.a).to.be.equal(1);
            expect(e.b).to.be.equal('B');
            expect(e.c).to.be.equal(3);
        });

        it('accepts code property argument', function() {
            var E = CustomError('MyError');
            var e = new E('', { code: 'ABC' });
            expect(e.message).to.be.equal('MyError ABC: ');
        });

        it('accepts configuration argument', function() {
            var E = CustomError('MyError');
            expect(function() { new E('', {}, { stackLength: 5 }); }).to.not.throw(Error);
        });

        it('validates configuration argument', function() {
            var E = CustomError('MyError');
            expect(function() { new E('', {}, { stackLength: -1 }); }).to.throw(Error);
        });

        it('has toJSON function', function() {
            var E = CustomError('MyError');
            var e = new E('', { code: 'ABC' });
            var s = e.toJSON();
            expect(s).to.be.a('string');
        });

    });

});

function emptyDataStore() {
    Object.keys(CustomError).forEach(function(key) {
        delete CustomError[key];
    });
}