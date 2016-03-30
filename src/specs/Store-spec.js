'use strict';

import Objects from '../main/Objects.js';
import Store from '../main/Store.js';

/**
 * @test {Seq#filter}
 */
describe('Testing method Store.create', () => {
    it('should create new store without additional initialization parameters', () => {
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
                setParam1(value) {console.log(666, this)
                    return Objects.transform(this.state, {
                        param1: {$set: value}
                    });
                },

                setParam2(value) {
                    return Objects.transform(this.state, {
                        param2: {$set: value}
                    });
                }
            }
        });

        ctrl.setParam1(333)
            .then(stateHasChanged => console.log('param1:', ctrl.getParam1(), stateHasChanged))
            .then(() => process.exit(0));
    })
});