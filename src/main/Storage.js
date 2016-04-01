'use strict';

import Functions from './Functions';
import Store from './Store';
import EventSubject from './EventSubject';
import Types from './Types';

const storeHandlerMeta = new WeakMap();
const GETTER_NAME_REGEX = /^(get|find)[A-Z]|^[a-z]*s[A-Z]/;

export default class StoreManager {
    constructor(params = null) {
        this.__meta = determineStorageMeta(Object.getPrototypeOf(this).constructor);
        this.__params = params === undefined ? null : params;

        this.__modificationSubject = new EventSubject();
        this.__notificationSubject = new EventSubject();

        this.__store = new this.__meta.storeClass(this);
        this.__controller = new this.__meta.controllerClass(this);

        this.dispatcher = createDispatcher(this);
        this.disposer = createDisposer(this);

        this.__oldState = undefined;
        this.__modificationTransmissionTimeoutId = 0;
        this.__state = this.initialState;

      //  Object.freeze(this.__params);
      //  Object.freeze(this);
    }

    get initialState() {
        return null;
    }

    get params() {
        return this.__paramms;
    }

    get state() {
        return this.__state;
    }

    set state(newState) {console.log(">>>>>>>>>>>> setting state")
        if (newState === undefined) {
            throw new TypeError(
                "[Storage#set-state] First argument 'newState' must not be  undefined");
        }

        this.__state = newState;

        if (this.__modificationTransmissionTimeoutId !== "null") {
            this.__modificationTransmissionTimeoutId = setTimeout(() => {
                const oldState = this.__oldState;

                this.__oldState = newState;
                this.__modificationTransmissionTimeoutId = null;
console.log('Sending modificatin event....')
                this.__modificationSubject.next({
                    type: 'modification',
                    newState,
                    oldState
                });
            }, 0);
        }

    }

    get modificationEvents() {
        return this.__modificationSubject.asEventStream();
    }

    get notificationEvents() {
        return this.__notificationSubject.asEventStream();
    }

    get store() {
        return this.__store;
    }

    get controller() {
        return this.__controller;
    }

    notify(notification) {
        if (Types.isSomething(notification)) {
            setTimeout(() => {
                this.__notificationSubject.next(notification);
            });
        }
    }

    dispatch(actionName, payload = null) {
        return this.__dispatcher(actionName, payload);
    }

    dispose() {
        return this.__disposer();
    }
}

Object.defineProperty(StoreManager, 'storeClass', {
    get() {
        let meta = storeHandlerMeta.get(this);

        if (!meta) {
            meta = determineStorageMeta(this);
            storeHandlerMeta.set(this, meta);
        }

        return meta.storeClass;
    }
});

function determineStorageMeta(storeHandlerClass) {
    const
        getterNames = new Set(),
        actionNames = new Set();

    let prototype = storeHandlerClass.prototype;

    while (prototype !== StoreManager.prototype) {
        for (let propName of Object.getOwnPropertyNames(prototype)) {
            if (typeof propName === 'string'
                && propName !== 'constructor'
                && propName[0] !== '_'
                && typeof prototype[propName] === 'function'
                && !StoreManager.hasOwnProperty(propName)) {

                if (propName.match(GETTER_NAME_REGEX)) {
                    getterNames.add(propName);
                } else {
                    actionNames.add(propName);
                }
            }
        }

        prototype = Object.getPrototypeOf(prototype);
    }

    const
        storeClass = createStoreClass(storeHandlerClass, getterNames),
        controllerClass = createControllerClass(storeHandlerClass, storeClass, actionNames);

    return {
        getterNames,
        actionNames,
        storeClass,
        controllerClass
    };
}

function createStoreClass(storageClass, getterNames) {
    const
        storeClass = function (storage) {
            Store.call(this, storage);
            this.__storage = storage;
        },

        proto = Object.create(Store.prototype);

    storeClass.prototype = proto;

    for (let getterName of getterNames) {
        proto[getterName] = function (...args) {
           return storageClass.prototype[getterName].apply(this.__storage, args);
        };
    }

    return storeClass;
}

function createControllerClass(storageClass, storeClass, actionNames) {
    const
        controllerClass = function (storage) {
             storeClass.call(this, storage);
             this.__storage = storage;
        },

        proto = Object.create(storeClass.prototype);

    controllerClass.prototype = proto;

    for (let actionName of actionNames) {
        let method = buildControllerActionMethod(function (...args) {
            return storageClass.prototype[actionName].apply(this, args);
        });

        proto[actionName] = method;
    }

    return controllerClass;
}

function createDispatcher(storage) {
    return (actionName, payload) => {
        if (typeof actionName !== 'string' || actionName === '') {
            throw new TypeError(`[StoreManager#dispatch] First argument 'actionName' must be a non-empty string`);
        }

        const actionNames = storage.__meta.actionNames;

        let methodName = null;

        if (actionNames.has(actionName)) {
            methodName = actionName;
        }

        if (!methodName) {
            const alternativeMethodName =
                'on' + actionName[0] + actionName.substr(1);

            if (actionNames.has(alternativeMethodName)) {
                methodName = alternativeMethodName;
            }
        }

        if (!methodName) {
            throw new Error(`Illegal action name '${actionName}'`);
        }

        storage.controller[methodName]();

        return;
    };
}

function createDisposer(storage) {
    return () => {
        // TODO: implement
    };
}

function buildControllerActionMethod(fn) {
    let ret;

    if (!Functions.isGeneratorFunction(fn)) {
        ret = function (...args) {
            let ret2;

            const
                result = fn.apply(this.__storage, args);

            if (result instanceof Promise) {
                ret2 = new Promise(function (resolve, reject) {
                    result.then(value => {
                        setTimeout(() => resolve(value), 0);
                    })
                    .catch(err => reject(err));
                });
            } else {
                ret2 = new Promise((resolve, reject) => {
                    setTimeout(
                        () => resolve(result),
                        0);
                });
            }

            return ret2;
        };
    } else {
        throw new Error("Not implemented!"); // TODO: Implement
    }

    return ret;
}










