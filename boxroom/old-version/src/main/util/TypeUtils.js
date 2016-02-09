/*jslint browser: true, plusplus: true, nomen: true */
var mojo;

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util;

    util.TypeUtils = function () {
        throw 'mojo.util.TypeUtils is not callable directly!';
    };

    util.TypeUtils.isScalar = function (value) {
        var type = typeof value;
        return (type !== 'undefined' && type !== 'object' && type !== 'function');
    };

    util.TypeUtils.isScalarOrNull = function (value) {
        return value === null || util.TypeUtils.isScalar(value);
    };

    util.TypeUtils.isScalarOrVacant = function (value) {
        var type = typeof value;
        return (type === 'undefined' || value === null || type !== 'object');
    };

    util.TypeUtils.isVacant = function (value) {
        return (value === null || typeof value === 'undefined');
    };

    util.TypeUtils.isArray = function (value) {
        return (value instanceof Array);
    };

    util.TypeUtils.isObject = function (value) {
        return (value !== null && typeof value === 'object');
    };

    util.TypeUtils.getTypeOf = function (value) {
        var ret = typeof value;

        if (value === null) {
            ret = 'null';
        }

        return ret;
    };

    // TODO - tests
    util.TypeUtils.isOfType = function (subj, allowedTypes) {
        var ret = false,
            i,
            type;

        allowedTypes = base.Arrays.asArray(allowedTypes);

        for (i = 0; i < allowedTypes.length; ++i) {
            type = allowedTypes[i];

            if (typeof type === 'undefined') {
                type = 'undefined';
            } else if (type === null) {
                type = 'null';
            }

            if ((typeof type === 'string' && util.TypeUtils.getTypeOf(subj) === type)
                    || (typeof type === 'function' && subj instanceof type)
                    || (type === 'vacant' && (subj === null || typeof subj === 'undefined'))
                    || (type === 'scalar' && util.TypeUtils.isScalar(type))) {
                ret = true;
                break;
            }
        }

        return ret;
    };

    // TODO test
    util.TypeUtils.asBoolean = function (value) {
        return !!value;
    };
}());
