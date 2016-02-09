/*global mojo */

(function () {
    'use strict';

    var base = mojo.base;

    base.IllegalArgumentException = function constructor(msg, cause) {
        base.Exception.call(this, msg, cause);
        this.constructor = constructor;
    };

    base.IllegalArgumentException.prototype = new base.Exception();

    base.IllegalArgumentException.toString = function () {
        return '<mojo.base.IllegalArgumentException>';
    };
}());
