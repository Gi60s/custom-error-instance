# custom-error-instance

Produce custom JavaScript errors that:

 - Integrate seemlessly with NodeJS' existing Error implementation.
 - Extend the Error object without altering it.
 - Create an inheritance hierarchy of custom errors and sub custom errors.
 - Have instanceof types and instance constructor names.
 - Accept additional properties.
 - Produce custom error output.

## Table of Contents

 1. [Install](#install)
 2. [Basic Example](#basic-example)
 3. [Explanation](#explanation)
 4. [API](#api)
 5. [Examples](#examples)

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

## Explanation

First we need to include the custom-error-instance library in our code.

```js
var CustomError = require('custom-error-instance');
```

Next we create a custom error constructor function. This returns the custom error constructor, but it also registers it on the CustomError object as a property with the same name.

```js
var ErrorX = CustomError('MyError');
console.log(ErrorX === CustomError.MyError);    // true
```

Now we can create an instance of our custom error.

```js
var err = new ErrorX('There is a problem.');
console.log(err instanceof ErrorX);                 // true
console.log(err instanceof CustomError.MyError);    // true
console.log(err instanceof Error);                  // true, through inheritance
```

We can also throw the error directly.

```js
throw new ErrorX('There is a problem.');
throw new CustomError.MyError('There is a problem.');
```

## API

This module has just one function that is used to produce custom error classes that extend the original Error class.

### CustomError ( name [, defaultProperties ] [, customConstructor ] )

Call this function to create a custom error constructor function. The constructor function that is produced will be returned by the function and it will also be registered as a property on CustomError.

**Acceptable Signatures**

 - CustomError ( name )
 - CustomError ( name, defaultProperties );
 - CustomError ( name, customConstructor );
 - CustomError ( name, defaultProperties, customConstructor )

**Parameters:**

 - **name** (string, required) - The name to give the error class.
 - **defaultProperties** (object, optional) - an object defining the default properties for any error instances created by this class.
 - **customConstructor** (function, optional) - a function to call to modify any properties of the custom error object before it is returned. This function gets three parameters, 1) message, 2) properties, and 3) the parent customConstructor function. When the custom constructor is called it will scoped to the instance being generated.

**Returns:** A function that is called to construct a custom error instance. Additionally this function has a property *extend* that can be used to generate a hierarchy of errors. The extend function takes the same parameters as the CustomError function. See *Example 2* for details on how to make a child custom error.

## Examples

**Example 1: Common Usage**

```js
var CustomError = require('custom-error-instance');
var MyErr = CustomError('MyError');                             // Note: MyErr === CustomError.MyError

console.log(new MyError('Oops').message);                       // "MyError: Oops";
console.log(new MyError('Oops', { code: 'EOOP' }).message);     // "MyError EOOP: Oops"
```

**Example 2: Child Custom Error**

Child custom errors inherit properties and the custom constructor function from their parent custom error. Properties are merged between the parent and the child. If the child defines a custom constructor then the parent's constructor is passed in as a third arguments for the child's custom constructor. See *Example 5* for details on how to use the custom constructor.

```js
var CustomError = require('custom-error-instance');
var MyErr = CustomError('MyError');             // Note: MyErr === CustomError.MyError
var ChildError = MyErr.extend('child');         // Note: ChildError === CustomError.MyError.child
var e = new ChildError('Oops');

console.log(e.message);                         // "MyError: Oops";
console.log(e instanceof ChildError);           // true
console.log(e instanceof MyError);              // true, through inheritance
console.log(e instanceof Error);                // true, through inheritance
console.log(e.constructor.name);                // "MyError.child"
```

**Example 3: Default Properties**

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError', { code: 'EMY', foo: 'bar' });

var e = new MyError('Oops');
console.log(e.message);         // "MyError EMY: Oops"
console.log(e.code);            // 'EMY'
console.log(e.foo);             // "bar"
```

**Example 4: Overwrite Default Properties**

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError', { code: 'EMY', foo: 'bar' });

var e = new MyError('Oops', { code: 'FOO' });
console.log(e.message);                             // "MyError FOO: Oops"
console.log(e.code);                                // 'FOO'
console.log(e.foo);                                 // "bar"
```

**Example 5: Custom Constructor**

In the following example, a function is passed in as the third argument when defining a custom error. This function will have the scope of the error instance being created (when it is created) and will receive the message string, properties object, and parent object.

```js
var CustomError = require('custom-error-instance');
var MyError = CustomError('MyError', {}, function(message, properties, parent) {
    this.message = 'This is a MyError with message: ' + message;
});

var e = new MyError('Oops');
console.log(e.message);         // "This is a MyError with message: Oops"
```