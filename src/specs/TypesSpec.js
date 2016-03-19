'use strict';

import {describe, it} from 'mocha';
import {expect} from 'chai';
import Types from '../../src/main/Types';

/**
 * @test {Types.isSomething}
 */
describe('Testing static function Types#isSomething', () => {
    it('should return false if the input is undefined', () =>
        expect(Types.isSomething(undefined))
                .to.eql(false)
    );

    it('should return false if the input is null', () =>
        expect(Types.isSomething(null))
                .to.eql(false)
    );

    it('should return true if the input is true', () =>
        expect(Types.isSomething(true))
                .to.eql(true)
    );

    it('should return true if the input is false', () =>
        expect(Types.isSomething(false))
                .to.eql(true)
    );

    it('should return true if the input is zero', () =>
        expect(Types.isSomething(0))
                .to.eql(true)
    );

    it('should return true if the input is a non-zero number', () =>
        expect(Types.isSomething(42))
                .to.eql(true)
    );

    it('should return true if the input is an empty string', () =>
        expect(Types.isSomething(''))
                .to.eql(true)
    );

    it('should return true if the input is a real object', () =>
        expect(Types.isSomething({}))
                .to.eql(true)
    );
});

/**
 * @test {Types.isNothing}
 */
describe('Testing static function Types#isNothing', () => {
    it('should return true if the input is undefined', () =>
        expect(Types.isNothing(undefined))
                .to.eql(true)
    );

    it('should return true if the input is null', () =>
        expect(Types.isNothing(null))
                .to.eql(true)
    );

    it('should return false if the input is true', () =>
        expect(Types.isNothing(true))
                .to.eql(false)
    );

    it('should return false if the input is false', () =>
        expect(Types.isNothing(false))
                .to.eql(false)
    );

    it('should return false if the input is zero', () =>
        expect(Types.isNothing(0))
                .to.eql(false)
    );

    it('should return false if the input is a non-zero number', () =>
        expect(Types.isNothing(42))
                .to.eql(false)
    );

    it('should return false if the input is an empty string', () =>
        expect(Types.isNothing(''))
                .to.eql(false)
    );

    it('should return false if the input is a real object', () =>
        expect(Types.isNothing({}))
                .to.eql(false)
    );
});

