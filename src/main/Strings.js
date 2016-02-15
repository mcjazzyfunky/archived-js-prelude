'use strict';

import Objects from './Objects.js';

export default class Strings {
    /**
     * Will throw exception if someone tries to instantiate this utility class.
     *
     * @ignore
     */
    construct() {
        throw '[Strings] Class is not instantiable';
    }

    /**
     * Will return a proper string representation for debugging purposes.
     *
     * @ignore
     */
    static toString() {
        return '<utility class Strings>';
    }

   /**
     * @param {string} text
     *     The string to be trimmed
     *
     * @return {string}
     *     The trimmed string.
     *     If argument 'text' is not a string then it will be converted
     *     to a string first.
     *
     * @example
     *     Strings.trim('  some text  ')             // 'some text'
     *     Strings.trim('some text')                 // 'some text'
     *     String.trim('')                           // ''
     *     String.trim(null)                         // ''
     *     String.trim(undefined)                    // ''
     *     String.trim({toString: () => 'whatever'}) // 'whatever'
     */
    static trim(text) {
        return Objects.asString(text).trim();
    }

    /**
     * @param {string} text
     *     The string to be trimmed (possible to null).
     *
     * @return {string}
     *     The trimmed string.
     *     If argument 'text' is not a string then it will be converted
     *     to a string first, using function Objects.asString
     *
     * @example
     *     Strings.trimToNull('  some text  ')             // 'some text'
     *     Strings.trimToNull('some text')                 // 'some text'
     *     String.trim('')                                 // null
     *     String.trim(null)                               // null
     *     String.trim(undefined)                          // undefined
     *     String.trim({toString: () => '  whatever  '})   // 'whatever'
     */
    static trimToNull(text) {
        let ret = Strings.trim(text);

        if (ret.length === 0) {
            ret = null;
        }

        return ret;
    }
}