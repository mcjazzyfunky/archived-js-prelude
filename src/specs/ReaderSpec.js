'use strict';

import {describe, it} from 'mocha';
import {expect} from 'chai';
import Reader from '../../src/main/Reader';

/**
 * @test {Reader}
 */
describe('Testing Reader', () => {
    it('should work', () => {

        const reader = new Reader({x: {y: [11, {x: 22}, 33]}});

//    console.log(reader.getIn(['x', 'y']))
//        console.log("Result", reader.getIn(['x', 'y']).map(x => x.toString()).toArray())

//         process.exit(0);
    });
});
