/*global mojo */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util,
        tagNames,
        i,
        j;

    util.HtmlBuilder = function (document) {
        if (!util.DomUtils.isDocument(document)) {
            throw new base.IllegalArgumentException(
                    '[mojo.util.HtmlBuilder] First argument must be a DOM document');
        }
        
        this._document = document;
    };

    tagNames = [
        'a',
        'b',
        'body',
        'col',
        'cols',
        'br',
        'button',
        'col',
        'colgroup',
        'div',
        'form',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'h7',
        'head',
        'html',
        'iframe',
        'input',
        'img',
        'li',
        'label',
        'link',
        'ol',
        'option',
        'p',
        'script',
        'select',
        'span',
        'strong',
        'style',
        'table',
        'td',
        'tbody',
        'textarea',
        'tfoot',
        'th',
        'thead',
        'title',
        'tr',
        'ul'
    ];


    for (i = 0; i < tagNames.length; ++i) {
        (function () {
            var tagName = tagNames[i];

            util.HtmlBuilder.prototype[tagNames[i]] = function () {
                var args = [];

                for (j = 0; j < arguments.length; ++j) {
                    args.push(arguments[j]);
                }

                return util.DomUtils.createElement(this._document, tagName, args);
            };
        })();
    }
}());
