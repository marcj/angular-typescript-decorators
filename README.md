# Typescript decorators for Angular v1.4+

In addition to my other library for annotations in Angular 1.4+ using Ecmascript 6+ (traceur), this is an equal library but for Typescript.
It gives you some handy decorators you can use to register you directives, filter and dependencies.

## Current Issues

Using the DI of Angular with ecmascript 6 classes is usually a PITA. You have several ways to inject services:

1. Use normale constructor signature angular can read. This doesn't work when you minify your scripts and thus rename all variables.
2. Use `static get $inject() { return ['$compile', '$http'] }`. This is ugly and nasty to write and doesn't work with class inheritance.
3. Define its dependencies in the module.directive(), module.controller() method call with the array syntax. With this you have two places to change when you change dependencies and it doesn't work well with sub classes as you have to define your parent dependencies there as well.

Also if you want to use controllers you always have to define those always in the first place before you can use it.

This little auto-controller-registrator and decorator collection fixes this and provide you several annotations to register your dependencies, directives and filters.

## Why should you use this?

1. Have dependencies information directly at the class and not in several files.
2. Use controllers without unnecessary boilerplate code.
3. Register directives and filters without writing code on several places.
4. Allows you to easily override/inherit from other directives/filters/controllers by simply usings Typescripts `class X extends Y`.
5. Keep you code clean by not using static $inject or Angular's ugly array annotation for dependencie information declaration.

## How to use it?

Assign you angular module to `window.angularDecoratorModule` and every decorator will work automatically as soon as you register those classes.
This is usually done via simply loading the es6 module:

```javascript
//app.js

import './directives/MyDirective.js';
import './directives/OtherDirective.js';

import './filers/ToArray.js';

//...
```

Load this module/file (app.js) directly after setting up the angular.module to `window.angularDecoratorModule`. Look into the demo/ folder for more examples.

If you want to have the
auto-load of controller statements you need to call `registerControllerDecorator`first like so:

```javascript
window.angularDecoratorModule = window.angular.module('myModule', ['ngAnimate']);

import {registerControllerDecorator} from './angular-decorators.ts';
registerControllerDecorator(); //now the $controller has been decorated
```
Note: this decorator only starts working when in ng-controller is found at least one `/`.
Note2: Only works with SystemJS.

## Examples

### Controller usage

```html
<div ng-controller="myController as my">
</div>
```

Old way is you have to load `myController` first like so:

```javascript
angular.module('myModule').controller('myController', ['$q', function($q){
    ///my controller codes goes here
}]);
}
```

which is ugly. With this library you only need to do this:

1. Load angular-decorators.ts at the start of your app (before bootstrap your angular app) and call following once:

```javascript
window.angularDecoratorModule = window.angular.module('myModule', ['ngAnimate']);

import {registerControllerDecorator} from './angular-decorators.ts';
registerControllerDecorator(); //now the $controller has been decorated
```

Make sure that you havent't used `<html ng-app="foo">` or something and boot your angular app manually after all decorators etc have been loaded. See demo/index.html for an example.

2. In you html you don't use controller names but full path names of you controller file:

```html
<div ng-controller="controller/MyController as my">
</div>
```

```javascript
// controller/MyController.ts

export default class MyController {
    constructor($q) {
        //controller codes goes here
    }
}
```

If you `index.html` is placed in for example `www/` then the controller file for the exampe above needs to be located at `www/controller/MyController.ts`.


### Directive

Registering directive is like registering a controller in angular using the `.directive()` method - which is not nice at all.

```javascript
// directives/MyDirective.ts
import {Directive, Inject} from '../angular-decorators.ts';

@Directive('myDirective', {
    restrict: 'A',
    templateUrl: 'views/directives/MyDirective.html',
    require: '^parentDirective'
})
@Inject('$q, $http') //just in case you minify this stuff so angular can't read constructor signature
export default class MyDirective {
    constructor(protected $q, protected $http) {
        //some init stuff maybe?
    }

    link(scope, element, attributes, controller) {
        controller.registerSub(this); //controller == parentDirective's controller

        element.addClass('foo'); //do some link() stuff
    }
}
```

*Magic methods*: `link` which will be called during the link phase in angular like when you pass an link method to `.directive()`.

### Filter

Same like with Directive but another magic method: `filter`.

```javascript
// filters/ToArray.ts
import {Filter} from '../angular-decorators.ts';

@Filter('toArray')
export default class ToArray {
    filter(obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }

        return Object.keys(obj).map(function (key) {
            return Object.defineProperty(obj[key], '$key', {__proto__: null, value: key});
        });
    }
}
```

### Inject

As already shown in other examples you can use the `@Inject` decorator to explicitly tell angular which dependencies are needed, also in a minified script (where variable names has been renamed)

```javascript
// Animal.ts
import {Inject} from '../angular-decorators.ts';

@Inject('$q, $http');
export default class Animal {
    constructor(protected $q, protected $http) {
    }
}
```

```javascript
// Snake.ts
import {Inject} from '../angular-decorators.ts';
import Animal from './Animal.ts';

@Inject('$compile'); //only additional dependencies
export default class Snake extends Animal {
    constructor(protected $q, protected $http, protected $compile) {
    }
}
```