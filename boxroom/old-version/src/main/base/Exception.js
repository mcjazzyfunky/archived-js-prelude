/*global mojo */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util;

    base.Exception = function (message, cause) {
        this._message = message === undefined || message === null
                ? null
                : '' + message.toString();

        this._cause = cause === undefined ? null : cause;
    };
    
    base.Exception.toString = function () {
        return '<mojo.base.Exception>';
    }

    base.Exception.prototype.getMessage = function () {
        return this._message;
    };

    base.Exception.prototype.getCause = function () {
        return this._cause;
    };
    
    base.Exception.getTypeName = function () {
        return 'mojo.base.Exception';
    };
    
    base.Exception.prototype.toString = function () {
        var ret = this.constructor + ' '
                + util.StringUtils.trim(this.getMessage());
        
        ret = util.StringUtils.trim(ret);
        return ret;
    };
}());
