/*global mojo */

(function () {
    'use strict';

    var util = mojo.util;

    util.StringUtils = {
        toString: function () {
            return '<mojo.util.StringUtils>';
        },

        asString: function (val) {
            var ret;

            if (val === undefined || val === null) {
                ret = '';
            } else {
                ret = '' + val.toString();
            }

            return ret;
        },

        trim: function (text) {
            return util.StringUtils.asString(text)
                    .replace(/^[\s\xA0]+/, '')
                    .replace(/[\s\xA0]+$/, '');
        },
        
        upperCaseFirst: function (text) {
            var ret = util.StringUtils.asString(text);
            
            if (ret.length > 0) {
                ret = ret[0].toUpperCase() + ret.substring(1, ret.length - 1);
            }
            
            return ret;
        }
    };
}());
