"use strict";
var CustomError = require('../index');

var store = {};

var Err = CustomError('MapError');
Err.extend('inuse', { message: 'The specified key is already in use.', code: 'INUSE' });
Err.extend('dne', { message: 'The specified key does not exist.', code: 'DNE' });

exports.add = function(key, value) {
    if (store.hasOwnProperty(key)) throw new Err.inuse();
    store[key] = value;
};

exports.get = function(key) {
    if (!store.hasOwnProperty(key)) throw new Err.dne();
    return store[key];
};

exports.remove = function(key) {
    if (!store.hasOwnProperty(key)) throw new Err.dne();
    delete store[key];
};