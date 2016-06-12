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
            { command: 'ls', args: 'dir1' },
            { command: 'cat', args: 'file1' },
            { command: 'mkdir', args: 'testDir' },
            { command: 'cd', args: 'dir1' },
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

        it('should only print the unknown command in error', () => {
            const expected = Errors.COMMAND_NOT_FOUND.replace('$1', 'commandDoesNotExist');
            const { history } = bash.execute('commandDoesNotExist -la test/file.txt', mockState);
            chai.assert.strictEqual(history[1].value, expected);
        });

        it('should handle multiple commands with ;', () => {
            const { history } = bash.execute('cd dir1; pwd', mockState);
            chai.assert.strictEqual(history.length, 2);
            chai.assert.strictEqual(history[1].value, '/dir1');
        });

        it('should handle multiple commands with successful &&', () => {
            const { history } = bash.execute('cd dir1 && pwd', mockState);
            chai.assert.strictEqual(history.length, 2);
            chai.assert.strictEqual(history[1].value, '/dir1');
        });

        it('should handle multiple commands with unsuccessful &&', () => {
            const input = 'cd doesNotExist && pwd';
            const expected1 = Errors.NO_SUCH_FILE.replace('$1', 'doesNotExist');
            const { history } = bash.execute(input, mockState);
            chai.assert.strictEqual(history.length, 2);
            chai.assert.strictEqual(history[0].value, input);
            chai.assert.strictEqual(history[1].value, expected1);
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

