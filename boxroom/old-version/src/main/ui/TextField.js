/*global mojo */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util,
        ui = mojo.ui;
    
    ui.TextField = function (config) {
        ui.Widget.call(this, config);
        
    }
    
    ui.TextField.prototype = new ui.Widget();
    
    ui.TextField.prototype._createHtmlElement = function () {
        var html = new util.HtmlBuilder(document);
        return html.input({value: react.Timer.asDateEvents(1000)});
    }
}());