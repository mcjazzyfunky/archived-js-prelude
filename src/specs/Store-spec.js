'use strict';

import Objects from '../main/Objects.js';
import Store from '../main/Store.js';
import {expect} from 'chai';


const {controller: ctrl} = Store.create({
    initialState: {
        param1: 111,
        param2: 222
    },

    getters: {
        getParam1() {
            return this.state.param1;
        },

        getParam2() {
            return this.state.param2;
        },

        getState() {
            return this.state;
        }
    },

    actions: {
        setParam1(value) {
            this.notify('Calling setParam1');

            return Objects.transform(this.state, {
                param1: {$set: value}
            });
        },

        setParam2(value) {
            this.notify('Calling setParam2');

            return Objects.transform(this.state, {
                param2: {$set: value}
            });
        }
    }
});

const
    updateEvents = [],
    notificationEvents = [];

ctrl.updateEvents.subscribe(event => {
    updateEvents.push(event);
});

ctrl.notificationEvents.subscribe(event => {
    notificationEvents.push(event);
});

/**
 * @test {Seq#filter}
 */
describe('Testing method Store.create', () => {
    it('should create new store without additional initialization parameters', () => {

        return ctrl.setParam1(333)
            .then(stateHasChanged => {console.log(notificationEvents);
                expect(stateHasChanged).to.eql(true);
                expect(updateEvents.length).to.eql(1);
                expect(notificationEvents).to.eql(['Calling setParam1']);
                expect(ctrl.getParam1()).to.eql(333);
            });
    });
});