/*global mojo */

(function () {
    'use strict';
    
    var base = mojo.base,
        util = mojo.util,
        ui = mojo.ui;
    
    ui.Widget = function (config) {
        this._config = config;
        this._document = document;
        var cfg = util.Config.of(config);
    };
    
    ui.Widget.prototype.getHtmlElement = function () {
        var ret = this._htmlElement;
        
        if (!ret) {
            ret = this._htmlElement = this._createHtmlElement();
        }
        
        return ret;
    };
    
    ui.Widget.prototype._createHtmlElement = function () {
        throw new base.NotImplementedException(
                '[mojo.ui.Widget#_createHtmlElement] Abstract method "_createHtmlElement"" not implemented.');  
    };
    
    ui.Widget.createType = function(config) {
        var cfg = util.Config.of(config),
            attributeNames = cfg.getPropertyNames('attributes', []),
            behaviorNames = cfg.getPropertyNames('behaviors', []),
            eventNames = cfg.getPropertyNames('events', []),
            typeName = cfg.getString('name'),
            ret;

        ret = createWidgetConstructor(cfg);
        
        ret.prototype = new ui.Widget();
        
        util.Seq.from(attributeNames).forEach(function (attributeName) {
            addAttributeFunction(ret, attributeName)    
        });

        util.Seq.from(behaviorNames).forEach(function (behaviorName) {
            addBehaviorFunction(ret, behaviorName)    
        });

        util.Seq.from(eventNames).forEach(function (eventName) {
            addEventFunction(ret, eventName)    
        });
            
        ret.prototype.toString = function () {
            return '<instance of ' + typeName + '>';
        }

        return ret;
    };
    
    var createWidgetConstructor = function (widgetCfg) {
        return function (config) {
            var self = this,
                cfg = util.Config.of(config),
                attributeNames = widgetCfg.getPropertyNames('attributes', []),
                behaviorNames = widgetCfg.getPropertyNames('behaviors', []),
                eventNames = widgetCfg.getPropertyNames('events', []),
                renderFunction = widgetCfg.getFunction('render');

            this._attributes = {};
            this._behaviors = {};
            this._eventStream = {};
            
            util.Seq.from(attributeNames).forEach(function (attributeName) {
                addAttribute(self, attributeName, cfg)   
            });

            util.Seq.from(behaviorNames).forEach(function (behaviorName) {
                addBehavior(self, behaviorName, cfg);    
            });

            util.Seq.from(eventNames).forEach(function (eventName) {
                addEventStream(self, eventName, cfg);
            });
            
            this._createHtmlElement = function () {
                return renderFunction.call(self, document)
            };
        };
    };
    
   
    var addBehaviorFunction = function (constructor, name) {
        var f = function (maybeListener) {
            var argCount = arguments.length,
                ret;

            if (maybeListener) {
                ret = this._behaviors[name].subscribe(maybeListener);
            } else {
                ret = this._behaviors[name];
            }

            return ret;
        };

        constructor.prototype[name] = f;
    };
    
    var addEventFunction = function (constructor, name) {
        var f = function (maybeListener) {
            var argCount = arguments.length;
                ret;

            if (maybeListener) {
                ret = this._eventStreams[name].subscribe(maybeListener);
            } else {
                ret = this._eventStreams[name];
            }

            return ret;
        };
        
        constructor.prototype['on' + util.StringUtils.upperCaseFirst(name)] = f;
    }

    var addAttributeFunction = function (constructor, name) {
        var f = function () {
            return this._attributes[name];  
        };
        
        constructor.prototype['get' + util.StringUtils.upperCaseFirst(name)] = f;
    };
    
    var addAttribute = function (obj, attributeName, cfg) {
        obj._attributes[attributeName] = null;
    };
   
    var addBehavior = function (obj, behaviorName, cfg) {
        obj._behaviors[behaviorName] = mojo.react.Timer.asDateBehavior(1000);        
    };

    
    var addEventStream = function (obj, eventName, cfg) {
        obj._attributes[eventName] = null;
    };
}());
    