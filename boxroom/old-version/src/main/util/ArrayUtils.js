/*jslint browser: true, plusplus: true, nomen: true */
var mojo;

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util;

    /**
     * A arrays helper class.
     *
     * @class mojo.util.ArrayUtils
     * @final
     * @class
     */
    util.ArrayUtils = function () {
        throw 'mojo.util.ArrayUtils is not callable directly!';
    };

    util.ArrayUtils.toString = function () {
        return '<mojo.util.ArrayUtils>';
    };

    util.ArrayUtils.asArray = function (value) {
        var ret;

        if (util.TypeUtils.isArray(value)) {
            ret = value;
        } else if (util.TypeUtils.isVacant(value)) {
            ret = [];
        } else {
            ret = [value];
        }

        return ret;
    };

    // TODO - unit tests
    util.ArrayUtils.copy = function (arr) {
        var ret = [],
            i;
        arr = util.ArrayUtils.asArray(arr);

        for (i = 0; i < arr.length; ++i) {
            ret.push(arr[i]);
        }

        return ret;
    };

    // TODO - unit tests
    util.ArrayUtils.contains = function (arr, elem) {
        return (util.ArrayUtils.indexOf(arr, elem) >= 0);
    };

    // TODO - unit tests
    util.ArrayUtils.indexOf = function (arr, elem) {
        var
            i,
            ret;

        ret = -1;

        if (arr instanceof Array) {
            for (i = 0; i < arr.length; ++i) {
                if (arr[i] === elem) {
                    ret = i;
                    break;
                }
            }
        }

        return ret;
    };

    // TODO - unit test
    util.ArrayUtils.forEach = function (arr, f) {
        if (typeof f !== 'function') {
            throw new base.IllegalArgumentException(
                    '[mojo.util.ArrayUtils.forEach] Second argument must be a function.')
        }
        
        var i = 0;

        if (arr instanceof Array) {
            for (i = 0; i < arr.length; ++i) {
                try {
                    f(arr[i], i);
                } catch (e) {
                    if (e instanceof base.StopIterationException) {
                        ++i;
                        break;
                    } else {
                        throw e;
                    }
                }
            }
        }

        return i;
    };
}());