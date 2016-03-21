'use strict';

import {describe, it} from 'mocha';
import {expect} from 'chai';
import EventStream from '../../src/main/EventStream';

const
    stream1 = EventStream.of(1, 2, 3, 4),
  
    stream2 = EventStream.from([2, 3, 4, 5]),
  
    stream3 = new EventStream(subscriber => {
        let
            idx = 0,
            count = 5,
            done = false,
            
            f = () => {
                if (done) {
                   subscriber.complete(); 
                } else {
                    if (idx < count) {
                        subscriber.next(++idx);
                    }
                    
                    if (idx < count) {
                        setTimeout(f, 0);
                    } else {
                        subscriber.complete();
                        done = true;
                    }
                } 
            };
            
        f();
        
        return () => {
            done = true;
        };
    }),
    
    stream4 = stream3.map(n => n * 11).take(3);

/**
 * @test {EventStream.from}
 */
describe('Testing method EventStream.from', () => {
    it('should build EventStream from seqable and return unmodified EventStream if given', () => {
        const
            values1 = [],
            values2 = [];
            
        EventStream.from(stream2).subscribe(value => values1.push(value));
        stream2.subscribe(value => values2.push(value));
        
        expect(values1)
            .to.eql([2, 3, 4, 5]);
            
        expect(values2)
            .to.eql([2, 3, 4, 5]);
    });
});

/**
 * @test {EventStream.of}
 */
describe('Testing method EventStream.of', () => {
    it('should build EventStream of items', () => {
        const values = [];
       
        stream1.subscribe(value => values.push(value));
       
        expect(values)
            .to.eql([1, 2, 3, 4]);   
    });
});

/**
 * @test {EventStream#filter}
 */
describe('Testing method EventStream#filter', () => {
    it('should filter events properly', () => {
        const values = [];
        
        stream1.filter(n => n % 2 === 0).subscribe(value => values.push(value));
        
        expect(values)
            .to.eql([2, 4]);
    }); 
});

/**
 * @test {EventStream#map}
 */
describe('Testing method EventStream#map', () => {
    it('should map values properly', () => {
        const values = [];
        
        stream1.map(n => n * n).subscribe(m => values.push(m));
        
        expect(values)
            .to.eql([1, 4, 9, 16]);
    }); 
});


/**
 * @test {EventStream#take}
 */
describe('Testing method EventStream#take', () => {
    it('should limit to n events', () => {
        const values = [];
        
        stream1.take(3).subscribe(value => values.push(value));
        
        expect(values)
            .to.eql([1, 2, 3]);
    }); 
});

/**
 * @test {EventStream#skip}
 */
describe('Testing method EventStream#skip', () => {
    it('should skip n events', () => {
        const values = [];
        
        stream1.skip(2).subscribe(value => values.push(value));
        
        expect(values)
            .to.eql([3, 4]);
    }); 
});

/**
 * @test {EventStream.concat}
 */
describe('Testing static method EventStream.concat', () => {
    it('should concat synchronous event streams', () => {
        const values = [];
        
        EventStream.concat(stream1, stream2, stream1)
            .subscribe(value => values.push(value));
            
        expect(values)
            .to.eql([1, 2, 3, 4, 2, 3, 4, 5, 1, 2, 3, 4]);
    });
    
    it('should concat asynchronous event streams', () => {
        const values = [];
        
        return EventStream.concat(stream1, stream3, stream3)
            .forEach(value => values.push(value))
            .then(_ => {
               expect(values).to.eql([1, 2, 3, 4, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
            });
    });
});

/**
 * @test {EventStream#merge}
 */
describe('Testing method EventStream#merge', () => {
    it('should merge multiple synchronous event stream to a single one', () => {
        const values = [];
        
        return EventStream.merge(stream1, stream2, stream1).forEach(value => values.push(value))
            .then(_ => {
                expect(values).to.eql([1, 2, 3, 4, 2, 3, 4, 5, 1, 2, 3, 4]);
            });
    });
    
    it('should merge multiple asynchronous event stream to a single one', () => {
        const values = [];
        
        return EventStream.merge(stream3, stream4, stream3).forEach(value => values.push(value))
            .then(_ => {
                expect(values).to.eql([1, 11, 1, 2, 22, 2, 3, 33, 3, 4, 4, 5, 5]);
            });
    });
});

/**
 *
 */
describe('Testing method EventStream#combineLatest', () => {
    it("should combine two event stream using operation 'combineLatest'", () => {
        const values = [];
       
        return stream3.combineLatest(stream4, (v1, v2) => [v1, v2]).forEach(value => values.push(value))
            .then(_ => {
                expect(values).to.eql([[1, 11], [2, 11], [2, 22], [3, 22], [3, 33], [4, 33], [5, 33]]); 
            });       
    });
});


/**
 * @test {EventStream#forEach}
 */
describe('Testing method EventStream#forEach', () => {
    it('should apply for for each value of the stream', () => {
        const values = [];

       return stream3.forEach(value => values.push(value))
            .then(n => {
                expect(n).to.eql(5);
                expect(values).to.eql([1, 2, 3, 4, 5]);
            });
    });
});