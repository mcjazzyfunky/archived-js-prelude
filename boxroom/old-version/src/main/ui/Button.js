/*global mojo */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util,
        ui = mojo.ui;
     
    ui.Button = ui.Widget.createType({
        name: 'mojo.ui.Button',
        attributes: {
            id: {}   
        },
        behaviors: {
            text: {}  
        },
        events: {
            mouseOver: {},
            click: {},
            mouseOut: {}
        },
        render: function (document) {
            var html = new util.HtmlBuilder(document);
            return html.button(
                this.text()
            );
        }
    });
}());
