# custom-error-instance

Produce custom JavaScript errors that:

 - Integrate seemlessly with NodeJS' existing Error implementation.
 - Extend the Error object without altering it.
 - Create an inheritance hierarchy of custom errors and sub custom errors.
 - Have instanceof types and instance constructor names.
 - Accept additional properties.
 - Produce custom error output.
 - Will produce a stack trace of the length you specify.

## Install

```sh
npm install custom-error-instance
```

## Basic Example

```js
var CustomError = require('custom-error-instance');
var e;

// define a custom error with a default message
var Parent = CustomError('ParentError', { message: 'Parent error' });

// define a custom error that inherits from the Parent custom error
var Child = CustomError('ChildError', Parent, { message: 'Child error' });

// create an error instance that uses defaults
e = Parent();
console.log(e.toString());          // "ParentError: Parent error"
console.log(e.message);             // "Parent error"
console.log(e.name);                // "ParentError"
console.log(e.constructor.name);    // "ParentError"
console.log(e instanceof Parent);   // true
console.log(e instanceof Error);    // true

// create an error instance that overwrites the default message
e = Parent('Hello');
console.log(e.toString());          // "ParentError: Hello"
console.log(e.message);             // "Hello"
console.log(e.name);                // "ParentError"
console.log(e.constructor.name);    // "ParentError"
console.log(e instanceof Parent);   // true
console.log(e instanceof Error);    // true

// create an error instance that overwrites the default message and defines a code
e = Parent({ message: 'Hello', code: 'XYZ' });
console.log(e.toString());          // "ParentError XYZ: Hello"
console.log(e.message);             // "Hello"
console.log(e.name);                // "ParentError"
console.log(e.constructor.name);    // "ParentError"
console.log(e instanceof Parent);   // true
console.log(e instanceof Error);    // true

// create an error instance of the Child custom error
e = Child();
console.log(e.toString());          // "ParentError: Child error"
console.log(e.message);             // "Child error"
console.log(e.name);                // "ChildError"
console.log(e.constructor.name);    // "ChildError"
console.log(e instanceof Child);    // true
console.log(e instanceof Parent);   // true
console.log(e instanceof Error);    // true
```

## Practical Example

```js
var CustomError = require('custom-error-instance');
var store = {};

var Err = CustomError('MapError');
Err.inuse = CustomError(Err, { message: 'The specified key is already in use.', code: 'EINUSE' });
Err.dne = CustomError(Err, { message: 'The specified key does not exist.', code: 'EDNE' });

exports.add = function(key, value) {
    if (store.hasOwnProperty(key)) throw new Err.inuse();   // "MapError EINUSE: The specified key is already in use."
    store[key] = value;
};

exports.get = function(key) {
    if (!store.hasOwnProperty(key)) throw new Err.dne();    // "MapError EDNE: The specified key does not exist."
    return store[key];
};

exports.remove = function(key) {
    if (!store.hasOwnProperty(key)) throw new Err.dne();    // "MapError EDNE: The specified key does not exist."
    delete store[key];
};
```

## API

This module has just one function that is used to produce custom error constructors.

### CustomError ( [ name ] [, parent ] [, properties ] [, factory ] )

Call this function to create a custom error constructor function. The constructor function that is produced will be returned by the function and it will also be registered as a property on CustomError.

**Parameters**

- **name** - an optional string that defines the name for the error. This name is also applied to the constructor name property. Defaults to `'Error'` or the name of the parent custom error.
- **parent** - an optional constructor function to inherit from. This function must be the `Error` function or a custom error constructor. Defaults to `Error`.
- **properties** - an optional object with properties and values that will be merged with any properties provided when an instance is created from this custom error constructor. Defaults to `{}`
- **factory** - an optional function to call to modify the properties of the custom error instance. If not provided and this constructor's parent is `Error` then the default factory will be used. Note that all factories in an inheritance chain will be called, starting at the top most parent in the inheritance chain. Every factory called recieves two parameters: 1) the merged properties object, 2) a configuration object that can specify instructions to the factory on what to do.

**Returns** a constructor function.

## Constructor Function

Defining a custom error returns a constructor function.

```js
var myErrConstructor = CustomError('MyErr', { message: 'Error occurred' });
```

You call the constructor to generate an error.

```js
throw new myErrConstructor();
```

The constructor function takes two parameters:

1. **message** - This can be a string to fill the message property with or it can be an object that defines properties. Any properties defined here will overwrite properties specified when the constructor was being created by `CustomError`.
2. **config** - A configuration that can modify the behavior of the factory.

## Default Factory

If a custom error is being defined without a factory and it's parent is `Error` then the default factory will be used. The default factory does the following:

1) Copies properties and their values onto the instance.
2) Generates a stack trace and stores it on the instance.
3) Creates message getter and setter on the instance.
4) Creates code getter and setter on the instance.

The configuration parameter for the factory takes the following properties:

- **stackLength** - Specify the length of the stack trace for this error instance.

## Examples

**Example 1: Common Usage**

```js
var CustomError = require('custom-error-instance');
var MyErr = CustomError('MyError', { message: 'Default message' });

console.log(new MyError().toString());                                      // "MyError: Default Message";
console.log(new MyError('Oops').toString());                                // "MyError: Oops";
console.log(new MyError({ message: 'Oops', code: 'EOOP' }).toString());     // "MyError EOOP: Oops"
```

**Example 2: Child Custom Error**

Child custom errors inherit properties and the factories from their parent custom error.

```js
var CustomError = require('custom-error-instance');
var MyErr = CustomError('MyError', { message: 'Parent message' });
var ChildError = CustomError('ChildError', MyErr, { message: 'Child message');
var e = new ChildError();

console.log(e.message);                         // "Child message";
console.log(e instanceof ChildError);           // true
console.log(e instanceof MyErr);                // true, through inheritance
console.log(e instanceof Error);                // true, through inheritance
console.log(e.constructor.name);                // "ChildError"
```

**Example 3: Default Properties**

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError', { code: 'EMY', foo: 'bar' });

var e = new MyError('Oops');
console.log(e.message);         // "Oops"
console.log(e.code);            // 'EMY'
console.log(e.foo);             // "bar"
```

**Example 4: Overwrite Default Properties**

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError', { code: 'EMY', foo: 'bar' });

var e = new MyError({ message: 'Oops', code: 'FOO' });
console.log(e.message);                             // "Oops"
console.log(e.code);                                // 'FOO'
console.log(e.foo);                                 // "bar"
```

**Example 5: Custom Factory**

Every factory recieves two parameters: 1) the properties object, 2) a configuration that should be used to modify the behavior of the factory. If a custom error inherits from another custom error then all factories in the inheritance chain are called, starting at the topmost parent. The factory function is called with the scope of the error instance.

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError', function(properties, config) {
    this.properties = properties;
});
var e = new MyError('Oops');
console.log(e.properties.message);         // "Oops"
```