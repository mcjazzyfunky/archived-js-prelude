'use strict';


export default class Types {
    /**
     * Will throw exception if someone tries to instantiate this utility class.
     *
     * @ignore
     */
    construct() {
        throw '[Types] Class is not instantiable';
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
     *    Types.isSomething(undefined)  // false
     *    Types.isSomething(null)       // false
     *    Types.isSomething(0)          // true
     *    Types.isSomething(false)      // true
     *    Types.isSomething('')         // true
     *    Types.isSomething({})         // true
     *    Types.isSomething(42)         // true
     *    Types.isSomething({x: 42})    // true
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
     *    Types.isNothing(undefined)  // true
     *    Types.isNothing(null)       // true
     *    Types.isNothing(0)          // false
     *    Types.isNothing(false)      // false
     *    Types.isNothing('')         // false
     *    Types.isNothing({})         // false
     *    Types.isNothing(42)         // false
     *    Types.isNothing({x: 42})    // false
     */
    static isNothing(obj) {
        return obj === null || obj === undefined;
    }
    
    /**
     * Will return a proper string representation for debugging purposes.
     *
     * @ignore
     */
    static toString() {
        return 'Types/class';
    }
}