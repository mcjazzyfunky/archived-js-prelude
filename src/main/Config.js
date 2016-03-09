'use strict';

import Objects from './Objects.js';
import Seq from './Seq.js';

export default class Config {
    constructor(obj, config) { 
        if (obj === null || typeof obj !== 'object') {
            throw new TypeError(
                "[Config.constructor] First argument 'obj' has to be an object");
        } else if (
            config
            && config.rootPath !== undefined
            && config.rootPath !== null && !Array.isArray(config.rootPath)) {
            
            throw new TypeError(
                "[Config.constructor] Property 'rootPath' of second argument "
                + "'config' has to be an array or undefined or null");
        } else if (
            config 
            && config.contextName !== undefined
            && config.contextName !== null
            && typeof config.contextName !== 'string') {
            
            throw new TypeError("[Config.constructor] Property 'contextName' of second argument 'config' "
                + 'has to be a string or undefined or null');
        } else if (obj instanceof Config) {
            obj = obj.__Config;
        } else {
            this.__Config = obj;
        }

        this.__rootPath = (config && config.rootPath) || null;
        this.__contextName = (config && config.contextName) || null;
    }

    get(path, defaultValue = undefined) {
        const
            pathIsString = typeof path === 'string',
            pathIsArray = (!pathIsString && Array.isArray(path));
            
        if (!pathIsString &&  !pathIsArray) {
            throw new TypeError(
                `[Config:get] First parameter 'path' has to be a string or an array (invalid path: ${path})`);
        }
        
        let ret = Objects.getIn(this.__Config, pathIsArray ? path : [path]);
        
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


function error(Config, path, message) {
    const
        messagePrefix =
            Config.contextName
            ? Config.contextName + ': '
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

function errorMissingValue(Config, path) {
    return error(this, path, 'Mandatory value not available');
}

// @throws Error
function getConstrainedValue(Config, path, defaultValue = undefined, rule = null, validator = null, converter = null) {
    // Parameters are fine - no need to validate them
    
    let ret;
    
    const value = Config.get(path, defaultValue);
        
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
