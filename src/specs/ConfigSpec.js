'use strict';

import {describe, it} from 'mocha';
import {expect} from 'chai';
import Config from '../../src/main/Config';


const config = new Config({
    string1: 'abc',
    string2: '',
    string3: ' ',
    string4: ' def ',
    string5: 'true',
    boolean1: true,
    boolean2: false,
    number1: 123.45,
    integer1: 42,
    
    nested: {
        string: 'ghi',
        boolean: true,
        number: 234.56,
        integer: 4242
    }
});

describe('Testing method Config:getBoolean', () => {
    it('should read boolean values properly', () => {
            
        expect(config.getBoolean('boolean1'))
            .to.eql(true);

        expect(config.getBoolean('boolean2'))
            .to.eql(false);

    });
});

describe('Testing method Config:getBoolean', () => {
    it('should read boolean values properly', () => {
            
        expect(config.getBoolean('boolean1'))
            .to.eql(true);

        expect(config.getBoolean('boolean2'))
            .to.eql(false);

        expect(config.getBoolean('string5'))
            .to.eql(true);

        expect(config.getBoolean(['nested', 'boolean']))
            .to.eql(true);

        expect(config.getBoolean('unknown', true))
            .to.eql(true);
    });
});

describe('Testing method Config:getNumber', () => {
    it('should read numeric values properly', () => {
        expect(config.getNumber('number1'))
            .to.eql(123.45);

        expect(config.getNumber('integer1'))
            .to.eql(42);

        expect(config.getNumber(['nested', 'number']))
            .to.eql(234.56);

        expect(config.getNumber(['nested', 'integer']))
            .to.eql(4242);

        expect(config.getNumber('unknwon', 123))
            .to.eql(123);
    });
});

describe('Testing method Config:getInteger', () => {
    it('should read integer values properly', () => {
        expect(config.getInteger('number1'))
            .to.eql(123);

        expect(config.getInteger('integer1'))
            .to.eql(42);

        expect(config.getInteger(['nested', 'number']))
            .to.eql(234);

        expect(config.getInteger(['nested', 'integer']))
            .to.eql(4242);

        expect(config.getInteger('unknwon', 123))
            .to.eql(123);
    });
});

/**
 * @test {Config#getString}
 */
describe('Testing method Config:getString', () => {
    it('should read strings properly', () => {
        expect(config.getString('string1'))
            .to.eql('abc');

        expect(config.getString('string2'))
            .to.eql('');
                
        expect(config.getString('string3'))
            .to.eql(' ');
            
        expect(config.getString('string4'))
            .to.eql(' def ');

        expect(config.getString(['nested', 'string']))
            .to.eql('ghi');

        expect(config.getString('unknown', 'default value'))
            .to.eql('default value');
    });
});


/**
 * @test {Config#getStringOrNull}
 */
describe('Testing method Config:getStringOrNull', () => {
    it('should read strings properly and handle null values correctly', () => {
        expect(config.getStringOrNull('string1'))
            .to.eql('abc');

        expect(config.getStringOrNull('string2'))
            .to.eql(null);
                
        expect(config.getStringOrNull('string3'))
            .to.eql(' ');
            
        expect(config.getStringOrNull('string4'))
            .to.eql(' def ');

        expect(config.getStringOrNull(['nested', 'string']))
            .to.eql('ghi');

        expect(config.getStringOrNull('unknown'))
            .to.eql(null);
    });
});
