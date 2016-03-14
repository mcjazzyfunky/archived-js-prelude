import Objects from './main/Objects';
import Strings from './main/Strings';
import Arrays from './main/Arrays';
import Types from './main/Types'
import Seq from './main/Seq';
import Config from './main/Config'

export {
    Objects,
    Strings,
    Arrays,
    Types,
    Seq,
    Config
};

const jsprelude = {
    Objects,
    Strings,
    Arrays,
    Types,
    Seq,
    Config
};

if (typeof define === 'function' && define.amd) {
    define(() => jsprelude);
}

if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = jsprelude;
}

if (typeof window === 'object' && window) {
    window.jsprelude = jsprelude;
}
