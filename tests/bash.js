import chai from 'chai';
import sinon from 'sinon';
import { stateFactory } from './factories';
import Bash from '../src/bash';
import { Errors } from '../src/const';

describe('bash class', () => {

    describe('with extensions', () => {

        it('should add extensions to commands', () => {
            const bash = new Bash();
            chai.assert.isDefined(bash.prevCommands);
            chai.assert.strictEqual(bash.prevCommands.length, 0);
            chai.assert.isDefined(bash.prevCommandsIndex);
            chai.assert.strictEqual(bash.prevCommandsIndex, 0);
        });

        it('should add extensions to commands', () => {
            const noop = () => {};
            const bash = new Bash({ test: noop });
            chai.assert.isFunction(bash.commands.test);
            chai.assert.strictEqual(bash.commands.test, noop);
        });

    });

});

describe('bash class methods', () => {
    const mockState = stateFactory();
    let bash;

    beforeEach(() => {
        bash = new Bash();
    });

    describe('execute', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.execute);
        });

        it('should append command to prevCommands', () => {
            bash.execute('test', mockState);
            chai.assert.strictEqual(bash.prevCommands.length, 1);
            chai.assert.strictEqual(bash.prevCommands[0], 'test');
        });

        it('should increase prevCommandsIndex', () => {
            bash.execute('test', mockState);
            chai.assert.strictEqual(bash.prevCommandsIndex, 1);
        });

        it('should add input to history', () => {
            const { history } = bash.execute('ls', mockState);
            chai.assert.strictEqual(history.length, 2);
            chai.assert.strictEqual(history[0].value, 'ls');
            chai.assert.strictEqual(history[0].cwd, '');
        });

        it('should not break on empty input', () => {
            const { history } = bash.execute('', mockState);
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, '');
        });

        // Full command testing is in tests/command.js
        const commands = [
            { command: 'help' },
            { command: 'clear' },
            { command: 'ls', args: { 0: 'dir1' } },
            { command: 'cat', args: { 0: 'file1' } },
            { command: 'mkdir', args: { 0: 'testDir' } },
            { command: 'cd', args: { 0: 'dir1' } },
        ];

        commands.forEach(data => {
            it(`should handle the ${data.command} command`, () => {
                const stub = sinon.stub(bash.commands[data.command], 'exec');
                bash.execute(`${data.command} ${data.args}`, mockState);
                chai.assert.strictEqual(stub.called, true);
                stub.restore();
            });
        });

        it('should handle unknown commands', () => {
            const expected = Errors.COMMAND_NOT_FOUND.replace('$1', 'commandDoesNotExist');
            const { history } = bash.execute('commandDoesNotExist', mockState);
            chai.assert.strictEqual(history.length, 2);
            chai.assert.strictEqual(history[1].value, expected);
        });

    });

    describe('parseInput', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.parseInput);
        });

        it('should handle a simple command', () => {
            const { command } = bash.parseInput('ls');
            chai.assert.strictEqual(command, 'ls');
        });

        it('should handle no args', () => {
            const { args } = bash.parseInput('ls');
            chai.assert.strictEqual(Object.keys(args).length, 0);
        });

        it('should handle anonymous args', () => {
            const { args } = bash.parseInput('ls arg1 arg2');
            chai.assert.strictEqual(args[0], 'arg1');
            chai.assert.strictEqual(args[1], 'arg2');
        });

        it('should handle named args', () => {
            const { args } = bash.parseInput('ls -test arg');
            chai.assert.strictEqual(args.test, 'arg');
        });

        it('should handle boolean args', () => {
            const { args } = bash.parseInput('ls --test1 --test2');
            chai.assert.strictEqual(args.test1, true);
            chai.assert.strictEqual(args.test2, true);
        });

        it('should handle aliases', () => {
            const { args } = bash.parseInput('ls -a');
            chai.assert.strictEqual(args.all, true);
        });

        it('should handle array aliases', () => {
            const { args } = bash.parseInput('ls -al');
            chai.assert.strictEqual(args.all, true);
            chai.assert.strictEqual(args.long, true);
        });

    });

    describe('getPrevCommand', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.getPrevCommand);
        });

        it('should return previous command', () => {
            bash.prevCommandsIndex = 2;
            bash.prevCommands = [0, 1, 2];
            chai.assert.strictEqual(bash.getPrevCommand(), 1);
        });

    });

    describe('getNextCommand', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.getNextCommand);
        });

        it('should return next command', () => {
            bash.prevCommandsIndex = 1;
            bash.prevCommands = [0, 1, 2];
            chai.assert.strictEqual(bash.getNextCommand(), 2);
        });

    });

    describe('hasPrevCommand', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.hasPrevCommand);
        });

        it('should return false if index is 0', () => {
            bash.prevCommandsIndex = 0;
            chai.assert.strictEqual(bash.hasPrevCommand(), false);
        });

        it('should return true if index is not 0', () => {
            bash.prevCommandsIndex = 1;
            chai.assert.strictEqual(bash.hasPrevCommand(), true);
        });

    });

    describe('hasNextCommand', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.hasNextCommand);
        });

        it('should return false if at last index', () => {
            bash.prevCommands = [];
            bash.prevCommandsIndex = 0;
            chai.assert.strictEqual(bash.hasNextCommand(), true);
        });

        it('should return true if not at last index', () => {
            bash.prevCommands = [null, null];
            bash.prevCommandsIndex = 0;
            chai.assert.strictEqual(bash.hasNextCommand(), true);
        });

    });

    describe('autocomplete', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.autocomplete);
        });

        it('should autocomplete a command', () => {
            const expected = 'help';
            const actual = bash.autocomplete('he', mockState);
            chai.assert.strictEqual(expected, actual);
        });

        it('should not autocomplete a path if input has only one token', () => {
            const expected = null;
            const actual = bash.autocomplete('dir', mockState);
            chai.assert.strictEqual(expected, actual);
        });

        it('should not autocomplete a command if input has more than one token', () => {
            const expected = null;
            const actual = bash.autocomplete('ls he', mockState);
            chai.assert.strictEqual(expected, actual);
        });

        it('should autocomplete a directory name', () => {
            const expected = 'ls dir1';
            const actual = bash.autocomplete('ls di', mockState);
            chai.assert.strictEqual(expected, actual);
        });

        it('should autocomplete a file name', () => {
            const expected = 'ls file1';
            const actual = bash.autocomplete('ls fil', mockState);
            chai.assert.strictEqual(expected, actual);
        });

        it('should autocomplete a path', () => {
            const expected = 'ls dir1/childDir';
            const actual = bash.autocomplete('ls dir1/chi', mockState);
            chai.assert.strictEqual(expected, actual);
        });

        it('should not autocomplete commands on paths', () => {
            const expected = null;
            const actual = bash.autocomplete('ls dir1/clea', mockState);
            chai.assert.strictEqual(expected, actual);
        });

        it('should autocomplete a path with .. in it', () => {
            const expected = 'ls ../../dir1';
            const state = Object.assign({}, mockState, { cwd: 'dir1/childDir' });
            const actual = bash.autocomplete('ls ../../dir', state);
            chai.assert.strictEqual(expected, actual);
        });

    });

});

