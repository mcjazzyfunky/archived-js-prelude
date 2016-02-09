/*jslint browser: true */

(function () {
    'use strict';

    var scriptNodes = document.getElementsByTagName('script'),
        scriptNode = scriptNodes[scriptNodes.length - 1],
        path = scriptNode.src,
        mojoToolkitBasePath,

        includeJsFile = function (path) {
            window.document.write('<script type="text/javascript" src="'
                    + path
                    + '"></script>\n');
        };

    if (path.indexOf('/') >= 0) {
        path = path.replace(/\/[^\/]*$/, '');
    }

    if (path === '') {
        path = '.';
    }

    window.mojo = {};
    mojoToolkitBasePath = path + '/../';

    window.mojoToolkitLoader = function () {
        var basePath = mojoToolkitBasePath + '/../main/',
            mojoToolkitMeta = window.mojoToolkitMeta,
            pkgInfoArray = mojoToolkitMeta.packages,
            pkgInfo,
            pkgName,
            jsFiles,
            jsFile,
            subPkgName,
            i,
            j;

        for (i = 0; i < pkgInfoArray.length; ++i) {
            pkgInfo = pkgInfoArray[i];
            pkgName = pkgInfo.name;
            jsFiles = pkgInfo.jsFiles;
            subPkgName = pkgName.replace(/^mojo\./, '');
            window.mojo[subPkgName] = {};

            for (j = 0; j < jsFiles.length; ++j) {
                jsFile = jsFiles[j];
                includeJsFile(basePath + subPkgName + '/' + jsFile);
            }
        }
    };

    includeJsFile(path + '/../meta/mojo-toolkit-meta.js');

    window.document.write(
        '<script type="text/javascript">mojoToolkitLoader();</script>'
    );
}());

