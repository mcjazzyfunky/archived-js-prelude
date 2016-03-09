'use strict';

import Objects from './Objects.js';
import Seq from './Seq.js';

export default class Config {
    constructor(data, options) { 
        if (data === null || typeof data !== 'object') {
            throw new TypeError(
                "[Config.constructor] First argument 'data' has to be an object");
        } else if (
            options
            && options.rootPath !== undefined
            && options.rootPath !== null && !Array.isArray(config.rootPath)) {
            
            throw new TypeError(
                "[Config.constructor] Property 'rootPath' of second argument "
                + "'config' has to be an array or undefined or null");
        } else if (
            options 
            && options.contextName !== undefined
            && options.contextName !== null
            && typeof options.contextName !== 'string') {
            
            throw new TypeError("[Config.constructor] Property 'contextName' of second argument 'config' "
                + 'has to be a string or undefined or null');
        }
        
        this.__data = data;
        this.__rootPath = (options && options.rootPath) || null;
        this.__contextName = (options && options.contextName) || null;
    }

    get(path, defaultValue = undefined) {
        let ret;
    
        if (typeof path === 'string') {
            ret = this.__data[path];
        } else if (!Array.isArray(path)) {
            throw new TypeError(
                `[Config:get] First parameter 'path' has to be a string or an array (invalid path: ${path})`);
        } else {
            const
                pathLength = path.length;
    
            if (pathLength === 0) {
                ret = this.__data;
            } else if (pathLength === 1) {
                ret = this.__data[path[0]];
            } else {
                let parent = this.__data;
    
                for (let i = 0; i < pathLength; ++i) {
                    if (!parent) {
                        break;
                    } else {
                        parent = parent[path[i]];
    
                        if (i === pathLength - 1) {
                            ret = parent;
                        }
                    }
                }
            }
        }       
        
        if (ret === undefined) {
            if (defaultValue !== undefined) {
                ret = defaultValue;
            } else {
                throw errorMissingValue(this, path);
            }
        }

        return ret;
    }
    
    getConstrained(path, defaultValue, rule, validator = null, converter = null) {
        if (typeof rule !== 'string') {
           throw new TypeError(
               "[Config:getConstrained] Third argument 'rule' must be a string"); 
        } else if (rule.trim() === '') {
           throw new TypeError(
               "[Config:getConstrained] Third argument 'rule' must not be blank"); 
        } else if (validator !== null && typeof validator !== 'function') {
           throw new TypeError(
               "[Config:getConstrained] Fourth argument 'validator' "
               + ' must be a function or null'); 
        } else if (converter !== null && typeof converter !== 'function') {
           throw new TypeError(
               "[Config:getConstrained] Fifth argument 'converter' "
               + ' must be a function or null'); 
        }
        
        return getConstrainedValue(this, path, defaultValue, rule, validator, converter);
    }
    
    getBoolean(path, defaultValue = undefined) {
        const
            rule = "must be a boolean value or string 'true' or string 'false'" 
                + defaultValue === null ? ' or null' : '',
                
            validator = value => value === true || value === false || value === 'true' || value === 'false',
            converter = value => value === true || value === 'true';

        return getConstrainedValue(this, path, defaultValue, rule, validator, converter);
    }

    getNumber(path, defaultValue = undefined) {
        const
            rule = "must be numeric" + defaultValue === null ? ' or null' : '',
            validator = value => !isNaN(value),
            converter = value => 0 + value;

        return getConstrainedValue(this, path, defaultValue, rule, validator, converter);
    }
    
    getInteger(path, defaultValue = undefined) {
        const
            rule = "must be a integer number" + defaultValue === null ? ' or null' : '',
            validator = value => !isNaN(value),
            converter = value => Math.floor(0 + value);

        return getConstrainedValue(this, path, defaultValue, rule, validator, converter);
    }

    getString(path, defaultValue = undefined) {
        const
            rule = 'must be a string',
            validator = value => value === null || typeof value !== 'object',
            converter = value => Objects.asString(value);

        return getConstrainedValue(this, path, defaultValue, rule, validator, converter);
    };

    getStringOrNull(path) {
        return this.getString(path, null) || null;
    };

    getTrimmedString(path, defaultValue) {
        return this.getString(path, defaultValue).trim();
    };

    getTrimmedStringOrNull(path) {
        return this.getTrimmedString(path, null) || null;
    };

    getStringMatchingRegex(path, regex, defaultValue) {
        if (!(regex instanceof RegExp)) {
            throw new TypeError(
                "[Config:getStringMatchingRegex] Second argument 'regex' must be a regular expression");
        }
        
        const
            rule = 'must be a string matching regex ' + regex,

            validator = value =>
                typeof value === 'string' && value.match(regex);

        return this.getConstrainedValue(path, defaultValue, rule, validator);
    }

    getStringMatchingRegexOrNull(path, regex) {
        return this.getStringMatchingRegex(path, null)|| null;
    }
    
    getObject(path, defaultValue) {
        const
            rule = 'must be an object',

            validator = value =>
                value !== null && typeof value === 'object';

        return getConstrainedValue(this, path, defaultValue, rule, validator);
    }
    
    getArray(path, defaultValue) {
        const
            rule = 'must be an array',
            validator = Array.isArray;

        return getConstrainedValue(this, path, defaultValue, rule, validator);
    }
    
    getConfig(path) {
        const
            rule = 'must be an object or undefined or null',
            validator = value => typeof value === 'object',
            converter = value => new Config(path);

        return getConstrainedValue(this, path, null, rule, validator, converter);
    }

    toString() {
        return '<instance of Config>';
    }

    static from(obj) {
        if (obj === null || typeof obj !== 'object') {
            throw new TypeError("[Config.from] First argument 'obj' must be an object");
        }

        return (obj instanceof Config)
                ? obj
                : new Config(obj);
    }

    static toString() {
        return 'Config:class';
    }
}


function error(config, path, message) {
    const
        messagePrefix =
            config.__contextName
            ? config.__contextName + ': '
            : '',
    
        escapeKey = token =>
            String(token)
                .replace('\\', '\\\\')
                .replace('|', '\\|')
                .replace("'", "\\'");
        
    let pathInfo;
    
    if (typeof path === 'string') {
        pathInfo = escapeKey(path);
    } else {
        pathInfo = path.map(escapeKey).join('|');
    }

    return new Error(`${messagePrefix}Erroneous attribute '${pathInfo}' (${message})`);
}

function errorMissingValue(config, path) {
    return error(config, path, 'Mandatory value not available');
}

// @throws Error
function getConstrainedValue(config, path, defaultValue = undefined, rule = null, validator = null, converter = null) {
    // Parameters are fine - no need to validate them
    
    let ret;
    
    const value = config.get(path, defaultValue);
        
    if (value === defaultValue) {
        ret = defaultValue;
    } else {
        if (validator && !validator(value)) {
            if (rule) {
                throw error(this, path, "Invalid value - " + rule + "!");
            } else {
                throw error(this, path, 'Invalid value');
            }
        }

        ret = (converter ? converter(value) : value);
    }

    return ret;        
}
