'use strict';

import Seq from './Seq.js';

/**
 * Utility class with static helper functions to be used with any value - mainly objects.
 */
export default class Objects {
    /**
     * Will throw exception if someone tries to instantiate this utility class.
     *
     * @ignore
     */
    construct() {
        throw '[Objects] Class is not instantiable';
    }

    /**
     * Will return a proper string representation for debugging purposes.
     *
     * @ignore
     */
    static toString() {
        return '<utility class Objects>';
    }

    /**
     * Checks for being something else than undefined or null.
     *
     * @param {any} obj
     *    The value to be checked
     *
     * @return {boolean}
     *    false if obj is null or undefined, otherwise true
     *
     * @example
     *    Objects.isSomething(undefined)  // false
     *    Objects.isSomething(null)       // false
     *    Objects.isSomething(0)          // true
     *    Objects.isSomething(false)      // true
     *    Objects.isSomething('')         // true
     *    Objects.isSomething({})         // true
     *    Objects.isSomething(42)         // true
     *    Objects.isSomething({x: 42})    // true
     */
    static isSomething(obj) {
        return obj !== null && obj !== undefined;
    }

    /**
     * Checks for being undefined or null.
     *
     * @param {any} obj
     *    The value to be checked
     *
     * @return {boolean}
     *    true if obj is null or undefined, otherwise false
     *
     * @example
     *    Objects.isNothing(undefined)  // true
     *    Objects.isNothing(null)       // true
     *    Objects.isNothing(0)          // false
     *    Objects.isNothing(false)      // false
     *    Objects.isNothing('')         // false
     *    Objects.isNothing({})         // false
     *    Objects.isNothing(42)          // false
     *    Objects.isNothing({x: 42})    // false
     */
    static isNothing(obj) {
        return obj === null || obj === undefined;
    }

    /**
     * Converts a value to a string by using the toString method.
     *
     * @param {any} obj
     *    The value to be converted
     *
     * @return {string}
     *    The string representation of the value
     *
     * @example
     *    Objects.asString(undefined)         // ''
     *    Objects.asString(null)              // ''
     *    Objects.asString(42)                // '42'
     *    Objects.asString(true)              // 'true'
     *    Objects.asString(false)             // 'false'
     *    Objects.asString({toString: 'abc'}) // 'abc'
     *    Objects.asString('  some text  ')   // '  some text  '
     */
    static asString(obj) {
        var ret;

        if (obj === undefined || obj === null) {
            ret = '';
        } else if (typeof obj === 'string') {
            ret = obj;
        } else {
            ret = obj.toString();

            if (typeof ret !== 'string') {
                // Normally in this case the JavaScript engine should return undefined.
                // Nevertheless, to play save, we handle all cases here.
                if (ret === undefined || ret === null) {
                    ret = '';
                } else {
                    ret = '' + ret;
                }
            }
        }

        return ret;
    }

    /**
     * Creates a shallow copy of a given object 'obj'.
     * If 'obj' is not a real object or frozen or an immutable
     * collection of Facebook's Immutable library or a ClojureScript
     * persistent collection then the input argument will be returned as is.
     *
     * @param {any} obj
     *    The object to be copied
     *
     * @return {any}
     *    A shallow copy of the input object or the unmodified input in case
     *    of an immutable value.
     *
     * @example
     *    Objects.shallowCopy(undefined)                                // undefined
     *    Objects.shallowCopy(null)                                     // null
     *    Objects.shallowCopy('some text')                              // 'some text'
     *    Objects.shallowCopy(() => whatever())                         // () => whatever()
     *    Objects.shallowCopy({a: 1, b: {c: 2, d: 3})                   // {a: 1, b: {c: 2, d: 3}
     *    someMutableObject === Objects.shallowCopy(someMutableObject)  // false
     */
    static shallowCopy(obj) {
        var ret;

        if (Array.isArray(obj)) {
            ret = obj.concat();
        } else if (obj && typeof obj === 'object') {
            if ((Object.isFrozen(obj) && Object.isSealed(obj))
                    || (typeof Immutable === 'object' && Immutable && obj instanceof Immutable.Collection)
                    || (typeof cljs === 'object' && cljs && cljs.coll_QMARK_(obj))) {
                ret = obj;
            } else {
                ret = Object.create(obj.constructor);

                for (let propName of Object.getOwnPropertyNames(obj)) {
                    ret[propName] = obj[propName];
                }
            }
        } else {
            ret = obj;
        }

        return ret;
    }


    static transform(obj, transformationPlan) {
        var ret;

        if (transformationPlan === null || typeof transformationPlan !== 'object') {
            console.error('Illegal transformation plan: ', transformationPlan);
            throw new TypeError(`[Objects.transform] Second argument 'transformationPlan' must be an object`);
        }

        try {
            ret = Transformer.transform(obj, transformationPlan);
        } catch (errorMsg) {
            if (typeof errorMsg === 'string') {
                throw new TypeError('[Objects.transform] ' + errorMsg);
            } else {
                // This should never happen!
                throw errorMsg;
            }
        }

        return ret;
    }
}

class Transformer {
    static transform(obj, plan) {
        return Transformer.__transformPlainJS(obj, plan);
    }

    static __transformPlainJS(obj, plan) {
        const
            keys = Object.getOwnPropertyNames(plan);

        var ret = null;

        for (let key of keys) {
            const value = plan[key];

            if (key.startsWith('$')) {
                var modifier = Transformer['__' + key];

                if (!modifier) {
                    console.error('Illegal transformation plan: ', plan);
                    throw `Illegal modifier '${key}'`;
                } else if (keys.length > 1) {
                    throw new `[Transformator#tranform] Modifier '${key}' illegally mixed with other keys`;
                }

                ret = modifier(obj, value);
            } else {
                if (!value || typeof value !== 'object') {
                    console.error('Illegal transformation plan: ', plan);
                    throw `Illegal transformation plan for key '${key}': ${value}`;
                }

                const newObj = Transformer.transform(obj[key], value);

                if (newObj !== obj[key]) {
                    if (Array.isArray(obj) && (isNaN(key) || key.toString() !== '' + parseInt(key, 10))) {
                        console.error('Illegal transformation plan: ', plan);
                        throw 'Illegal array key: ' + key;
                    }

                    ret = ret || Objects.shallowCopy(obj);
                    ret[key] = newObj;
                }
            }
        }

        return ret;
    }

    static __isImmutable(obj) {
        return (obj === null || typeof obj !== 'object' || typeof Immutable === 'object' && obj instanceof Immutable.Collection);
    }

    static __$set(obj, value) {
        return value;
    }

    static __$append(obj, args) {
        var ret;

        if (!Array.isArray(obj)) {
            throw 'Modifier $append can only be applied on an array';
        }

        ret = obj.concat([args]);

        return ret;
    }

    static __$appendMany(obj, args) {
        var ret;

        if (!Array.isArray(obj)) {
            throw 'Modifier $appendMany can only be applied on an array';
        }

        ret = Array.isArray(value) ? obj.concat(args) : obj.concat([args]);

        return ret;
    }

    static __$slice(obj, args) {
        var ret;

        if (!Array.isArray(obj)) {
            throw 'Modifier $slice can only be applied on an array';
        } else if (isNaN(args) && (!Array.isArray(args) || args.length > 2)) {
            throw `Illegal argument for modifier $slice: ${args}`;
        }

        ret = isNaN(args) ? obj.slice(...args) : obj.slice(args);

        return ret;
    }

    static __$splice(obj, args) {
        var ret, arrayOfArgsArrays;

        if (!Array.isArray(obj)) {
           throw 'Modifier $splice can only be applied on an array';
        }

        if (Array.isArray(args) && Array.isArray(args[0])) {
            for (let arr of args) {
                if (!Array.isArray(arr)) {
                    throw 'Illegal argument for modifier $splice';
                }
            }

            arrayOfArgsArrays = args;
        } else {
            arrayOfArgsArrays = [args];
        }

        ret = obj.concat();

        for (let argArray of arrayOfArgsArrays) {
            ret.splice(...argArray);
        }

        return ret;
    }

    static __$prepend(obj, args) {
        var ret;

        if (!Array.isArray(obj)) {
            throw 'Modifier $prepend can only be applied on an array';
        }

        ret = obj.concat();
        ret.unshift(args);

        return ret;
    }

    static __$prependMany(obj, args) {
        var ret;

        if (!Array.isArray(obj)) {
            throw 'Modifier $prependMany can only be applied on an array';
        }

        ret = obj.concat();
        Array.isArray(args) ? ret.unshift(...args) : ret.unshift(args);

        return ret;
    }

    static __$filter(obj, args) {
        var ret = null;

        if (!Array.isArray(obj)) {
            throw 'Modifier $filter can only be applied on an array';
        } else if (isNaN(args) && typeof args !== 'function' && (!Array.isArray(args) || args.some(isNaN))) {
            throw 'Illegal arguments for  modifier $filter';
        }

        if (typeof args === 'function') {
            ret = obj.filter(args);
        } else {
            const length = obj.length;

            for (let index of args) {
                if (index < 0 && length + index >= 0) {
                    ret = ret || [];
                    ret.push(obj[length + index]);
                } else if (index >= 0 && index < length) {
                    ret = ret || [];
                    ret.push(obj[index])
                }
            }
            ret = obj.filter((item, index) => !args.includes(index));
        }

        return ret;
    }

    static __$remove(obj, args) {
        var ret = null;

        if (!Array.isArray(obj)) {
            throw 'Modifier $remove can only be applied on an array';
        } else if (isNaN(args) && typeof args !== 'function' && (!Array.isArray(args) || args.some(isNaN))) {
            throw 'Illegal arguments for  modifier $remove';
        }

        if (typeof args === 'function') {
            ret = obj.filter((item, index) => !args(item, index));
        } else {
            const
                length = obj.length,
                argsArray = isNaN(args) ? args : [args];

            for (let index of argsArray) {
                if (index < 0 && length + index >= 0) {
                    ret = ret || obj.concat();
                    ret.splice(length + index, 1);
                } else if (index >= 0 && index < length) {
                    ret = ret || obj.concat();
                    ret.splice(index, 1);
                }
            }

            ret = obj.filter((item, index) => !args.includes(index));
        }

        return ret;
    }

    static __$map(obj, args) {
        var ret = null;

        if (!Array.isArray(obj)) {
            throw 'Modifier $map can only be applied on an array';
        } else if (typeof args !== 'function' && (args === null  || typeof args !== 'object')) {
            throw 'Argument of $map must be a function or an transformation plan';
        }

        if (typeof args === 'function') {
            ret = obj.map(args);
        } else {
            ret = obj.map(v => Transformer.transform(v, args));
        }

        return ret;
    }


    static __$update(obj, f) {
        var ret;

        if (typeof f === 'function') {
            if (!Transformer.__isImmutable(obj)) {
                throw 'Modifier $update must can only be applied on an immutable';
            }

            ret = f(obj);

            if (!Transformer.__isImmutable(ret)) {
                throw 'Modifier $update must return something immutable';
            }
        } else {
            ret = Transformer.transform(obj, f);
        }

        return ret;
    }
}

// Helper functions

function isFBIterable (obj) {
    return obj
            && typeof obj.toEntrySeq === 'function';
}
