/* global mojo */

(function () {
    'use strict';

    var base = mojo.base;

    base.NoSuchElementException = function constructor() {
        base.Exception.call(this);
        this.constructor = constructor;        
    };

    base.NoSuchElementException.prototype = new base.Exception();

    base.NoSuchElementException.toString = function () {
        return '<mojo.base.NoSuchElementException>';
    };
}());
