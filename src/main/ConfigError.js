'use strict';

export default class ConfigError extends Error {
    constructor(message) {
        super(message);
        
        if (typeof message !== 'string') {
            throw new TypeError("[ConfigError.constructor] First argument 'message' must be a string");
        }
    }
}