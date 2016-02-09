/*global mojo */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util;

    
    util.ObjectUtils = {
        copy: function (obj, target) {
            if (obj !== null || typeof obj !== 'object') {
                throw new base.IllegalArgumentException(
                        '[mojo.util.ObjectUtils.copy] First argument must be an object');
            } else if (target !== undefined && target !== null && typeof target !== 'object') {
                throw new base.IllegalArgumentException(
                        '[mojo.util.ObjectUtils.copy] Second argument must either be null, undefined or an object');
            }
            
            var ret = target !== undefined && target !== null 
                    ? target
                    : {},
                prop;
            
            /*jslint forin: true */
            for (prop in obj) {
                ret[prop] = obj[prop];
            }
            
            return ret;
        },    
        
    
        getProperties: function (obj) {
            var ret = [],
                prop;

            if (obj !== null && obj !== undefined) {
                /*jslint forin: true*/
                for (prop in obj) {
                    ret.push(prop);
                }
            }

            return ret;
        },

       
        getOwnProperties: function (obj) {
            var ret = [],
                prop;

            if (obj !== null && obj !== undefined) {
                for (prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        ret.push(prop);
                    }
                }
            }
            
            return ret;
        },
        
        forEachOwnProperty: function (obj, f) {
            if (obj === null || typeof obj !== 'object') {
                throw new base.IllegalArgumentException(
                        '[mojo.util.ObjectUtils.forEachOwnProperty] First argument must be an object');
            } else if (typeof f !== 'function') {
                throw new base.IllegalArgumentException(
                        '[mojo.util.ObjectUtils.forEachOwnProperty] Second argument must be a function') ;
            }

            var ownProperties = util.ObjectUtils.getOwnProperties(obj),
                i;

            for (i = 0; i < ownProperties.length; ++i) {
                try {
                    f(ownProperties[i], obj[ownProperties[i]], i);
                } catch (e) {
                    if (e instanceof base.StopIterationException) {
                         ++i;
                         break;
                    } else {
                        throw e;
                    }
                }
            }

            return i;
        },

        freeze: function (obj) {
            var ret = false;

            if (typeof Object.freeze === 'function') {
                Object.freeze(obj);
                ret = true;
            }

            return ret;
        },

        seal: function (obj) {
            var ret = false;

            if (typeof Object.seal === 'function') {
                Object.seal(obj);
                ret = true;
            }

            return ret;
        }
    };
}());
