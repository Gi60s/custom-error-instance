"use strict";
var schema          = require('./schema');

var Err = CustomError('CustomError');
var store = {};


module.exports = CustomError;

/**
 * Define a custom error constructor.
 * @param {string} className
 * @param {object} [defaultProperties]
 * @param {object} [customConstructor]
 * @returns {function}
 */
function CustomError(className, defaultProperties, customConstructor) {
    var result = null;
    var str;

    //validate className
    if (typeof className !== 'string' || !className) {
        throw new Err('Cannot produce custom error class without a valid name. ' +
            'Expected a non empty string. Received: ' + className, { code: 'ENAME' });
    }
    if (CustomError.hasOwnProperty(className)) {
        throw new Err('A custom error with this class name already exists: ' + className, { code: 'EEXIST' });
    }

    //normalize optional parameters
    if (arguments.length === 2 && typeof arguments[1] === 'function') {
        defaultProperties = {};
        customConstructor = arguments[1];
    } else if (arguments.length >= 2) {
        if (!defaultProperties || typeof defaultProperties !== 'object') defaultProperties = {};
        if (typeof customConstructor !== 'function') customConstructor = noop;
    } else {
        defaultProperties = {};
        customConstructor = noop;
    }

    //create custom constructor
    str = 'result = function ' + className + '(message, properties, configuration) {' +
        'if (!(this instanceof ' + className + ')) return new ' + className + '(message, properties, configuration);' +
        'initialize.call(this, className, defaultProperties, message, properties, configuration);' +
        'customConstructor.call(this, message, properties);' +
        '}';
    eval(str);

    //cause the function prototype to inherit from Error prototype and toJSON
    result.prototype = Object.create(Error.prototype);
    result.prototype.toJSON = toJSON;
    result.prototype.constructor = result;

    //store and return the constructor
    CustomError[className] = result;
    return result;
}

/**
 * Initialize instance.
 * @param {string} name The class name.
 * @param {object} defaultProperties
 * @param {string} [message]
 * @param {object} [properties]
 * @param {object} [configuration]
 */
function initialize(name, defaultProperties, message, properties, configuration) {
    var config;
    var err = this;
    var finalProperties;
    var messageStr;
    var originalStackLength = Error.stackTraceLimit;
    var stack;

    //set defaults
    if (!message || typeof message !== 'string') message = '';
    if (!properties || typeof properties !== 'object') properties = {};
    if (!configuration || typeof configuration !== 'object') configuration = {};

    //get the final properties
    finalProperties = Object.assign({}, defaultProperties, properties);

    //get the normalized configuration
    config = schema.normalize(configuration);

    //generate default message string
    messageStr = name + (properties.hasOwnProperty('code') ? ' ' + properties.code + ': ' : ': ') + message;

    //determine what the stack trace length should be
    if (typeof config.stackLength !== 'number') config.stackLength = 10;
    if (config.stackLength < 0) config.stackLength = 0;

    //get the stack trace
    Error.stackTraceLimit = config.stackLength + 2;
    stack = (new Error()).stack.split('\n');
    stack.splice(0, 3);
    stack.unshift(messageStr);
    Error.stackTraceLimit = originalStackLength;

    //store the message and stack properties
    this.message = messageStr;
    this.stack = stack.join('\n');

    //add properties to this object
    Object.keys(finalProperties).forEach(function (key) {
        Object.defineProperty(err, key, {
            value: finalProperties[key],
            enumerable: true,
            writable: true,
            configurable: true
        });
    });
}

/**
 * No operation.
 */
function noop() {}

/**
 * Convert object instance into JSON
 * @returns {string}
 */
function toJSON() {
    var result = {};
    var self = this;
    Object.getOwnPropertyNames(this).forEach(function(name) {
        result[name] = name === 'stack' ? self[name].split('\n') : self[name];
    });
    return JSON.stringify(result);
}