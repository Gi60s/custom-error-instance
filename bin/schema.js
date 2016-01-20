"use strict";
var schemata         = require('object-schemata');

exports.constructor = schemata({
    factory: {
        description: 'A function to call to make modifications to a custom error instance immediately before it is returned.',
        help: 'This value must be a function.',
        defaultValue: noop,
        validate: function(value, is) {
            return typeof value === 'function';
        }
    },
    parent: {
        description: 'The Error constructor that this constructor will inherit from.',
        help: 'This value must be an Error constructor or a CustomError constructor.',
        defaultValue: Error,
        validate: function(value, is) {
            return value === Error || value.prototype.hasOwnProperty('__CustomError');
        }
    },
    properties: {
        description: 'Default properties for any custom error instances that are created.',
        help: 'This must be a non-null an object.',
        defaultValue: {},
        validate: function(value, is) {
            return value && typeof value === 'object';
        }
    }
});

exports.instance = schemata({
    stackLength: {
        description: 'Alter the default stack length for this error.',
        help: 'This value must be a non-negative number',
        defaultValue: 10,
        validate: function(value, is) {
            return is.number(value) && !is.nan(value) && value >= 0;
        }
    }
});

function noop(message, options) {

    if (typeof message === 'string') message = { message: message };

    console.log(this);
    console.log(arguments);

    this.message = message;
}