/*global mojo */

(function () {
    'use strict';

    var react = mojo.react,
        doNothing = function () {},

        normalizeListener = function (listener) {
            var ret = {
                    onEvent: doNothing,
                    onException: doNothing,
                    onCompleted: doNothing
                },
                type = typeof listener;

            if (type === 'function') {
                ret.onEvent = listener;
            } else if (listener !== null && type === 'object') {
                if (typeof listener.onEvent === 'function') {
                    ret.onEvent = listener.onEvent;
                }

                if (typeof listener.onException === 'function') {
                    ret.onException = listener.onException;
                }

                if (typeof listener.onCompleted === 'function') {
                    ret.onCompleted = listener.onCompleted;
                }
            }

            return ret;
        };

    react.EventStream = function (doOnSubscribe, doOnDeploy) {
        var me = this;

        this._listeners = [];
        this._completed = false;
        this._dispose = doNothing;

        this._doOnSubscribe = typeof doOnSubscribe === 'function'
                ? doOnSubscribe
                : doNothing;

        this._doOnDeploy = typeof doOnDeploy === 'function'
                ? doOnDeploy
                : doNothing;

        this._proxyListener = {
            onEvent: function (ev) {
                var i;

                for (i = 0; i < me._listeners.length; ++i) {
                    me._listeners[i].onEvent(ev);
                }
            },

            onException: function (e) {
                var i;

                for (i = 0; i < me._listeners.length; ++i) {
                    me._listeners[i].onException(e);
                }
            },

            onCompleted: function () {
                var i, listener;

                for (i = 0; i < me._listeners.length; ++i) {
                    listener = me._listeners[i];
                    listener.onCompleted();
                }

                me._listeners = [];
                me._completed = true;
            },

            dispose: doNothing
        };
    };

    react.EventStream.prototype.subscribe = function (listener) {
        var ret = doNothing,
            me = this;

        listener = normalizeListener(listener);

        if (this._completed) {
            setTimeout(function () {
                listener.onCompleted();
            }, 0);
        } else {
            this._listeners.push(listener);

            if (this._listeners.length === 1) {
                ret = (function () {
                    var disposed = false;

                    return function () {
                        var i;

                        if (!disposed) {
                            for (i = 0; i < me._listeners.length; ++i) {
                                if (listener === me._listeners[i]) {
                                    me._listeners.splice(i, 1);
                                }
                            }

                            disposed = true;
                        }
                    };
                }());
            }

            this._doOnSubscribe(listener);

            if (this._listeners.length === 1) {
                this._dispose = this._doOnDeploy(this._proxyListener);
            }
        }

        return ret;
    };

    react.EventStream.prototype.map = function (f) {
        var self = this;

        return new react.EventStream(null, function (listener) {
            var idx = 0;

            return self.subscribe({
                onEvent: function (ev) {
                    listener.onEvent(f(ev, idx++));
                },
                onException: function (e) {
                    listener.onException(e);
                },
                onCompleted: function () {
                    listener.onCompleted();
                }
            });
        });
    };

    react.EventStream.prototype.filter = function (pred) {
        var self = this;

        return new react.EventStream(null, function (listener) {
            var idx = 0;

            return self.subscribe({
                onEvent: function (ev) {
                    if (pred(ev, idx++)) {
                        listener.onEvent(ev);
                    }
                },
                onException: function (e) {
                    listener.onException(e);
                },
                onCompleted: function () {
                    listener.onCompleted();
                }
            });
        });
    };

    react.EventStream.prototype.takeWhile = function (pred) {
        var self = this;

        return new react.EventStream(null, function (listener) {
            var idx = 0;

            self.subscribe(function (ev) {
                if (pred(ev, idx++)) {
                    listener.onEvent(ev);
                } else {
                    listener.onCompleted();
                }
            });
        });
    };

    react.EventStream.prototype.skipWhile = function (pred) {
        var self = this;

        return new react.EventStream(null, function (listener) {
            var idx = 0,
                hasStarted = false;

            self.subscribe(function (ev) {
                if (hasStarted) {
                    listener.onEvent(ev);
                } else {
                    if (!pred(ev, idx++)) {
                        listener.onEvent(ev);
                        hasStarted = true;
                    }
                }
            });
        });
    };

    react.EventStream.prototype.take = function (n) {
        return this.takeWhile(function (_, idx) {
            return idx < n;
        });
    };

    react.EventStream.prototype.skip = function (n) {
        return this.skipWhile(function (_, idx) {
            return idx < n;
        });
    };

    react.EventStream.prototype.forEach = function (f) {
        return this.subscribe(function (ev) {
            f(ev);
        });
    };

    react.EventStream.of = function (varArgsOfEvents) {
        var args = arguments;

        return new react.EventStream(function (listener) {
            var processEvent = function (ev) {
                    setTimeout(function () {
                        listener.onEvent(ev);
                    }, 0);
                },
                i;

            for (i = 0; i < args.length; ++i) {
                processEvent(args[i]);
            }

            setTimeout(function () {
                listener.onCompleted();
            }, 0);
        });
    };
    
    react.EventStream.nil = function () {
        return new react.EventStream(function (listener) {
            listener.onCompleted();
        });
    };
    
    react.EventStream.from = function (obj) {
        var ret;
        
        if (obj instanceof react.EventStream) {
            ret = obj;
        } else {
            throw new base.IllegalArgumentException(
                    '[mojo.react.EventStream.from] First argument must be streamable')
        }
        
        return ret;
    }
}());
