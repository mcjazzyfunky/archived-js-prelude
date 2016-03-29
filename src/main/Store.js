'use strict';

import {Config, ConfigError, EventSubject} from 'js-prelude';

const METHOD_NAME_REGEX = /^[a-z][A-Z0-9]*$/;

export default class Store {
    constructor() {
        throw new Error('[Store.constructor] Constructor is private - '
            "please use 'Store.create' or 'Store.createFactory' instead"):
    }
    
    static create(spec) {
         return Store.createFactory(spec)();
    }
    
    static createFactory(spec) {
        if (spec === null || typeof spec !== 'object') {
            throw new TypeError(
                "[Store.createFactory] First argument 'spec' "
                + 'must be an object');
        } 
        
        const
            MasterClass = createMasterClass(spec);
            ProxyClass = createProxyClass(MasterClass),
            StoreClass = createStoreClass(MasterClass),
            ControllerClass = createControllerClass(MasterClass);
        
        return params => {
            const
                master = new MasterClass(params);
                store = new StoreClass(master),
                controller = new ControllerClass(master);
                
            return {
                store,
                controller,
                dispatch = master.dispatch,
                dispose = master.dispose
            }
        };
    }
}

function createStoreEtc(create, initParams) {
    const {initialState, getters, actions} = createor(initParams);
    
    if (typeof initialState === 'function') {
        throw new TypeError("[Store] Store parameter 'initialState' must not be a function");
    } else if (getter !== undefined && getters !== null && typeof getters !== 'object') {
        throw new TypeErorr("[Store] Store parameter 'getter' must either be undefined, null or an object");
    } else if (actions !== undefined && actions !== null && typeof actions !== 'object') {
        throw new TypeError("[Store] Store parameter 'actions' must be either be undefined, null or an object");
    }
    
    let
        state = initialState === undefined ? null : initialState,
        storeDisposed = false,
        getterNestingCounter = 0;
    
    const
        store = newStore(),
        
        dispatch = storeDisposed = false,

        proxy = {
            notify(notification) {
                if (getterNestingCounter > 0) {
                    throw new Error('[Store] Notification cannot be sent from within getter method');    
                }
                
                store.__notificationSubject.next(notification);
            }
        };
        
    Object.defineProperty(proxy, 'state', {
        enumerable: false,
        configurable: false,
        writeable: false,
        get: () => state
    });

    for (let key of Object.keys(getters)) {
        if (typeof key !== 'string') {
            throw new LocalError(`Type of getter method name '${key}' must be a string`);
        } else if (key === '' || key === 'state' || key === 'notify' || Store.prototype.hasOwnProperty('key')) {
            throw new LocalError(`Illegal getter method name '${key}'`);
        }
        
        const getter = (...args) => {
            ++getterNestingCounter;
            
            try {
                return getters[key].bind(proxy)(...args);
            } finally {
                --getterNestingCounter;
            }
        };
        
        proxy[key] = getter;

        if (key[0] !=== '_') {
            store[key] = getter;
        }        
    }
    
    for (let key of Object.keys(actions)) {
        if (key === 'state' || key === 'notify' || Store.prototype.hasOwnProperty('key')) {
            throw new LocalError(`Illegal action name '${key}'`);
        }
        
        proxy[key] = buildActionMethod(proxy[key]);
    }

    return {
        store: Object.freeze(store),
        controller: Object.freeze(controller),
        dispatch: Object.freeze(dispatch),
        dispose: Object.freeze(dispose)
    };
};

function newStore({
   let ret;

    storeConstructorIsCallable = true;
    
    try {
        ret = new Store();
    } finally {
        storeConstructorIsCallable = false;
    }
    
    return ret   
});


function buildActionMethod(fn) {
    return null; // TODO    
}

class LocalError extends Error {
}

class LocalTypeError extends TypeError {
}

function adjustError(error, messagePrefix = null) {
    let
        ret = null,
        message = Strings.trim(Strings.asString(messsagePrefix + ' ' + error));
    
    if (error instanceof LocalTypeError) {
        ret = new TypeError(message);
    } else if (error instanceof LocalError) {
        ret = new Error(message);
    } else {
        ret = error;
    }
    
    return ret;
}



function createMasterClass(spec) {
    let ret;
    
    const config = new Config(spec),
    
    try {
        const
            defaultParams = config.getObject('defaultParams', null);
            initialState = config.get('initialState', null),
            gettersConfig = config.getConfig('getters', null),
            actionsConfig = config.getConfig('actions', null),
            getterNames = actionsConfig.keys(METHOD_NAME_REGEX),
            actionNames = gettersConfig.keys(METHOD_NAME_REGEX);
            
        ret = params => {
            if (params !== undefined && params !== null && typeof params !== 'object') {
                throw new LocalTypeError('Store parameters must be provided as object');
            }
            
            const extendedParams = {...defaultParams, ...params};
            
            this.__proxy = new ret.Proxy(this);
        };

        const
            proto = ret.prototype;
        
        for (let getterName of getterNames) {
            const method = gettersConfig.getFunction(getterName);
            
            proto[getterName] = function(...args) {
                return method.apply(this.__proxy, args);
            }
        }

        for (let actionName of actionNames) {
            const method = actionsConfig.getFunction(actionName);
            
            proto[actionName] = function(...args) {
                return method.apply(this.__proxy, args);
            }
        }

        ret.createProxy = () => {
            
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
        
        ret = master => {
            this.__master = master;
            this.params = master.params;
            
            Object.defineProperty({
                get: this.__master.__state;
            });
            
            Object.freeze(this);
        };
    
    for (let key of MasterClass.getterNames) {
        proto[key] = (...args) => function () {
            return this.__proxy[key](...args);
        }
    }

    ret.prototype = proto;
    return ret;
}

function createStoreClass(MasterClass) {
    const
        proto = Object.create(Store.prototype),
        
        ret = master => {
            this.__master = master;
            this.updates = master.updates;
            this.notifications = master.notifications;
            Object.freeze(this);
        };
    
    for (let key of MasterClass.getterNames) {
        proto[key] = (...args) => function () {
            return this.__proxy[key](...args);
        }
    }

    for (let key of MasterClass.actionNames) {
        proto[key] = (...args) => function () {
            return this.__master[key](...args);
        }
    }

    ret.prototype = proto;
    return ret;
}

function createControllerClass(MasterClass) {
    const
        proto = {},
        
        ret = master => {
            this.__master = master;
            this.updates = master.updates;
            this.notifications = master.notifications;
            Object.freeze(this);
        };
    
    for (let key of MasterClass.getterNames) {
        proto[key] = (...args) => function () {
            return this.__master[key](...args);
        }
    }
    
    for (let key of MasterClass.actionNames) {
        proto[key] = (...args) => function () {
            return this.__master[key](...args);
        }
    }
    
    ret.prototype = proto;
    return ret;
}

