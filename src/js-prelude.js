import Objects from './main/Objects.js';
import Strings from './main/Strings.js';
import Arrays from './main/Arrays.js';
import Seq from './main/Seq.js';
import Config from './main/Config.js'

export {
    Objects,
    Strings,
    Arrays,
    Seq,
    Config
};

const jsprelude = {
    Objects,
    Strings,
    Arrays,
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
