/*jslint node: true */

require('../meta/mojo-toolkit-meta.js');

var mojo = {},
    mojoToolkitMeta = global.mojoToolkitMeta,
    pkgInfoArray = mojoToolkitMeta.packages,
    pkgInfo,
    pkgName,
    jsFiles,
    jsFile,
    subPkgName,
    i,
    j;

global.mojo = mojo;

for (i = 0; i < pkgInfoArray.length; ++i) {
    pkgInfo = pkgInfoArray[i];
    pkgName = pkgInfo.name;
    jsFiles = pkgInfo.jsFiles;
    subPkgName = pkgName.replace(/^mojo\./, '');
    mojo[subPkgName] = {};

    for (j = 0; j < jsFiles.length; ++j) {
        jsFile = jsFiles[j];
        require(__dirname + '/../main/mojo-core/' + subPkgName + '/' + jsFile);
    }
}
