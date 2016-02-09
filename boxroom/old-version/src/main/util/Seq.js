/*global mojo */

(function () {
    'use strict';

    var base = mojo.base,
        util = mojo.util || {},
        
        noOperation = function () {
        },

        stopIteration = function () {
            throw new base.StopIterationException();
        },

        consToGenerator = function (cons) {
            var tail = cons;

            return function () {
                var head;

                if (typeof tail === 'function') {
                    tail = tail();
                }

                if (tail instanceof Array && tail.length === 2) {
                    head = tail[0];
                    tail = tail[1];
                } else {
                    tail = null;
                    stopIteration();
                }

                return head;
            };
        },

        prepareSequencing = function (seq) {
            var ret = seq._sequencer();
            
            if (typeof ret === 'function') {
                ret = {
                    generate: ret,
                    dispose: noOperation
                };
            } else if (ret !== null &&  typeof ret === 'object' && typeof ret.next === 'function') {
                var iterator = ret,
                    iteratorDone = false;

                ret = {
                    generate: function () {
                        var result;

                        if (iteratorDone) {
                            stopIteration();
                        }

                        result = iterator.next();
                        
                        if (result === null || typeof result !== 'object' || result.value === undefined && result.done) {
                            iteratorDone = true;
                            stopIteration();
                        }
                        
                        iteratorDone = result.done;
                        return result.value;
                    },
                    dispose: noOperation
                }
            } else if (ret instanceof Array) {
                ret = {
                    generate: consToGenerator(ret),
                    dispose: noOperation
                };
            } else if (ret !== null && typeof ret === 'object') {
                if (ret.cons && !ret.generate) {
                    ret = {
                        generate:consToGenerator(ret.cons),
                        dispose: typeof ret.dispose === 'function'
                                ? ret.dispose
                                : noOperation
                    };
                } else {
                    ret = {
                        generate: typeof ret.generate === 'function'
                                ? ret.generate
                                : stopIteration,

                        dispose: typeof ret.dispose === 'function'
                                ? ret.dispose
                                : noOperation
                    };
                }
            } else {
                ret = {
                    generate: stopIteration,
                    dispose: noOperation
                };
            }

            return ret;
        };

    util.Seq = function (sequencer) {
        if (typeof sequencer === 'function') {
            this._sequencer = sequencer;
        } else if (sequencer !== null && typeof sequencer === 'object') {
            this._sequencer = function () {return sequencer; };
        } else {
            this._sequencer = function () {return stopIteration; };
        }
    };

    util.Seq.toString = function () {
        return '<mojo.util.Seq>';
    };

    util.Seq.prototype.toString = function () {
        return '<instance of mojo.util.Seq>';
    };

    util.Seq.prototype.map = function (f) {
        if (typeof f !== 'function') {
            throw new base.IllegalArgumentException(
                    '[mojo.util.Seq#map] First argument must be a function');            
        }
        
        var me = this;

        return new util.Seq(function () {
            var sequencing = prepareSequencing(me),
                generate = sequencing.generate,
                dispose = sequencing.dispose,
                idx = 0;

            return {
                generate: function () {
                    return f(generate(), idx++);
                },
                dispose: dispose
            };
        });
    };
    
    util.Seq.prototype.flatMap = function (f) {
        var me = this;
        
        if (typeof f !== 'function') {
            throw new base.IllegalArgumentException(
                    '[mojo.util.Seq#flatMap] First argument must be a function');            
        }
        
        return new util.Seq(function () {
            var sequencing = prepareSequencing(me),
                generate = sequencing.generate,
                dispose = sequencing.dispose,
                subsequencing = null,
                subgenerate = null,
                subdispose = null;
            
            return {
                generate: function innerGenerate() {
                    var ret = null;

                    if (subsequencing === null) {
                        subsequencing = prepareSequencing(util.Seq.from(f(generate())));
                        subgenerate = subsequencing.generate;
                        subdispose = subsequencing.dispose;
                    }
                    
                    try {
                        ret = subgenerate();
                    } catch (e) {
                        if (typeof subdispose === 'function') {
                            subdispose();
                        }

                        if (e instanceof base.StopIterationException) {
                            subsequencing = null;
                            ret = innerGenerate();
                        } else {
                            throw e;
                        }
                    }

                    return ret;
                },
                dispose: function () {
                    if (typeof subdispose === 'function') {
                        subdispose();
                    } 
                    
                    if (typeof dispose === 'function') {
                        dispose();
                    } 
                }
            };
        });
    }

    util.Seq.prototype.filter = function (pred) {
        if (typeof pred !== 'function') {
            throw new base.IllegalArgumentException(
                    '[mojo.util.Seq#filter] First argument must be a function');            
        }

        var me = this;

        return new util.Seq(function () {
            var sequencing = prepareSequencing(me),
                generate = sequencing.generate,
                dispose = sequencing.dispose,
                idx = 0;

            return {
                generate: function () {
                    var val = generate();

                    while (!pred(val, idx++)) {
                        val = generate();
                    }

                    return val;
                },
                dispose: dispose
            };
        });
    };

    util.Seq.prototype.takeWhile = function (pred) {
        if (typeof pred !== 'function') {
            throw new base.IllegalArgumentException(
                    '[mojo.util.Seq#takeWhile] First argument must be a function');            
        }

        var me = this;

        return new util.Seq(function () {
            var sequencing = prepareSequencing(me),
                generate = sequencing.generate,
                dispose = sequencing.dispose,
                idx = 0;

            return {
                generate: function () {
                    var val = generate();

                    if (!pred(val, idx++)) {
                        stopIteration();
                    }

                    return val;
                },
                dispose: dispose
            };
        });
    };

    util.Seq.prototype.skipWhile = function (pred) {
        if (typeof pred !== 'function') {
            throw new base.IllegalArgumentException(
                    '[mojo.util.Seq#skipWhile] First argument must be a function');            
        }

        var me = this;

        return new util.Seq(function () {
            var sequencing = prepareSequencing(me),
                generate = sequencing.generate,
                dispose = sequencing.dispose,
                hasStarted = false,
                idx = 0;

            return {
                generate: function () {
                    var val = generate();

                    if (!hasStarted) {
                        while (pred(val, idx++)) {
                            val = generate();
                        }

                        hasStarted = true;
                    }

                    return val;
                },
                dispose: dispose
            };
        });
    };

    util.Seq.prototype.take = function (n) {
        return this.takeWhile(function (_, idx) {
            return idx < n;
        });
    };

    util.Seq.prototype.skip = function (n) {
        return this.skipWhile(function (_, idx) {
            return idx < n;
        });
    };

    util.Seq.prototype.forEach = function (f) {
        var sequencing = prepareSequencing(this),
            generate = sequencing.generate,
            dispose = sequencing.dispose,
            val;

        try {
            while (true) {
                val = generate();
                f(val);
            }
        } catch (e) {
            if (!(e instanceof base.StopIterationException)) {
                throw e;
            }
        } finally {
            dispose();
        }
    };

    util.Seq.prototype.toArray = function () {
        var ret = [];

        this.forEach(function (x) {
            ret.push(x);
        });

        return ret;
    };


    util.Seq.nil = function () {
        return new util.Seq(null);
    };

    util.Seq.from = function (src) {
        var ret;

        if (src instanceof util.Seq) {
            ret = src;
        } else if (src instanceof Array || typeof src === 'string') {
            ret = new util.Seq(function () {
                var idx = 0;

                return function () {
                    if (idx >= src.length) {
                        stopIteration();
                    }

                    return src[idx++];
                };
            });
        } else {
            ret = util.Seq.nil();
        }

        return ret;
    };

    util.Seq.of = function (itemsAsVarArgs) {
        var args = arguments,
            argCount = arguments.length;

        return new util.Seq(function () {
            var idx = 0;

            return function () {
                if (idx >= argCount) {
                    stopIteration();
                }

                return args[idx++];
            };
        });
    };
}());
