'use strict';

import {describe, it} from 'mocha';
import {expect} from 'chai';
import Objects from '../../src/main/Objects';

/**
 * @test {Objects.isSomething}
 */
describe('Testing static function Objects.isSomething', () => {
    it('should return false if the input is undefined', () =>
        expect(Objects.isSomething(undefined))
                .to.eql(false)
    );

    it('should return false if the input is null', () =>
        expect(Objects.isSomething(null))
                .to.eql(false)
    );

    it('should return true if the input is true', () =>
        expect(Objects.isSomething(true))
                .to.eql(true)
    );

    it('should return true if the input is false', () =>
        expect(Objects.isSomething(false))
                .to.eql(true)
    );

    it('should return true if the input is zero', () =>
        expect(Objects.isSomething(0))
                .to.eql(true)
    );

    it('should return true if the input is a non-zero number', () =>
        expect(Objects.isSomething(42))
                .to.eql(true)
    );

    it('should return true if the input is an empty string', () =>
        expect(Objects.isSomething(''))
                .to.eql(true)
    );

    it('should return true if the input is a real object', () =>
        expect(Objects.isSomething({}))
                .to.eql(true)
    );
});

/**
 * @test {Objects.isNothing}
 */
describe('Testing static function Objects.isNothing', () => {
    it('should return true if the input is undefined', () =>
        expect(Objects.isNothing(undefined))
                .to.eql(true)
    );

    it('should return true if the input is null', () =>
        expect(Objects.isNothing(null))
                .to.eql(true)
    );

    it('should return false if the input is true', () =>
        expect(Objects.isNothing(true))
                .to.eql(false)
    );

    it('should return false if the input is false', () =>
        expect(Objects.isNothing(false))
                .to.eql(false)
    );

    it('should return false if the input is zero', () =>
        expect(Objects.isNothing(0))
                .to.eql(false)
    );

    it('should return false if the input is a non-zero number', () =>
        expect(Objects.isNothing(42))
                .to.eql(false)
    );

    it('should return false if the input is an empty string', () =>
        expect(Objects.isNothing(''))
                .to.eql(false)
    );

    it('should return false if the input is a real object', () =>
        expect(Objects.isNothing({}))
                .to.eql(false)
    );
});


/**
 * @test {Objects.asString}
 */
describe('Testing static function Objects.asString', () => {
    it('should return an empty string if the input is undefined', () =>
        expect(Objects.asString(undefined))
                .to.eql('')
    );

    it('should return an empty string if the input is null', () =>
        expect(Objects.asString(null))
                .to.eql('')
    );

    it('should return an empty string if the input is an empty string', () =>
        expect(Objects.asString(''))
                .to.eql('')
    );

    it('should return an equal string if the input is a non-empty string', () =>
        expect(Objects.asString('some-text'))
                .to.eql('some-text')
    );

    it('should integer numbers to their corresponding string representations', () =>
        expect(Objects.asString(42))
                .to.eql('42')
    );

    it('should floating-point numbers to their corresponding string representations', () =>
        expect(Objects.asString(42.420))
                .to.eql('42.42')
    );

    it('should return the result of the toString method if the input is a real object', () =>
        expect(Objects.asString({toString: () => 'the-toString-result'}))
                .to.eql('the-toString-result')
    );

    it('should return a string even if the toString method of the input objects itself does not return a string', () =>
        expect(Objects.asString({toString: () => undefined}))
                .to.eql('')
    );
});

