/* global mojo */

(function () {
    'use strict';

    var base = mojo.base;

    base.NotImplementedException = function constructor() {
        base.Exception.call(this);
        this.constructor = constructor;        
    };

    base.NotImplementedException.prototype = new base.Exception();

    base.NotImplementedException.toString = function () {
        return '<mojo.base.NotImplementedException>';
    };
}());
