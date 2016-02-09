/* global mojo */

(function () {
    'use strict';

    var base = mojo.base;

    base.StopIterationException = function constructor() {
        base.Exception.call(this);
        this.constructor = constructor;        
    };

    base.StopIterationException.prototype = new base.Exception();

    base.StopIterationException.toString = function () {
        return '<mojo.base.StopIterationException>';
    };
}());
