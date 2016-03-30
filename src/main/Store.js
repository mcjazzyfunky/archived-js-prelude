'use strict';

import Config from './Config.js';
import ConfigError from './ConfigError.js';
import Functions from './Functions.js';
import EventSubject from './EventSubject.js';
import Strings from './Strings.js';

const METHOD_NAME_REGEX = /^[a-z][a-zA-Z0-9]*$/;

export default class Store {
    /**
     * @ignore
     */
    constructor() {
        throw new Error(
            '[Store.constructor] Constructor is private - '
            + "please use 'Store.create' or 'Store.createFactory' instead");
    }

    static create(spec, params) {
        return Store.createFactory(spec)();
    }

    static createFactory(spec, params = null) {
        if (spec === null || typeof spec !== 'object') {
            throw new TypeError(
                "[Store.createFactory] First argument 'spec' "
                + 'must be an object');
        }

        const
            MasterClass = createMasterClass(spec),
            StoreClass = createStoreClass(MasterClass),
            ControllerClass = createControllerClass(MasterClass);

        return params => {
            if (params !== undefined && params !== null && typeof params !== 'object') {
                throw new TypeError(
                    "[Store.createFactory] First argument 'params' of "
                    + 'store factory invocation has to be an object, null or undefined');
            }

            const
                master = new MasterClass(params),
                store = new StoreClass(master),
                controller = new ControllerClass(master);

            return {
                store,
                controller,

                dispatch(actionName, payload) {
                    master.dispatch(actionName, payload);
                },

                dispose() {
                    master.dispose();
                }
            };
        };
    }
}

function createMasterClass(spec) {
    let ret;

    const config = new Config(spec);

    try {
        const
            defaultParams = config.getObject('defaultParams', null),
            initialState = config.get('initialState', null),

            gettersConfig = config.getConfig('getters', null),
            actionsConfig = config.getConfig('actions', null),

            getterNames = gettersConfig ? gettersConfig.keys(METHOD_NAME_REGEX) : [],
            actionNames = actionsConfig ? actionsConfig.keys(METHOD_NAME_REGEX) : [];

        ret = function (params) {
            if (params !== undefined && params !== null && typeof params !== 'object') {
                throw new LocalTypeError('Store parameters must be provided as object');
            }

            this.__params = Object.freeze(Object.assign({}, defaultParams, params));
            this.__proxy = new ret.Proxy(this);
            this.__state = null;

            if (typeof initialState === 'function') {
                const state = initialState.call(this.__proxy);

                this.__state = state === undefined ? null : state;
            } else {
                this.__state = initialState;
            }
        };

        const
            proto = ret.prototype;

        for (let getterName of getterNames) {
            if (getterName === 'state' || getterName === 'params' || proto[getterName] !== undefined) {
                throw new LocalError(`Getter name '${getterName}' is not allowed`);
            }

            const method = gettersConfig.getFunction(getterName);

            proto[getterName] = function (...args) {console.log(999999)
                return method.apply(this.__proxy, args);
            };
        }

        for (let actionName of actionNames) {
            const method = actionsConfig.getFunction(actionName);
            
            proto[actionName] = buildActionMethod(function (...args) {
                console.log(7777, this.__proxy)
                return method.apply(this.__proxy, args);
            });
        }

        ret.actionNames = actionNames;
        ret.getterNames = getterNames;
        ret.Proxy = createProxyClass(ret);
    } catch(err) {
        if (err instanceof ConfigError) {
            throw new LocalError(err.message);
        } else {
            throw err;
        }
    }

    return ret;
}

function createProxyClass(MasterClass) {
    const
        proto = Object.create(Store.prototype),

        ret = function (master) {
            this.__master = master;
            this.params = master.__params;

            Object.defineProperty(this, 'state', {
                get() {
                    return this.__master.__state;
                }
            });

            Object.defineProperty(this, 'updates', {
                get() {
                   throw new Error(
                       "[Store] It's not allowed to access property 'updates' "
                       + 'from the current context');
                }
            });

            Object.defineProperty(this, 'notifications', {
                get() {
                   throw new Error(
                       "[Store] It's not allowed to access property 'notifications' "
                       + 'from the current context');
                }
            });

            Object.freeze(this);
        };

    for (let key of MasterClass.getterNames) {
        proto[key] = function (...args) {
            return this.__proxy[key](...args);
        };
    }

    ret.prototype = proto;
    return ret;
}

function createStoreClass(MasterClass) {
    const
        proto = Object.create(Store.prototype),

        ret = function(master) {
            this.__master = master;
            this.updates = master.updates;
            this.notifications = master.notifications;
            Object.freeze(this);
        };

    for (let key of MasterClass.getterNames) {
        proto[key] = function (...args) {
            return this.__master[key](...args);
        };
    }

    for (let key of MasterClass.actionNames) {
        proto[key] = function (...args) {
            return this.__master[key](...args);
        };
    }

    ret.prototype = proto;
    return ret;
}

function createControllerClass(MasterClass) {
    const
        proto = {},

        ret = function(master) {
            this.__master = master;
            this.updates = master.updates;
            this.notifications = master.notifications;
            Object.freeze(this);
        };

    for (let key of MasterClass.getterNames) {
        proto[key] = function (...args) {
            return this.__master[key](...args);
        };
    }

    for (let key of MasterClass.actionNames) {console.log('action', key)
        proto[key] = function (...args) {console.log(this.__master)
            return this.__master[key](...args);
        };
    }

    ret.prototype = proto;
    return ret;
}

function buildActionMethod(fn) {
    let ret;

    if (!Functions.isGeneratorFunction(fn)) {
        ret = function (...args) {
            let ret2;
console.log('juhuuuu')
            const result = fn.apply(this.__proxy, args);

            if (result instanceof Promise) {
                ret2 = new Promise((resolve, reject) => {
                    result.then(newState => {
                        if (newState !== undefined && this.__master.__state !== newState) {
                            this.__master.__state = newState;
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    })
                    .catch(err => reject(err));
                });
            } else if (result !== null) {
                if (this.__master.__state !== result) {
                    this.__master.__state = result;
                    ret2 = Promise.resolve(true);
                } else {
                    ret2 = Promise.resolve(false);
                }
            }
console.log(111, ret2)
            return ret2;
        };
    } else {
        throw new Error("Not implemented!"); // TODO: Implement
    }

    return ret;
}

class LocalError extends Error {
}

class LocalTypeError extends TypeError {
}

function adjustError(error, messagePrefix = null) {
    let
        ret = null,
        message = Strings.trim(Strings.asString(messagePrefix + ' ' + error));

    if (error instanceof LocalTypeError) {
        ret = new TypeError(message);
    } else if (error instanceof LocalError) {
        ret = new Error(message);
    } else {
        ret = error;
    }

    return ret;
}
