import Objects from './module/Objects';
import Strings from './module/Strings';
import Arrays from './module/Arrays';
import Seq from './module/Seq';
import Reader from './module/Reader'

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
