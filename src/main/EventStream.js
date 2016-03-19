'use strict';

import Seq from './Seq';

export default class EventStream {
    constructor(onSubscribe) {
        if (typeof onSubscribe !== 'function') {
            throw new TypeError(
                "[EventStream.constructor] First argument 'onSubscribe' must be a function");
        }

        this.__onSubscribe = onSubscribe;
    }
    
    subscribe(subscriber) {
        let
            unsubscribed = false,
            callUnsubscribe = false;
            
        const
            unsubscribe = () => {
                if (!result) {
                    callUnsubscribe = true;
                } else if (!unsubscribed) {
                    unsubscribed = true;
                    subscriberProxy.complete();
                    
                    if (resultIsFunction) {
                        result();
                    } else {
                        result.unsubscribe();
                    }   
                }
            },        
        
            subscriberProxy = createSubscriberProxy(subscriber, unsubscribe),
            result = this.__onSubscribe(subscriberProxy),
            resultIsFunction = typeof result === 'function';
           
        if (!resultIsFunction && (!result || typeof result.unsubscribe !== 'function')) {
            throw new TypeError(
                "[EventStream.subscribe] The 'onSubscribe' function used for te construction "
                + 'of the event stream must either return a function or a subscription');
        }
        
        if (callUnsubscribe) {
            callUnsubscribe = false;
            unsubscribe();
        }
        
        return {
            unsubscribe
        };
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
                        if (pred(value, ++idx)) {
                            subscriber.next(value);
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
                    subscriber.next(f(value, ++idx));
                },
                
                error: err => subscriber.error(err),
                
                complete: () => subscriber.complete()
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
                           subscriber.complete();
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

    concat(...streamables) {
        return EventStream.concat(this, ...streamables);
    }    
    
    merge(...streamables) {
        return EventStream.merge(this, ...streamables);    
    }
    
    forEach(f) {
        if (typeof f !== 'function') {
           throw new TypeError("[EventStream#forEach] First argument 'f' must be a function") ;
        }
        
        return new Promise((resolve, reject) => {
            let
                counter = 0,
                callUnsubscribe = false;
            
            const subscription = this.subscribe({
                next(value) {
                    try {
                        f(value);    
                        ++counter;
                    } catch (err) {
                        if (subscription) {
                            subscription.unsubscribe();
                        } else {
                            callUnsubscribe = true; // in case of synchronous event streams
                        }
                        
                        reject(err);
                    }
                },
                
                error: reject,
                complete: () => resolve(counter)
            });
            
            if (callUnsubscribe) {
                callUnsubscribe = false;
                subscription.unsubscribe();
            }
        });
    }
    
    toString() {
        return "EventStream/instance";
    }
    
    static concat(...streamables) {
        const
            streams =
                Seq.from(streamables)
                    .filter(streamable => EventStream.isStreamable(streamable))
                    .map(streamable => EventStream.from(streamable))
                    .toArray(),
                    
            streamCount = streams.length;
        
        return (
            streamCount === 0
            ? EventStream.empty()
            : new EventStream(subscriber => {
                let
                    streamIndex = -1,
                    subscription = null,
                    callUnsubscribe = false,
                
                    performSubscription = () => {
                        subscription = streams[++streamIndex].subscribe({
                            next(value) {
                                subscriber.next(value);    
                            },
                            
                            error(err) {
                                subscriber.error(err);
                            },
                            
                            complete() {
                                if (subscription) {
                                    subscription.unsubscribe();
                                    subscription = null;
                                } else {
                                    callUnsubscribe = true;
                                }
                                
                                if (streamIndex < streamCount - 1) {
                                    performSubscription();
                                }
                            }                
                        });
                    };
                    
                performSubscription();
                   
                if (callUnsubscribe) {
                    callUnsubscribe = false;    
                    subscription.unsubscribe();
                }
                    
                return () => {
                    if (subscription) {
                        subscription.unsubscribe();
                    }       
                };
            })
        );
    }
    
    static merge(...streamables) {
        const
            streams =
                Seq.from(streamables)
                    .filter(streamable => EventStream.isStreamable(streamable))
                    .map(streamable => EventStream.from(streamable))
                    .toArray();

        return new EventStream(subscriber => {
            const
                subscriptions = [],
                
                unsubscribe = () => {
                    for (let subscription of subscriptions) {
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
                    
                    subscriptions.length = 0;
                };
            
            let activeStreamCount = streams.length;
            
            for (let i = 0; i < streams.length; ++i) {
                streams[i].subscribe({
                    next: value => subscriber.next(value),
                     
                    error: err => subscriber.error(err), 
                      
                    complete: () => {
                        if (--activeStreamCount === 0) {
                            subscriber.complete();
                        }
                    }
                });
            }
       
            return unsubscribe;     
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
    
    static toString() {
        return 'EventStream/class';
    }
}

function createSubscriberProxy(subscriber, unsubscribe) {
    let 
        onNext = null,
        onError = null,
        onComplete = null,
        done = false;
        
    if (typeof subscriber === 'function') {
       onNext = subscriber; 
    } else if (subscriber) {
        if (typeof subscriber.next === 'function') {
            onNext = value => subscriber.next(value);
        }
        
        if (typeof subscriber.error === 'function') {
            onError = err => subscriber.error(err);
        }
        
        if (typeof subscriber.complete === 'function') {
            onComplete = () => subscriber.complete();
        }
    }

    return {
        next(value) {
            if (!done && onNext) {
                try {
                    onNext(value);
                } catch (err) {
                    if (onError) {
                        onError(err);
                    }

                    unsubscribe();
                    done = true;
                }
            }
        },
        
        error(err) {
            if (!done) {
                if (onError) {
                    onError(err);
                }
                
                unsubscribe();
                done = true;
            }
        },
        
        complete() {
            if (!done) {
                if (onComplete) {
                    onComplete();
                }
                
                unsubscribe();
                done = true;
            }
        },
    };
}

const emptyEventStream = new EventStream(subscriber => {
   subscriber.complete();
   
   return () => {};
});
