/*global mojo */

(function () {
    'use strict';

    var base = mojo.base;

    base.IllegalOperationException = function constructor(msg, cause) {
        base.Exception.call(this, msg, cause);
        this.constructor = constructor;
    };

    base.IllegalOperationException.prototype = new base.Exception();

    base.IllegalOperationException.toString = function () {
        return '<mojo.base.IllegalOperationException>';
    };
}());
