"use strict";
var schema          = require('./schema');
var Err;

module.exports = function(name, defaultProperties, customConstructor) {
    var construct = generateErrorConstructor(name, Error, name, defaultProperties, customConstructor);
    extend(module.exports, name, construct);
    return construct;
};


Err = module.exports('CustomError');
Err.extend('name', { message: 'Invalid name provided.', code: 'ENAME', expected: 'a non-empty string' });
Err.extend('exist', { message: 'Name in use', code: 'EEXIST' });
console.log('');

/**
 * Set the property for an object.
 * @param {object} obj
 * @param {name} property
 * @param {*} value
 */
function extend(obj, property, value) {

    // possibly throw invalid property name error
    if (typeof property !== 'string' || !property) {
        throw new Err.name({ received: property });
    }

    // possibly throw exists error
    if (Object.keys(obj).indexOf(property) !== -1) {
        throw new Err.exist('A custom error with this name already exists: ' + property);
    }

    delete obj[property];
    Object.defineProperty(obj, property, {
        enumerable: true,
        configurable: true,
        writable: false,
        value: value
    });
}

/**
 * Generate a function that is to be used as an Error constructor.
 * @param {object} defaultProperties
 * @param {object} parentConstructor
 * @param {string} parentName
 * @param {function} [customConstructor]
 * @param {string} [constructorName]
 * @returns {function}
 */
function generateErrorConstructor(constructorName, parentConstructor, parentName, defaultProperties, customConstructor) {
    var args;
    var construct;

    // possibly throw invalid property name error
    if (typeof constructorName !== 'string' || !constructorName) throw new Err.name({ received: constructorName });

    // normalize optional parameters
    if (typeof defaultProperties === 'function') {
        customConstructor = arguments[3];
        defaultProperties = {};
    } else {
        if (!defaultProperties || typeof defaultProperties !== 'object') defaultProperties = {};
        if (typeof customConstructor !== 'function') customConstructor = defaultCustomConstructor;
    }

    // store arguments (for extend function)
    args = {
        name: constructorName,
        props: defaultProperties,
        custom: customConstructor
    };

    construct = function(message, properties, configuration) {
        var config;
        var err;
        var finalProperties;
        var originalStackLength;
        var stack;

        // force this function to be called with the new keyword
        if (!(this instanceof construct)) return new construct();
        err = this;

        // rename the constructor
        delete this.constructor.name;
        Object.defineProperty(this.constructor, 'name', {
            enumerable: false,
            configurable: true,
            value: constructorName,
            writable: false
        });

        // set default parameter values
        if (typeof message === 'object') {
            configuration = properties && typeof properties === 'object' ? properties : {};
            properties = message ? message : {};
            message = properties.message || '';
        } else {
            if (!message || typeof message !== 'string') message = '';
            if (!properties || typeof properties !== 'object') properties = {};
            if (!configuration || typeof configuration !== 'object') configuration = {};
        }

        // get the final properties
        finalProperties = Object.assign({}, defaultProperties, properties);

        // get the normalized configuration
        config = schema.normalize(configuration);

        // set the error's name
        this.name = parentName;

        // set the default message
        this.message = message;

        // set the stack trace
        originalStackLength = Error.stackTraceLimit;
        Error.stackTraceLimit = config.stackLength + 2;
        stack = (new Error()).stack.split('\n');
        stack.splice(0, 3);
        stack.unshift(this.message);
        Error.stackTraceLimit = originalStackLength;
        this.stack = stack.join('\n');

        // add properties to this object
        Object.keys(finalProperties).forEach(function (key) {
            Object.defineProperty(err, key, {
                value: finalProperties[key],
                enumerable: true,
                writable: true,
                configurable: true
            });
        });

        // call the custom constructor
        customConstructor.call(this, message, properties);
    };

    //cause the function prototype to inherit from Error prototype
    construct.prototype = Object.create(parentConstructor.prototype);
    construct.prototype.constructor = construct;

    //add additional properties to the constructor's prototype
    construct.prototype.toJSON = toJSON;

    //add an extends property to the constructor object
    construct.extend = function(name, defaultProperties, customConstructor) {
        var con;
        var props;
        var cust;

        // normalize optional parameters
        if (typeof defaultProperties === 'function') {
            cust = arguments[1];
            props = Object.assign({}, args.props);
        } else {
            props = !defaultProperties || typeof defaultProperties !== 'object' ?
                Object.assign({}, args.props) :
                Object.assign({}, args.props, defaultProperties);
            cust = typeof customConstructor !== 'function' ? args.custom : defaultCustomConstructor;
        }

        con = generateErrorConstructor(constructorName + '.' + name, construct, constructorName, props, function(message, properties) {
            cust.call(this, message, properties, args.custom);
        });
        extend(construct, name, con);
        return con;
    };

    return construct;
}

/**
 * The default custom constructor function.
 */
function defaultCustomConstructor(message, properties, parent) {
    var stack;

    this.message = this.name +
        (this.hasOwnProperty('code') ? ' ' + this.code + ': ' : ': ') +
        this.message;

    stack = this.stack.split('\n');
    stack.splice(0, 1, this.message);
    this.stack = stack.join('\n');
}

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