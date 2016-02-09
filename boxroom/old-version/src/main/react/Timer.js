/*global mojo */
/*jslint browser: true, plusplus: true, nomen: true */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util,
        react = mojo.react,
        constructorIsCallable = false,
        createNewTimer = function (doOnSubscribe, doOnDeploy) {
            var ret;
            
            constructorIsCallable = true;
            ret = new react.Timer(doOnSubscribe, doOnDeploy);
            constructorIsCallable = false;

            return ret;
        };

    react.Timer = function (doOnSubscribe, doOnDeploy) {
        if (!constructorIsCallable) {
            throw new base.IllegalOperationException(
                    '[mojo.react.Timer] Constructor is not callable directy. Use factory methods instead.');
        }
        
        react.EventStream.call(this, doOnSubscribe, doOnDeploy);
    };
    
    react.Timer.prototype = new react.EventStream();

    react.Timer.toString = function () {
        return '<mojo.reative.Timer>';
    };

    react.Timer.asDateEvents = function (milliseconds) {
        var ret,
            deploy;

        deploy = function (listener) {
            var intervalID = setInterval(function () {
                listener.onEvent(new Date());
            }, milliseconds);

            return function () {
                clearInterval(intervalID);
            };
        };

        ret = createNewTimer(null, deploy);
        return ret;
    };

    react.Timer.asTimestampEvents = function (milliseconds) {
        return react.Timer.asDateEvents(milliseconds).map(function (date) {
            return date.getTime();
        });
    };

    react.Timer.asMillisecondEvents = function (milliseconds, offset) {
        var start = new Date().getTime();

        if (isNaN(offset)) {
            offset = 0;
        }

        return react.Timer.asDateEvents(milliseconds).map(function (date) {
            return date.getTime() - start + offset;
        });
    };

    react.Timer.asSecondEvents = function (milliseconds, offset) {
        var start = new Date().getTime();

        if (isNaN(offset)) {
            offset = 0;
        }

        return react.Timer.asDateEvents(milliseconds).map(function (date) {
            return Math.floor((date.getTime() - start) / 1000) + offset;
        });
    };

    react.Timer.asCounterEvents = function (start, end, step, intervalInMilliseconds) {
        var value = start,
            endless = base.Types.isVacant(end),
            ret,
            sign,
            deploy;

        if (!step) {
            step = 1;
        }

        if (!intervalInMilliseconds) {
            intervalInMilliseconds = 1000;
        }

        sign = (step < 0 ? -1 : 1);

        deploy = function (listener) {
            var intervalID = null,
                undeploy;

            undeploy = function () {
                if (intervalID) {
                    clearInterval(intervalID);
                    intervalID = null;
                }
            };

            intervalID = setInterval(function () {
                value += step;

                if (!endless && (value * sign > end * sign)) {
                    undeploy();
                    listener.onCompleted();
                } else {
                    listener.onEvent(value);
                }
            }, intervalInMilliseconds);


            return undeploy;
        };


        ret = createNewTimer(null, deploy);
        return ret;
    };

    react.Timer.asDateBehavior = function (milliseconds) {
        return new react.Behavior(new Date(), react.Timer.asDateEvents(milliseconds));
    };

    react.Timer.asTimestampBehavior = function (milliseconds) {
        return new react.Behavior(new Date().getTime(), react.Timer.asTimestampEvents(milliseconds));
    };

    react.Timer.asMillisecondBehavior = function (milliseconds, offset) {
        if (isNaN(offset)) {
            offset = 0;
        }

        return new react.Behavior(offset, react.Timer.asMillisecondEvents(milliseconds, offset));
    };

    react.Timer.asSecondBehavior = function (milliseconds, offset) {
        if (isNaN(offset)) {
            offset = 0;
        }

        return new react.Behavior(offset, react.Timer.asSecondEvents(milliseconds, offset));
    };

    react.Timer.asCounterBehavior = function (start, end, step, intervalInMilliseconds) {
        return new react.Behavior(start, react.Timer.asCounterEvents(start, end, step, intervalInMilliseconds));
    };
}());