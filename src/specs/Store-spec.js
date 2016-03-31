'use strict';

import Objects from '../main/Objects.js';
import Store from '../main/Store.js';
import {expect} from 'chai';


const
    modificationEvents = [],
    notificationEvents = [];

function createTestStore1() {
    const ret = Store.createSuite({
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

    ret.store.modificationEvents.subscribe(event => {
        modificationEvents.push(event);
    });

    ret.store.notificationEvents.subscribe(event => {
        notificationEvents.push(event);
    });

    return ret;
}

describe("Testing class Store", done => {
    beforeEach(done => {
        modificationEvents.length = 0;
        notificationEvents.length = 0;
        done();
    });

    /**
     * @test {Store.create}
     */
    describe('Testing method Store.create', () => {
        it('should create new store without additional initialization parameters', () => {
            const {controller: ctrl} = createTestStore1();

            return ctrl.setParam1(333)
                .then(stateHasChanged => {
                    expect(stateHasChanged).to.eql(true);
                    expect(modificationEvents.length).to.eql(1);
                    expect(notificationEvents).to.eql(['Calling setParam1']);
                    expect(ctrl.getParam1()).to.eql(333);
                });
        });
    });

    /**
     * @test {Store.createSnapshot}
     */
    describe('Testing method Store.createSnapshot', () => {
        it('should create a store snapshot by copying the store and freezing the state', () => {
            const {store, controller: ctrl} = createTestStore1();

            let oldParam1, snapshot;

            return (
                ctrl.setParam1(123)
                    .then(_ => { oldParam1 = store.getParam1(); })
                    .then(_ => snapshot = store.createSnapshot())
                    .then(_ => ctrl.setParam1(234))
                    .then(_ => {console.log(oldParam1, ctrl.getParam1())
             //
             //           expect(ctrl.getParam1()).to.eql(234);console.log(1, oldParam1, ctrl.getParam1(), snapshot.getParam1()); console.log(2, snapshot.__master.state)
             //           expect(snapshot.getParam1()).to.eql(oldParam1);
                    })
            );
        });
    });
});
