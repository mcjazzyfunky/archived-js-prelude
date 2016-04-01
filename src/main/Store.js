'use strict';

import Storage from './Storage.js';

export default class Store {
    constructor(storage) {
        if (!(storage instanceof Storage)) {
            throw new TypeError(
                "[Store.constructor] First argument 'storeMgr' must must be a StroreMgr");
        }


        this.__mgr = storage;

        this.__modificationEvents = storage.modificationEvents.map(event => ({
            type: 'modification'
        }));
    }

    get modificationEvents() {
        return this.__mgr.modificationEvents;
    }

    get notificationEvents() {
        return this.__mgr.notificationEvents;
    }

    createSnapshot() {
        const
            mgrClone = Object.create(Object.getPrototypeOf(this.__mgr)),
            snapshot = Object.create(Object.getPrototypeOf(this));

        snapshot.__mgr = mgrClone;
        mgrClone.__state = this.__mgr.__state;
        mgrClone.__oldState = undefined;

        return snapshot;
    }
}

/*
import Config from './Config.js';
import ConfigError from './ConfigError.js';
import EventStream from './EventStream.js';
import EventSubject from './EventSubject.js';
import Functions from './Functions.js';
import Strings from './Strings.js';

const METHOD_NAME_REGEX = /^[a-z][a-zA-Z0-9]*$/;

export default class Store {
    constructor() {
        throw new Error(
            '[Store.constructor] Store.constructor is not callable - '
            + "please use 'Store.create', 'Store.createClass' "
            + "or 'Store.createFactory' instead");
    }

    get modificationEvents() {
        return this.__master.modificationEvents;
    }

    get notificationEvents() {
        return this.__master.notificationEvents;
    }

    createSnapshot() {
        const ret = Object.create(this);
const state = this
        ret.__master = Object.create(ret.__master);
ret.__master.state = Object.assign({}, state);


ret.__master.proxy = new ret.__master.proxy.__proxyClass(ret.__master)
        Object.freeze(ret);

        return ret;

    }


    static createClass(spec) {
        if (spec === null || typeof spec !== 'object') {
            throw new TypeError(
                "[Store.createClass] First argument 'spec' must be an object");
        }

        const storeClass = function (params, actionEvents, disposal = null) {
            if (params !== undefined && params !== null && typeof params !== 'object') {
                throw new TypeError(
                    "[Store.constructor] First argument 'params' for "
                    + 'store contructor has to be an object, null or undefined');
            } else if (EventStream.isNonSequableStreamable(actionEvents)) {
                throw new TypeError(
                    "[Store.constructor] Second argument 'actionEvents' has to be "
                    + 'a non-sequable streamable');
            } else if (disposal !== undefined && disposal !== null
                && !(disposal instanceof Promise)) {

                throw new TypeError(
                    "[Store.constructor] Third argument 'disposal' has to be "
                    + 'a promise object, null or undefined');
            }

            this.__master = new storeClass.__masterClass(params);

            EventStream.from(actionEvents)
                .subscribe(actionEvent => this.__master.dispatch(actionEvent));

            if (disposal) {
                disposal.then(_ => {
                    this.__master.dispose();
                });
            }
        };

        storeClass.prototype = Object.create(Store);

        storeClass.__masterClass = createMasterClass(spec);
        storeClass.__proxyClass = createProxyClass(storeClass.__masterClass);
        storeClass.__controllerClass = createControllerClass(storeClass.__masterClass);

        const
            proto = Object.create(Store.prototype);

        for (let key of storeClass.__masterClass.getterNames) {
            proto[key] = function (...args) {
                return this.__master[key](...args);
            };
        }

        for (let key of storeClass.__masterClass.actionNames) {
            proto[key] = function (...args) {
                return this.__master[key](...args);
            };
        }

        storeClass.prototype = proto;

        return storeClass;
    }

    static create(spec, params, actionEvents, disposal = null) {
        const storeClass = this.createClass(spec);

        return new storeClass(params, actionEvents, disposal);
    }

    static createFacets(spec, params = null) {
        return Store.createFacetsFactory(spec)(params);
    }

    static createFacetsFactory(spec) {
        const
            typeOfSpec = typeof spec,
            specIsFunction = typeOfSpec === 'function';

        if (!(specIsFunction && typeOfSpec.constructor instanceof Store && spec !== Store)
            && !(spec !== null && typeOfSpec === 'object')) {

            throw new TypeError(
                "[Store.createFactory] First argument 'spec' must either "
                + 'be a subclass of Store or an object');
        }

        const storeClass = specIsFunction ? spec : Store.createClass(spec);

        const factory = params => {
            const
                master = new storeClass.__masterClass(params),
                store = Object.create(storeClass.prototype),
                controller = new storeClass.__controllerClass(master);

            store.__master = master;

            return {
                store,
                controller,
                storeClass,

                dispatch(actionName, payload) {
                    master.dispatch(actionName, payload);
                },

                dispose() {
                    master.dispose();
                }
            };
        };

        factory.storeClass = storeClass;

        return Object.freeze(factory);
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
                modificationSubject = new EventSubject(),
                notificationSubject = new EventSubject();


            if (params !== undefined && params !== null && typeof params !== 'object') {
                throw new LocalTypeError('Store parameters must be provided as object');
            }

            this.params = Object.freeze(Object.assign({}, defaultParams, params));
            this.proxy = new ret.Proxy(this);
            this.modificationEvents = modificationSubject.asEventStream();
            this.notificationEvents = notificationSubject.asEventStream();

            let
                state = initialState,
                modificationEventTimeoutId = null;

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

                    if (!modificationEventTimeoutId) {
                        modificationEventTimeoutId = setTimeout(() => {
                            modificationEventTimeoutId = null;

                            modificationSubject.next({
                                type: 'modification'
                            });
                        }, 0);
                    }
                },

                enumerable: true
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

function createProxyClass(masterClass) {
    const
        proto = Object.create(Store.prototype),

        ret = function (master) {
            this.__master = master;
            this.__proxyClass = ret;
            this.params = master.params;


            Object.defineProperty(this, 'state', {
                get() {
                    return this.__master.state;
                },

                enumerable: true
            });

            Object.defineProperty(this, 'modificationEvents', {
                get() {
                   throw new Error(
                       "[Store] It's not allowed to access property 'modificationEvents' "
                       + 'from the current context');
                },

                enumerable: true
            });

            Object.defineProperty(this, 'notificationEvents', {
                get() {
                   throw new Error(
                       "[Store] It's not allowed to access property 'notificationEvents'"
                       + 'from the current context');
                },

                enumerable: true
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

    for (let key of masterClass.getterNames) {
        proto[key] = function (...args) {
            return this.proxy[key](...args);
        };
    }

    ret.prototype = proto;
    return ret;
}

function createControllerClass(masterClass) {
    const
        proto = Object.create(Store.prototype),

        ret = function(master) {
            this.__master = master;
            Object.freeze(this);
        };

    for (let key of masterClass.getterNames) {
        proto[key] = function (...args) {
            return this.__master[key](...args);
        };
    }

    for (let key of masterClass.actionNames) {
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
*/