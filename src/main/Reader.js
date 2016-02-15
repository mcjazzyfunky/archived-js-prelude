'use strict';

import Objects from './Objects.js';
import Seq from './Seq.js';

export default class Reader extends Seq {
    constructor(data) {
        if (data === null || typeof data !== 'object') {
            throw new TypeError("[Reader.constructor] First argument 'data' must be an object");
        }

        if (data instanceof Reader) {
            data = data.__data;
        }

        super(() => this.getEntries().map(entry => entry[1])[Symbol.iterator]());

        this.__data = data;
    }

    get(key) {
        return Reader.normalize(Objects.get(this.__data, key));
    }

    getIn(keyPath) {
        return Reader.normalize(Objects.getIn(this.__data, keyPath));
    }

    getKeys() {
        return this.getEntries().map(entry => entry[0]);
    }

    getEntries() {
        const
            arr = [], // we are lazy here
            keys = Array.isArray(this.__data)
                    ? Seq.range(0, this.__data.length)
                    : Object.getOwnPropertyNames(this.__data);

        for (let key of keys) {
            arr.push([key, Reader.normalize(this.__data[key])]);
        }

        return Seq.from(arr);
    }

    transform(transformationPlan) {
        return new Reader(Objects.transform(this.__data, transformationPlan));
    }

    toString() {
        return '<instance of Reader>';
    }

    static from(obj) {
        if (obj === null || typeof obj !== 'object') {
            throw new TypeError("[Reader.from] First argument 'obj' must be an object");
        }

        return (obj instanceof Reader)
                ? obj
                : new Reader(obj);
    }

    static toString() {
        return '<class Reader>';
    }

    static normalize(obj) {
        var ret;

        if (obj === null || obj instanceof Reader || typeof obj !== 'object') {
            ret = obj;
        } else {
            ret = new Reader(obj)
        }

        return ret;
    }
}
