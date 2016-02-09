import Objects from './main/Objects';
import Strings from './main/Strings';
import Arrays from './main/Arrays';
import Seq from './main/Seq';
import Reader from './main/Reader'

const module = { Objects, Strings, Arrays, Seq, Reader };

export default module;

if (typeof define === 'function' && define.amd) {
    define(() => module);
}

if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = module;
}

if (typeof window === 'object' && window) {
    window.mojo = module;
}
