'use strict';

export default class ConfigError {
    constructor(message) {
        if (typeof message !== 'string') {
            throw new TypeError("[ConfigError.constructor] First argument 'message' must be a string");
        }
        this.__message = message;
    }
    
    getMessage() {
        return this.__message;
    }
}