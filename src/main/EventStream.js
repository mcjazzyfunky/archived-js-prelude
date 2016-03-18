'use strict';

import Seq from './Seq';

const noOp = () => {};

export default class EventStream {
    constructor(onSubscribe) {
        if (typeof onSubscribe !== 'function') {
            throw new TypeError(
                "[EventStream.constructor] First argument 'onSubscribe' must be a function");
        }
        
        this.__onSubscribe = onSubscribe;
    }
    
    subscribe(subscriber) {
        const
            result = this.__onSubscribe(normalizeSubscriber(subscriber)),
            resultIsFunction = typeof result === 'function';

        if (!resultIsFunction && (!result || typeof result.unsubscribe !== 'function')) {
            throw new TypeError(
                "[EventStream.subscribe] The 'onSubscribe' function used for te construction "
                + 'of the event stream must either return a function or a subscription');
        }
        
        return resultIsFunction ? {unsubscribe: result} : result;
    }
   
    filter(pred) {
        if (typeof pred !== 'function') {
            throw new TypeError("[EventStream#filter] First argument 'pred' must be a function");
        }

        return new EventStream(subscriber => {
            let
                idx = -1,
            
                subscription = this.subscribe({
                    next(value) {
                        try {
                            if (pred(value, ++idx)) {
                                subscriber.next(value);
                            }
                        } catch (err) {
                            subscription.unsubscribe();
                            subscriber.error(err);
                        }
                    },
                
                    complete: () => subscriber.complete(),
                
                    error: err => subscriber.error(err)
                });
            
            return subscription;
        });
    }
    
    map(f) {
        if (typeof f !== 'function') {
            throw new TypeError("[EventStream#map] First argument 'f' must be a function");
        }
        
        return new EventStream(subscriber => {
            let idx = -1;
                
            const subscription = this.subscribe({
                next(value) {
                    try {
                        subscriber.next(f(value, ++idx))
                    } catch (err) {
                        subscription.unsubscribe();
                        subscriber.error(err);
                    }
                },
                
                complete: () => subscriber.complete(),
                
                error: err => subscriber.error(err)
            });
                
            return subscription;
        });
    }
    
    take(n) {
        if (typeof n !== 'number' || n < 0) {
            throw new TypeError(
                "[EventStream#take] First argument 'n' must be a non-negative integer number");
        }
        
        return (
            n === 0
            ? EventStream.empty()
            : new EventStream(subscriber => {
                let idx = 0;
                
                const ret = this.subscribe({
                    next: event => {
                        if (idx < n) {
                            subscriber.next(event);
                            ++idx;
                        } else {
                           ret.unsubscribe();
                        }
                    },
                    
                    complete: () => subscriber.complete(),
              
                    error: err => subscriber.error(err)
                });
                
                return ret;
            })
        );
    }
    
    skip(n) {
        if (typeof n !== 'number' || n < 0) {
            throw new TypeError(
                "[EventStream#skip] First argument 'n' must be a non-negative integer number");
        }

        return new EventStream(subscriber => {
            let idx = 0;
            
            return this.subscribe({
                next: event => {
                    if (idx === n) {
                        subscriber.next(event);
                    } else {
                        ++idx;
                    }
                },
                
                complete: () => subscriber.complete(),
                
                error: err => subscriber.error(err)
            });  
        });
    }
    
    
    combineLatest(streamable) {
        // TODO    
    }
    
    merge(...streamables) {
        return EventStream.merge(this, ...streamables);    
    }
    
    static merge(...streamables) {
        return new EventStream(subscriber => {
            const subscriptions = [];
            
            for (let streamable of streamables) {
                const subscription = EventStream.from(streamable).subscribe({
                    next: value => subscriber.next(value),
                    error: err => subscriber.error(err),
                    complete: () => subscriber.complete()
                });
                
                subscriptions.push(subscription);
            }
            
            return () => {
                for (let subscription of subscriptions) {
                    subscription.unsubscribe();
                }
                
                subscriptions.length = 0;
            };
        });
    }
    
    static from(obj) {
        let ret;
        
        if (obj instanceof EventStream) {
            ret = obj;
        } else if (Seq.isSeqable(obj)) {
            return new EventStream(subscriber => {
                try {
                    Seq.from(obj)
                        .forEach(item => subscriber.next(item));
                } catch (err) {
                    subscriber.error(err);
                }
                
                subscriber.complete();
                return () => {};
            });
        } else {
            // TODO - support also reactive stream like from "RXJS" or "Kefir" etc.
            throw new TypeError(
                "[EventStream.from] First argument 'obj' must be some kind of "
                + ' asynchronous event stream or a synchronous sequence');
        }
        
        return ret;
    }
    
    forEach(f) {
        if (typeof f !== 'function') {
           throw new TypeError("[EventStream#forEach] First argument 'f' must be a function") ;
        }
        
        return new Promise((resolve, reject) => {
            const subscription = this.subscribe({
                next(value) {
                    try {
                        f(value);    
                    } catch (err) {
                        subscription.unsubscribe();
                        reject(err);
                    }
                },
                
                error: reject,
                complete: resolve
            });
        });
    }
    
    static of(...events) {
        return EventStream.from(events);
    }
    
    static empty() {
        return emptyEventStream;
    }
    
    static isStreamable(obj) {
        return (
            obj instanceof EventStream
            || Seq.isSeqable(obj)
        );
    }
}

function normalizeSubscriber(subscriber) {
    let ret;
    
    if (typeof subscriber === 'function') {
        ret = {
            next: subscriber,
            complete: () => {}, 
            error: _ => {}
        };
    } else {
        ret = {
            next: subscriber && typeof subscriber.next === 'function' ? subscriber.next : noOp,
            complete: subscriber && typeof subscriber.complete === 'function' ? subscriber.complete: noOp,
            error: subscriber && typeof subscriber.error === 'function' ? subscriber.error: noOp
        }
    }

    return ret;
}

const emptyEventStream = new EventStream(subscriber => {
   subscriber.complete();
   
   return () => {};
});
