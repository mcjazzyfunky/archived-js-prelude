/*global mojo */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util,
        react = mojo.react;

    util.DomUtils = {
        toString: function () {
            return '<mojo.util.DomUtils>';
        },
        
        isTextNode: function (obj) {
            return obj !== null
                    && obj.ownerDocument
                    && obj.nodeType === 3;
        },
        
        isElement: function (obj) {
            return obj !== null
                    && obj.ownerDocument
                    && obj.nodeType === 1;
        },
        
        isDocument: function (obj) {
            return obj && !isNaN(obj.nodeType) && obj.createElement;    
        },
        
        getOwnerDocument: function (node) {
            return !node || isNaN(node.nodeType) || !node.ownerDocument
                    ? null
                    : node.ownerDocument;
        },
        
        createElement: function (document, tagName, varArgsOfExtensions) {
            if (!util.DomUtils.isDocument(document)) {
       	       throw new base.IllegalArgumentException('[mojo.util.DomUtils.createElement] First argument must be a DOM document');
            } else if (typeof tagName !== 'string') {
                throw new base.IllegalArgumentException('[mojo.util.DomUtils.createElement] Second argument must be a string');
            }

            var ret = document.createElement(tagName),
                i;

            for (i = 2; i < arguments.length; ++i) {
                util.DomUtils.extendElement(ret, arguments[i]);
            }

            return ret;
        },


        clearElement: function (element) {
            var i;
        
            if (!util.DomUtils.isElement(element)) {
       	       throw new base.IllegalArgumentException('[mojo.util.DomUtils.clearElement] First argument must be a DOM element');
            }

            for (i = 0; i < element.childNodes.length; ++i) {
                element.removeChild(element.childNodes[i]);
            }
        },

        containsClass: function (element, className) {
            if (!util.DomUtils.isElement(element)) {
       	       throw new base.IllegalArgumentException('[mojo.util.DomUtils.containsClass] First argument must be a DOM element');
            }

            var elementClassName = base.Strings.asString(element.className)
            className = util.StringUtils.asString(className);

            // TODO: Use regex (because of tabs etc)
            return ((' ' + nodeClassName + ' ').indexOf(' ' + className + ' ') >= 0);
        },

        addClasses: function (element, classes) {
            if (!util.DomUtils.isElement(element)) {
       	       throw new base.IllegalArgumentException('[mojo.util.DomUtils.addClasses] First argument must be a DOM element');
            }
                
            var i,
                tokens;

            if (classes instanceof Array) {
                for (i = 0; i < classes.length; ++i) {
                    util.DomUtils.addClasses(node, classes[i]);
                }
            } else if (typeof classes === 'string') {
                tokens = util.StringUtils.trim(classes).split(/\s+/);

                for (i = 0; i < tokens.length; ++i) {
                    util.DomUtils.addClass(element, tokens[i]);
                }
            }
        },

        addClass: function (element, className) {
            if (!util.DomUtils.isElement(element)) {
       	       throw new base.IllegalArgumentException('[mojo.util.DomUtils.addClass] First argument must be a DOM element');
            }
                
            className = util.StringUtils.trim(className);

            if (className.match(/[-_A-Za-z]+[-_A-Za-z0-9]*/)) {
                if (!util.DomUtils.containsClass(node, className)) {
                    element.className = base.Strings.trim(base.Strings.asString(node.className) + ' ' + className);
                }
            }
        },

        removeClass: function (element, className) {
            if (!util.DomUtils.isElement(element)) {
       	       throw new base.IllegalArgumentException('[mojo.util.DomUtils.removeClass] First argument must be a DOM element');
            }

            var oldClassName = base.Strings.trim(element.className);
            className = base.Strings.trim(className);

            if (className.match(/[-_A-Za-z]+[-_A-Za-z0-9]*/)) {
                var regEx = new RegExp('(^|\\s+)' + className + '($|\\s+)', 'g');
                var newClassName = oldClassName.replace(regEx, ' ');
                newClassName = newClassName.replace(/\s+/, ' ');
                newClassName = base.Strings.trim(newClassName);
                node.className = newClassName;
            }
        },

        addEventHandler: function (element, eventName, func, capture) {
            if (!util.DomUtils.isElement(element)) {
       	       throw new base.IllegalArgumentException('[mojo.util.DomUtils.addEventHandler] First argument must be a DOM element');
            }

            var ret = false;

            if (element.addEventListener) {
                element.addEventListener(eventName, func, !!capture);
                ret = true;
            } else if (element.attachEvent) {
                element.attachEvent('on' + eventName, func, !!capture);
                ret = true;
            }

            return ret;
        },

        removeEventHandler: function (element, eventName, func, capture) {
            if (!util.DomUtils.isElement(element)) {
       	       throw new base.IllegalArgumentException('[mojo.util.DomUtils.addEventHandler] First argument must be a DOM element');
            }

            if (element.removeEventListener) {
                element.removeEventListener(eventName, func, !!capture);
            } else if (element.detachEvent) {
                element.detachEvent('on' + eventName, func);
            }
        },
                
        extendElement: function (element, varArgsOfExtensions) {
            if (!util.DomUtils.isElement(element)) {
       	       throw new base.IllegalArgumentException(
                       '[mojo.util.DomUtils.extendElement] First argument must be a DOM element');
            }

            var document = util.DomUtils.getOwnerDocument(element),
                extension = arguments.length < 3 ? arguments[1] : Array.prototype.slice.call(arguments, 1),  
                propNames,
                propNames2,
                propName,
                propName2,
                propValue,
                i,
                j;

            if (!util.DomUtils.isElement(element) || !document || extension === undefined || extension === null) {
                // Nothing to do.
            } else if (extension instanceof Array) {
                for (i = 0; i < extension.length; ++i) {
                    util.DomUtils.extendElement(element, extension[i]);
                }
            } else if (extension instanceof util.Seq) {
                extension.forEach(function (item) {
                    util.DomUtils.extendElement(element, item);
                });
            } else if (typeof extension === 'function') {
                util.DomUtils.extendElement(element, arg());
            } else if (extension instanceof util.Seq) {
                extension.forEach(function (item) {
                    util.DomUtils.extendElement(element, item);
                });
            } else if (typeof extension !== 'object') {
                element.appendChild(document.createTextNode(extension));
            } else if (util.DomUtils.isElement(extension)) {
                element.appendChild(extension);
            } else if (react.Behavior.isBehavioral(extension)) {
                extension = react.Behavior.from(extension);
                util.DomUtils.clearElement(element);
                // util.DomUtils.extendElement(element, extension.get()); // TODO

                extension.subscribe(function (value) {
                    util.DomUtils.clearElement(element);
                    util.DomUtils.extendElement(element, value);
                });
            } else if (typeof extension.getHtmlElement === 'function') {
                util.DomUtils.extendElement(element, extension.getHtmlElement());
            } else if (typeof jQuery === 'function' && extension instanceof jQuery) {
                util.DomUtils.extendElement(element, extension.toArray());
            } else {
                propNames = util.ObjectUtils.getOwnProperties(extension);

                for (i = 0; i < propNames.length; ++i) {
                    propName = propNames[i];

                    propValue = extension[propName];

                    if (typeof propValue === 'function') {
                        // The following two lines do not work properly with a return value false in 'onsubmit' callback...
                        // if (propName.substr(0, 2) === 'on') {
                        //    util.DomUtils.addEventHandler(node, propName.substr(2), propValue);
                        // .. that's why we use a workaround here (problems with 'onload' in IE <= Version 8).
                        // TODO - check for better solution.

                        if (propName === 'onload') {
                            util.DomUtils.addEventHandler(node, 'load', propValue);
                        } else {
                            node[propName] = propValue;
                        }
                    } else if (react.Behavior.isBehavioral(propValue)) {
                        propValue = react.Behavior.from(propValue);

                        (function (node, propName, propValue) {
                            var update = function (value) {
                                var obj;

                                if (typeof value === undefined || value === null) {
                                    node.removeAttribute(propName);
                                } else {
                                    obj = {};
                                    obj[propName] = value;
                                    util.DomUtils.extendElement(node, obj);
                                }
                            };

                            // update(propValue.get());  // TODO

                            react.Behavior.from(propValue).subscribe(function (value) {
                                update(value);
                            });
                        }(element, propName, propValue));
                    } else if (element !== null && propValue !== null && typeof propValue === 'object' && typeof element[propName] === 'object') {
                        propNames2 = base.Objects.getOwnProperties(propValue);

                        for (j = 0; j < propNames2.length; ++j) {
                            propName2 = propNames2[j];
                            node[propName][propName2] = propValue[propName2];
                        }
                    } else if (typeof propValue !== 'undefined' && propValue !== null) {
                        propValue = util.StringUtils.asString(propValue);
                        
                        if (propName === 'class' || propName === 'className' || propName === 'clazz') {
                            element.className = propValue;
                        } else if (propName === 'style') {
                            element.style.cssText = propValue;
                        } else {
                            element.setAttribute(propName, propValue);
                        }
                    }
                }
            }
        }
    };
}());
