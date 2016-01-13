# custom-error-instance

Produce custom JavaScript errors that:

 - Integrate seemlessly with NodeJS' existing Error implementation.
 - Extend the Error object without altering it.
 - Have instanceof types and instance constructor names.
 - Accept additional properties.
 - Produce custom reports.

## Install

```sh
npm install custom-error-instance
```

## Basic Example

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError');

try {
    throw new MyError('Oops', { code: 'EMY', foo: 'Foo' });
} catch (e) {
    console.log(e instanceof MyError);                  // true
    console.log(e instanceof CustomError.MyError);      // true
    console.log(e.constructor.name);                    // "MyError"
    console.log(e.message);                             // "MyError EMY: Oops"
    console.log(e.foo);                                 // "Foo"
}
```

## API

This module has just one function that is used to produce custom error classes that extend the original Error class.

### CustomError ( name [, defaultProperties [, customConstructor ] ] )

This function is called to produce a function with the name specified. This function is then also stored on the CustomError object as a property. Note that if a *code* property is specified as an additional property, that code will alter the message property to include the code.

**Parameters:**

 - **name** (string, required) - The name to give the error class.
 - **defaultProperties** (object, optional) - an object defining the default properties for any error instances created by this class.
 - **customConstructor** (function, optional) - a function to call to modify any properties of the custom error object before it is returned. This function gets two parameters, 1) message, and 2) properties. It is also scoped to the object instance being generated.

**Returns:** A function that is called to construct a custom error instance.

## Examples

**Example 1: Common Usage**

```js
// include the custom-error-instance library
var CustomError = require('custom-error-instance');

// produce a function that generates a custom error
var MyError = CustomError('MyError');

console.log(new MyError('Oops').message);                       // "MyError: Oops";
console.log(new MyError('Oops', { code: 'EOOP' }).message);     // "MyError EOOP: Oops"
```

**Example 2: Default Properties**

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError', { code: 'EMY', foo: 'bar' });

var e = new MyError('Oops');
console.log(e.message);         // "MyError EMY: Oops"
console.log(e.foo);             // "bar"
```

**Example 3: Overwrite Default Properties**

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError', { code: 'EMY' });

var e = new MyError('Oops', { code: 'FOO' });
console.log(e.message);                             // "MyError FOO: Oops"
```

**Example 4: Custom Constructor**

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError', {}, function(message, properties) {
    this.message = 'This is a MyError with message: ' + message;
});

var e = new MyError('Oops');
console.log(e.message);         // "This is a MyError with message: Oops"
```