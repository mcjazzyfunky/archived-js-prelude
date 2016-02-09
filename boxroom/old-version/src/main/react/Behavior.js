/*global mojo */

(function () {
    'use strict';

    var react = mojo.react;

    react.Behavior = function (initialValue, changeEvents) {
        var self = this,
            doOnSubscribe,
            doOnDeploy;

        this._value = initialValue;
        changeEvents = react.EventStream.from(changeEvents);

        doOnSubscribe = function (listener) {
            listener.onEvent(self._value);
        };

        doOnDeploy = function (listener) {
            changeEvents.subscribe(listener);
        };

        this._eventStream = new react.EventStream(doOnSubscribe, doOnDeploy);
    };

    react.Behavior.prototype.subscribe = function (listener) {
        this._eventStream.subscribe(listener);
    };
    
    react.Behavior.from = function (obj) {
        var ret;
        
        if (obj instanceof react.Behavior) {
            ret = obj;
        } else if (obj instanceof react.EventStream) {
            ret = new react.Behavior(null, obj);
        } else {
            throw new base.IllegalArgumentException(
                    '[mojo.react.Behavior.from] First argument must be a behavioral object');
        }
        
        return ret;
    }
    
    react.Behavior.of = function (obj) {
        return new react.Behavior(obj, react.EventStream.nil());
    }
    
    react.Behavior.isBehavioral = function (obj) {
        return obj instanceof react.Behavior
            || obj instanceof react.EventStream;
    };
}());
