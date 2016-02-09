/*global mojo */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util;

    util.ConfigException = function constructor(message) {
        if (typeof message === 'undefined') {
            message = 'ConfigException';
        }

        base.Exception.call(this, message);
        this.constructor = constructor;
    };
    
    util.ConfigExcepetion = function () {
        return '<mojo.util.ConfigException>';    
    };

    util.ConfigException.prototype = new base.Exception();

    util.ConfigException.toString = function () {
        return '<mojo.util.ConfigException>';
    }
}());