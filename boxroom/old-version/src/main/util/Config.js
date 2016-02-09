/*global mojo */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util,
        defaultDummy = {},
        throwConfigException;

    util.Config = function (data, configName) {
        if (data === null || typeof data !== 'object') {
            data = {};
        }

        this._data = data;
        this._configName = util.StringUtils.trim(configName);
        this._basePath = '';
    };
    
    util.Config.toString = function () {
        return '<mojo.util.Config>';
    }

    /**
     * Returns a string parameter by a given configuration path.
     *
     * @function
     * @name mojo.util.Config#getValue
     * @param {string} path
     *         Configuration path
     * @param {mixed}    defaultValue
     *         Default value
     */
    util.Config.prototype.getValue = function (path, defaultValue) {
        var ret = this._data,
            tokens,
            token,
            okay,
            i;
        
        path = util.StringUtils.trim(path);

        if (path !== '') {
            tokens = path.split('.');
            okay = true;

            for (i = 0; i < tokens.length; ++i) {
                token = tokens[i];

                if (typeof ret === 'object' && ret !== null && ret.hasOwnProperty(token) && token in ret) {
                    ret = ret[token];
                } else {
                    if (typeof defaultValue !== 'undefined') {
                        ret = defaultValue;
                        break;
                    } else {
                        throwConfigException(this, path, "Mandatory value missing");
                    }
                }
            }
        }

        return ret;
    };

    util.Config.prototype.getString = function (path, defaultValue) {
        var constraintName = 'String',
            validator = function (value) {return util.TypeUtils.isScalarOrNull(value); },
            converter = function (value) {return util.StringUtils.asString(value); };

        return this.getConstrainedValue(path, defaultValue, constraintName, validator, converter);
    };

    util.Config.prototype.getTrimmedString = function (path, defaultValue) {
        return util.StringUtils.trim(this.getString(path, defaultValue));
    };

    util.Config.prototype.getStringMatchingRegex = function (path, regex, defaultValue) {
        var constraintName = 'value that matches regex properly',
            validator;

        validator = function (value) {
            return (typeof value === 'string' && value.match(regex));
        };

        return this.getConstrainedValue(path, defaultValue, constraintName, validator);
    };

    util.Config.prototype.getBoolean = function (path, defaultValue) {
        var constraintName = 'Boolean',
            validator,
            converter;

        validator = function (value) {
            return util.TypeUtils.isScalarOrNull(value);
        };

        converter = function (value) {
            var ret = false;

            if (typeof value === 'string') {
                value = value.toLowerCase();

                if (value === '1' || value === 'true' || value === 'yes') {
                    ret = true;
                } else if (value !== '0' && value !== 'false' && value !== 'no') {
                    ret = !!value;
                }
            } else {
                ret = !!value;
            }

            return ret;
        };

        return this.getConstrainedValue(path, defaultValue, constraintName, validator, converter);
    };

    util.Config.prototype.getFloat = function (path, defaultValue) {
        var constraintName = 'Float',
            validator = function (value) {return !isNaN(value); },
            converter = function (value) {return parseFloat(value); };

        return this.getConstrainedValue(path, defaultValue, constraintName, validator, converter);
    };

    util.Config.prototype.getInteger = function (path, defaultValue) {
        var constraintName = 'Integer',
            validator = function (value) {return !isNaN(value); },
            converter = function (value) {return parseInt(value, 10); };

        return this.getConstrainedValue(path, defaultValue, constraintName, validator, converter);
    };

    util.Config.prototype.getArray = function (path, defaultValue) {
        var constraintName = 'Array',
            validator = function (value) {return util.TypeUtils.isArray(value); },
            converter = function (value) {return value; };

        return this.getConstrainedValue(path, defaultValue, constraintName, validator, converter);
    };

    util.Config.prototype.getArrayLength = function (path, defaultValue) {
        var ret,
            dummy,
            arr;

        if (typeof defaultValue === 'undefined') {
            ret = this.getArray(path).length;
        } else {
            dummy = {};
            arr = this.getArray(path, dummy);

            if (arr !== dummy) {
                ret = arr.length;
            } else {
                ret = defaultValue;
            }
        }

        return ret;
    };

    util.Config.prototype.getObject = function (path, defaultValue) {
        var constraintName = 'Object',
            validator = function (value) {return util.TypeUtils.isObject(value); },
            converter = function (value) {return value; };

        return this.getConstrainedValue(path, defaultValue, constraintName, validator, converter);
    };

    util.Config.prototype.getFunction = function (path, defaultValue) {
        var constraintName = 'Function',
            validator = function (value) {return value === defaultValue || typeof value === 'function'; }, // TODO !!!
            converter = function (value) {return value; };

        return this.getConstrainedValue(path, defaultValue, constraintName, validator, converter);
    };


    util.Config.prototype.getOption = function (path, options, defaultValue) {
        var constraintName = 'proper option value',
            converter,
            validator,
            i;

        validator = function (value) {
            var ret = false;

            for (i = 0; i < options.length; ++i) {
                if (value === options[i]) {
                    ret = true;
                    break;
                }
            }

            return ret;
        };

        converter = function (value) {return value; };
        return this.getConstrainedValue(path, defaultValue, constraintName, validator, converter);
    };

    util.Config.prototype.getPropertyNames = function (path, defaultValue) {
        var obj = (typeof defaultValue === 'undefined'
                ? this.getObject(path)
                : this.getObject(path, null));

        return (obj === null ? defaultValue : util.ObjectUtils.getOwnProperties(obj));
    };

    util.Config.prototype.getTypedValue = function (path, allowedTypes, defaultValue) {
        var dummy = (typeof defaultValue === 'undefined' ? defaultValue :    {}),
            ret = this.getValue(path, dummy);

        if (ret === dummy) {
            ret = defaultValue;
        } else if (!util.TypeUtils.isOfType(ret, allowedTypes)) {
            throwConfigException(this, path, 'Invalid type!');
        }

        return ret;
    };

    util.Config.prototype.getSubConfig = function (path, defaultValue) {
        var me = this,
            constraintName = 'Object',
            validator = function (value) {return value !== null && typeof value === 'object'; },
            converter;

        converter = function (value) {
            var ret = new util.Config(value);
            ret._configName = me._configName;

            if (me._basePath === '') {
                ret._basePath = path;
            } else {
                ret._basePath =    me.basePath + '.' + path;
            }

            return ret;
        };

        return this.getConstrainedValue(path, defaultValue, constraintName, validator, converter);
    };

    util.Config.prototype.getSubConfigs = function (path, defaultValue) {
        var ret = defaultValue,
            dummy = {},
            arr = this.getArray(path, dummy),
            i;

        if (arr === dummy) {
            if (typeof defaultValue === 'undefined') {
                throwConfigException(this, path, "Invalid type, expected 'Array of sub configs'");
            }
        } else {
            ret = [];

            for (i = 0; i < arr.length; ++i) {
                ret[ret.length] = this.getSubConfig(path + '.' + i);
            }
        }

        return ret;
    };

    util.Config.prototype.getConstrainedValue = function(path, defaultValue, constraintName, validator, converter) {
        var ret = null,
            isDefault = false,
            value,
            dummy;

        if (typeof defaultValue === 'undefined') {
            value = this.getValue(path);
        } else {
            dummy = {};
            value = this.getValue(path, dummy);

            if (value === dummy) {
                isDefault = true;
                ret = defaultValue;
            }
        }

        if (!isDefault) {
            if (!validator(value)) {
                throwConfigException(this, path, "Invalid value, expected " + constraintName + "!");
            }

            ret = (converter ? converter(value) : value);
        }

        return ret;
    };

    util.Config.prototype.getTypeOf = function (path) {
        var ret,
            dummy = {},
            value = this.getValue(path, dummy);

        if (value !== dummy) {
            ret = util.TypeUtils.getTypeOf(value);
        } else {
            ret = 'undefined';
        }

        return ret;
    };

    util.Config.prototype.merge = function (cfg) {
        var newCfg = util.ObjectUtils.copy(this._data),
            config = util.Config.of(cfg),
            ownProperties = util.ObjectUtils.getOwnProperties(config._data);

        util.Seq.of(ownProperties).forEach(function (propName) {
            newCfg[propName] = config._data[propName];
        });

        return new util.Config(newCfg);
    };

    util.Config.prototype.mapSpecificProperties = function (mappersCfg) {
        var me = this,
            ret = null,
            configOfMappers = util.Config.of(mappersCfg),
            dummy = {},
            newValue;

        mappersCfg = configOfMappers.getObject('');

        util.ObjectUtils.forEachOwnProperty(mappersCfg, function (key, mapper) {
            var configValue;

            if (ret === null) {
                ret = me.getObject('');
            }

            mapper = configOfMappers.getFunction(key);
            configValue = me.getValue(key, dummy);

            if (configValue === dummy) {
                configValue = undefined;
            }

            newValue = mapper(configValue, me);

            if (typeof newValue === 'undefined') {
                delete ret[key];
            } else {
                ret[key] = newValue;
            }
        });

        ret = util.Config.of(ret || this);
        return ret;
    };

    util.Config.prototype.getData = function () {
        return this._data;
    };

    util.Config.of = function (value) {
        var ret;

        if (value instanceof util.Config) {
            ret = value;
        } else if (value !== null && typeof value === 'object') {
            ret = new util.Config(value);
        } else {
            ret = new util.Config({});
        }

        return ret;
    };

    throwConfigException = function (config, path, message) {
        var fullPath = config._basePath,
            configNameInfo;

        if (fullPath === '') {
            fullPath = path;
        } else {
            fullPath += '.' + path;
        }

        configNameInfo = '';

        if (config._configName !== '') {
            configNameInfo = "in configuration '" + config._configName + "' ";
        }

        throw new util.ConfigException('Error ' + configNameInfo + "on parameter '" + fullPath + "': " + message);
    };
}());
