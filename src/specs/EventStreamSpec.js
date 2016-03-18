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
                    if (idx < count) {console.log(111111 + " " + (idx + 1));
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
            array1 = [],
            array2 = [];
            
        EventStream.from(stream2).subscribe(value => array1.push(value));
        stream2.subscribe(value => array2.push(value));
        
        expect(array1)
            .to.eql([2, 3, 4, 5]);
            
        expect(array2)
            .to.eql([2, 3, 4, 5]);
    });
});

/**
 * @test {EventStream.of}
 */
describe('Testing method EventStream.of', () => {
    it('should build EventStream of items', () => {
        const array = [];
       
        stream1.subscribe(value => array.push(value));
       
        expect(array)
            .to.eql([1, 2, 3, 4]);   
    });
});

/**
 * @test {EventStream#filter}
 */
describe('Testing method EventStream#filter', () => {
    it('should filter events properly', () => {
        const array = [];
        
        stream1.filter(n => n % 2 === 0).subscribe(value => array.push(value));
        
        expect(array)
            .to.eql([2, 4]);
    }); 
});

/**
 * @test {EventStream#map}
 */
describe('Testing method EventStream#map', () => {
    it('should map values properly', () => {
        const array = [];
        
        stream1.map(n => n * n).subscribe(m => array.push(m));
        
        expect(array)
            .to.eql([1, 4, 9, 16]);
    }); 
});


/**
 * @test {EventStream#take}
 */
describe('Testing method EventStream#take', () => {
    it('should limit to n events', () => {
        const array = [];
        
        stream1.take(3).subscribe(value => array.push(value));
        
        expect(array)
            .to.eql([1, 2, 3]);
    }); 
});

/**
 * @test {EventStream#skip}
 */
describe('Testing method EventStream#skip', () => {
    it('should skip n events', () => {
        const array = [];
        
        stream1.skip(2).subscribe(value => array.push(value));
        
        expect(array)
            .to.eql([3, 4]);
    }); 
});

/**
 * @test {EventStream#forEach}
 */
describe('Testing method EventStream#forEach', () => {
    it('should apply for for each value of the stream', () => {
        const array = [];
        
        stream3.forEach(value => array.push(value))
            .then(_ => expect(array).to.eql([1, 2, 3, 4, 5]));
    });
});