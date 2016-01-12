"use strict";
var schemata         = require('object-schemata');

module.exports = schemata({
    stackLength: {
        description: 'Alter the default stack length for this error.',
        help: 'This value must be a non-negative number',
        defaultValue: 10,
        validate: function(value, is) {
            return is.number(value) && !is.nan(value) && value >= 0;
        }
    }
});