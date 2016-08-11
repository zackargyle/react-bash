import chai from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import Terminal from '../src/index';

const baseEvent = { preventDefault: () => {} };

describe('ReactBash component', () => {

    it('should render with only a structure', () => {
        const wrapper = shallow(<Terminal />);
        chai.assert.isDefined(wrapper);
    });

    describe('props', () => {
        it('should utilize the history items passed in', () => {
            const history = [{ value: 'Foo' }];
            const wrapper = shallow(<Terminal history={history} />);
            const item = wrapper.find('div[data-test-id="history-0"]');
            chai.assert.strictEqual(item.text(), 'Foo');
        });

        it('should extend the BaseCommands with extensions', () => {
            const extensions = { foo: { exec: () => {} } };
            const wrapper = shallow(<Terminal extensions={extensions} />);
            const commands = wrapper.instance().Bash.commands;
            chai.assert.isDefined(commands.ls);
            chai.assert.isDefined(commands.foo);
        });

        it('should pass the file structure to bash', () => {
            const structure = { dir: {}, file: { content: 'Foo' } };
            const wrapper = shallow(<Terminal structure={structure} />);
            const state = wrapper.state();
            chai.assert.deepEqual(state.structure, structure);
        });

        it('should use the `prefix` prop in history and in the form', () => {
            const prefix = 'foo@bar';
            const item = { cwd: '', value: 'foo' };
            const expected = `${prefix} ~${item.cwd} $`;
            const wrapper = shallow(<Terminal prefix={prefix} history={[item]} />);
            const historyPrefix = wrapper.find('div[data-test-id="history-0"]').childAt(0);
            const formPrefix = wrapper.find('form').childAt(0);
            chai.assert.deepEqual(historyPrefix.text(), expected);
            chai.assert.deepEqual(formPrefix.text(), expected);
        });

        it('should update the structure with new props', () => {
            const structure1 = { dir1: {}, file1: { content: 'Foo1' } };
            const structure2 = { dir2: {}, file2: { content: 'Foo2' } };
            const wrapper = shallow(<Terminal structure={structure1} />);
            chai.assert.deepEqual(wrapper.state().structure, structure1);
            wrapper.setProps({ structure: structure2 });
            chai.assert.deepEqual(wrapper.state().structure, structure2);
        });

        it('should update the history with new props', () => {
            const history1 = [{ value: 'Foo1' }];
            const history2 = [{ value: 'Foo2' }];
            const wrapper = shallow(<Terminal history={history1} />);
            chai.assert.deepEqual(wrapper.state().history, history1);
            wrapper.setProps({ history: history2 });
            chai.assert.deepEqual(wrapper.state().history, history2);
        });
    });

    describe('autocomplete', () => {

        it('should use Bash.autocomplete', () => {
            const wrapper = shallow(<Terminal />);
            const instance = wrapper.instance();
            instance.refs = { input: { value: '' } };
            const spy = sinon.spy(instance.Bash, 'autocomplete');
            instance.attemptAutocomplete();
            chai.assert.strictEqual(spy.called, true);
        });

        it('should update the input field', () => {
            const wrapper = shallow(<Terminal />);
            const instance = wrapper.instance();
            instance.refs = { input: { value: 'he' } };
            instance.attemptAutocomplete();
            chai.assert.strictEqual(instance.refs.input.value, 'help');
        });

    });

    describe('keyboard shortcuts', () => {
        const keyEvent = (which) => Object.assign({ which }, baseEvent);
        let wrapper;
        let instance;

        beforeEach(() => {
            wrapper = shallow(<Terminal />);
            instance = wrapper.instance();
            instance.refs = { input: { value: '', scrollIntoView: () => {} } };
        });

        it('should handle autocomplete on tab keydown', () => {
            const spy = sinon.spy(instance, 'attemptAutocomplete');
            wrapper.find('input').simulate('keydown', keyEvent(9));
            chai.assert.strictEqual(spy.called, true);
        });

        it('should set/unset ctrlPressed', () => {
            chai.assert.strictEqual(instance.ctrlPressed, false);
            wrapper.find('input').simulate('keydown', keyEvent(17));
            chai.assert.strictEqual(instance.ctrlPressed, true);
            wrapper.find('input').simulate('keyup', keyEvent(17));
            chai.assert.strictEqual(instance.ctrlPressed, false);
        });

        it('should clear on ctrl + l', () => {
            instance.setState({ history: [{ value: 'Foo' }] });
            chai.assert.strictEqual(wrapper.state().history.length, 1);
            wrapper.find('input').simulate('keydown', keyEvent(17));
            wrapper.find('input').simulate('keyup', keyEvent(76));
            chai.assert.strictEqual(wrapper.state().history.length, 0);
        });

        it('should not clear on only l', () => {
            instance.setState({ history: [{ value: 'Foo' }] });
            chai.assert.strictEqual(wrapper.state().history.length, 1);
            wrapper.find('input').simulate('keyup', keyEvent(76));
            chai.assert.strictEqual(wrapper.state().history.length, 1);
        });

        it('should clear command line on ctrl + c', () => {
            const expected = '';
            instance.refs.input.value = 'help';
            wrapper.find('input').simulate('keydown', keyEvent(17));
            wrapper.find('input').simulate('keyup', keyEvent(67));
            chai.assert.strictEqual(instance.refs.input.value, expected);
        });

        it('should not clear command line on only c', () => {
            const expected = 'help';
            instance.refs.input.value = expected;
            wrapper.find('input').simulate('keyup', keyEvent(67));
            chai.assert.strictEqual(instance.refs.input.value, expected);
        });

        it('should handle the up arrow', () => {
            sinon.stub(instance.Bash, 'hasPrevCommand').returns(true);
            sinon.stub(instance.Bash, 'getPrevCommand').returns('Foo');
            wrapper.find('input').simulate('keyup', keyEvent(38));
            chai.assert.strictEqual(instance.refs.input.value, 'Foo');
        });

        it('should handle the down arrow', () => {
            sinon.stub(instance.Bash, 'hasNextCommand').returns(true);
            sinon.stub(instance.Bash, 'getNextCommand').returns('Foo');
            wrapper.find('input').simulate('keyup', keyEvent(40));
            chai.assert.strictEqual(instance.refs.input.value, 'Foo');
        });

    });

    describe('command submission', () => {
        const submitEvent = (value) => Object.assign({ target: [{ value }] }, baseEvent);
        let wrapper;
        let instance;
        let bashStub;

        beforeEach(() => {
            wrapper = shallow(<Terminal />);
            instance = wrapper.instance();
            instance.refs = { input: { value: 'Foo', scrollIntoView: () => {} } };
            bashStub = sinon.stub(instance.Bash, 'execute').returns({ cwd: 'bar' });
        });

        it('should attempt to execute the command', () => {
            wrapper.find('form').simulate('submit', submitEvent('Foo'));
            chai.assert.strictEqual(bashStub.called, true);
        });

        it('should update state', () => {
            wrapper.find('form').simulate('submit', submitEvent('Foo'));
            chai.assert.strictEqual(wrapper.state().cwd, 'bar');
        });

        it('should clear the input', () => {
            wrapper.find('form').simulate('submit', submitEvent('Foo'));
            chai.assert.strictEqual(instance.refs.input.value, '');
        });
    });

});
