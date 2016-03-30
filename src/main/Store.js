'use strict';

import Config from './Config.js';
import ConfigError from './ConfigError.js';
import Functions from './Functions.js';
import EventSubject from './EventSubject.js';
import Strings from './Strings.js';

const METHOD_NAME_REGEX = /^[a-z][a-zA-Z0-9]*$/;

export default class Store {
    // updateEvents;

    // notificationEvents;

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
            const
                updateSubject = new EventSubject(),
                notificationSubject = new EventSubject();


            if (params !== undefined && params !== null && typeof params !== 'object') {
                throw new LocalTypeError('Store parameters must be provided as object');
            }

            this.params = Object.freeze(Object.assign({}, defaultParams, params));
            this.proxy = new ret.Proxy(this);
            this.updateEvents = updateSubject.asEventStream();
            this.notificationEvents = notificationSubject.asEventStream();

            let
                state = initialState,
                sendingUpdateTimeoutId = null;

            if (typeof initialState === 'function') {
                state = initialState.call(this.proxy);
            }

            if (state === undefined) {
                state = null;
            }

            Object.defineProperty(this, 'state', {
                get() {
                    return state;
                },

                set(newState) {
                    state = newState;

                    if (!sendingUpdateTimeoutId) {
                        sendingUpdateTimeoutId = setTimeout(() => {
                            sendingUpdateTimeoutId = null;

                            updateSubject.next({
                                type: 'update'
                            });
                        }, 0);
                    }
                }
            });

            this.notify = notification => {
                setTimeout(() => {
                    notificationSubject.next(notification);
                }, 0);
            };
        };

        const
            proto = ret.prototype;

        for (let getterName of getterNames) {
            if (getterName === 'state' || getterName === 'params' || proto[getterName] !== undefined) {
                throw new LocalError(`Getter name '${getterName}' is not allowed`);
            }
            const method = gettersConfig.getFunction(getterName);

            proto[getterName] = function (...args) {
                return method.apply(this.proxy, args);
            };
        }

        for (let actionName of actionNames) {
            const method = actionsConfig.getFunction(actionName);

            proto[actionName] = buildActionMethod(method);
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
            this.params = master.params;


            Object.defineProperty(this, 'state', {
                get() {
                    return this.__master.state;
                }
            });

            Object.defineProperty(this, 'updateEvents', {
                get() {
                   throw new Error(
                       "[Store] It's not allowed to access property 'updateEvents' "
                       + 'from the current context');
                }
            });

            Object.defineProperty(this, 'notificationEvents', {
                get() {
                   throw new Error(
                       "[Store] It's not allowed to access property 'notificationEvents'"
                       + 'from the current context');
                }
            });

            this.notify = notification => {
                if (false) {
                    throw new Error(
                        "[Store] It's not allowed to access function 'notify'"
                        + 'from the current context');
                }

                this.__master.notify(notification);
            };

            Object.freeze(this);
        };

    for (let key of MasterClass.getterNames) {
        proto[key] = function (...args) {
            return this.proxy[key](...args);
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
            this.updateEvents = master.updateEvents;
            this.notificationEvents = master.notificationEvents;
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
            this.updateEvents = master.updateEvents;
            this.notificationEvents = master.notificationEvents;
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

function buildActionMethod(fn) {
    let ret;

    if (!Functions.isGeneratorFunction(fn)) {
        ret = function (...args) {
            let ret2;

            const
                master = this,
                result = fn.apply(this.proxy, args);

            if (result instanceof Promise) {
                ret2 = new Promise(function (resolve, reject) {
                    result.then(function (newState) {
                        if (newState !== undefined && master.state !== newState) {
                            master.state = newState;
                            setTimeout(() => resolve(true), 0);
                        } else {
                            setTimeout(() => resolve(false), 0);
                        }
                    })
                    .catch(err => reject(err));
                });
            } else if (result !== null) {
                let stateHasChanged = false;

                if (master.state !== result) {
                    master.state = result;
                    stateHasChanged = true;
                }

                ret2 = new Promise((resolve, reject) => {
                    setTimeout(() => resolve(stateHasChanged));
                });
            }

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
