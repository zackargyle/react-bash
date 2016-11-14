import chai from 'chai';
import { stateFactory } from './factories';
import Bash from '../src/bash';
import * as BaseCommands from '../src/commands';
import { Errors, EnvVariables } from '../src/const';

describe('bash commands', () => {
    let bash;

    beforeEach(() => {
        bash = new Bash();
    });

    describe('help', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.help.exec);
        });

        it('should handle no args', () => {
            const state = stateFactory();
            // comments + commands - help
            const expected = 2 + Object.keys(BaseCommands).length - 1;
            const { history } = bash.commands.help.exec(state, {});
            chai.assert.strictEqual(history.length, expected);
        });

    });

    describe('clear', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.clear.exec);
        });

        it('should clear out the history', () => {
            const state = stateFactory({ history: [1, 2] });
            const { history } = bash.commands.clear.exec(state, {});
            chai.assert.strictEqual(history.length, 0);
        });

    });

    describe('ls', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.ls.exec);
        });

        it('should handle no args', () => {
            const state = stateFactory();
            const expected = Object.keys(state.structure)
                .filter(name => name[0] !== '.')
                .join(' ');
            const { history } = bash.commands.ls.exec(state, { flags: {}, args: {} });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should handle --all arg', () => {
            const state = stateFactory();
            const expected = Object.keys(state.structure).join(' ');
            const command = { flags: { a: true }, args: {} };
            const { history } = bash.commands.ls.exec(state, command);
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should handle --long arg', () => {
            const state = stateFactory();
            const expected = Object.keys(state.structure).length;
            const command = { flags: { a: true, l: true }, args: {} };
            const { history } = bash.commands.ls.exec(state, command);
            chai.assert.strictEqual(history.length, expected);
        });

        it('should handle a valid path arg', () => {
            const state = stateFactory();
            const expected = Object.keys(state.structure.dir1).join(' ');
            const command = { flags: {}, args: { 0: 'dir1' } };
            const { history } = bash.commands.ls.exec(state, command);
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should handle a non existent path', () => {
            const state = stateFactory();
            const expected = Errors.NO_SUCH_FILE.replace('$1', 'doesNotExist');
            const command = { flags: {}, args: { 0: 'doesNotExist' } };
            const { history } = bash.commands.ls.exec(state, command);
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should handle path to file', () => {
            const state = stateFactory();
            const expected = Errors.NOT_A_DIRECTORY.replace('$1', 'file1');
            const command = { flags: {}, args: { 0: 'file1' } };
            const { history } = bash.commands.ls.exec(state, command);
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

    });

    describe('cat', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.cat.exec);
        });

        it('should display file contents', () => {
            const state = stateFactory();
            const expected = state.structure.file1.content;
            const { history } = bash.commands.cat.exec(state, { args: { 0: 'file1' } });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should display file contents from path', () => {
            const state = stateFactory();
            const expected = state.structure.dir1.dir1File.content;
            const { history } = bash.commands.cat.exec(state, { args: { 0: 'dir1/dir1File' } });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should not work for directories', () => {
            const state = stateFactory();
            const expected = Errors.IS_A_DIRECTORY.replace('$1', 'dir1');
            const { history } = bash.commands.cat.exec(state, { args: { 0: 'dir1' } });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should not work for invalid paths', () => {
            const state = stateFactory();
            const expected = Errors.NO_SUCH_FILE.replace('$1', 'doesNotExist');
            const { history } = bash.commands.cat.exec(state, { args: { 0: 'doesNotExist' } });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should not work for nested invalid paths', () => {
            const state = stateFactory();
            const expected = Errors.NO_SUCH_FILE.replace('$1', 'dir1/doesNotExist');
            const { history } = bash.commands.cat.exec(state, { args: { 0: 'dir1/doesNotExist' } });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should not work for directory paths', () => {
            const state = stateFactory();
            const expected = Errors.IS_A_DIRECTORY.replace('$1', 'dir1/childDir');
            const { history } = bash.commands.cat.exec(state, { args: { 0: 'dir1/childDir' } });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

    });

    describe('mkdir', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.mkdir.exec);
        });

        it('should create a new directory', () => {
            const state = stateFactory();
            chai.assert.isUndefined(state.structure.testDir);
            const { structure } = bash.commands.mkdir.exec(state, { args: { 0: 'testDir' } });
            chai.assert.isDefined(structure.testDir);
        });

        it('should create a new directory at path', () => {
            const state = stateFactory();
            chai.assert.isUndefined(state.structure.dir1.testDir);
            const { structure } = bash.commands.mkdir.exec(state, { args: { 0: 'dir1/testDir' } });
            chai.assert.isDefined(structure.dir1.testDir);
        });

        it('should not create a directory if it already exists', () => {
            const state = stateFactory();
            const expected = Errors.FILE_EXISTS.replace('$1', 'dir1');
            chai.assert.isDefined(state.structure.dir1);
            const { history } = bash.commands.mkdir.exec(state, { args: { 0: 'dir1' } });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

        it('should not create a directory from path if it already exists', () => {
            const state = stateFactory();
            const expected = Errors.FILE_EXISTS.replace('$1', 'dir1/childDir');
            chai.assert.isDefined(state.structure.dir1);
            const { history } = bash.commands.mkdir.exec(state, { args: { 0: 'dir1/childDir' } });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, expected);
        });

    });

    describe('cd', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.cd.exec);
        });

        it('should work with no args', () => {
            const state = stateFactory();
            state.cwd = 'dir1';
            const { cwd } = bash.commands.cd.exec(state, { args: {} });
            chai.assert.strictEqual(cwd, '');
        });

        it('should work with path', () => {
            const state = stateFactory();
            const { cwd } = bash.commands.cd.exec(state, { args: { 0: 'dir1/childDir' } });
            chai.assert.strictEqual(cwd, 'dir1/childDir');
        });

        it('should work with ..', () => {
            const state = stateFactory();
            state.cwd = 'dir1/childDir';
            const { cwd } = bash.commands.cd.exec(state, { args: { 0: '..' } });
            chai.assert.strictEqual(cwd, 'dir1');
        });

        it('should work with multiple ..', () => {
            const state = stateFactory();
            state.cwd = 'dir1/childDir';
            const { cwd } = bash.commands.cd.exec(state, { args: { 0: '../../' } });
            chai.assert.strictEqual(cwd, '');
        });

        it('should work with back and forth', () => {
            const state = stateFactory();
            state.cwd = 'dir1/childDir';
            const { cwd } = bash.commands.cd.exec(state, { args: { 0: '../childDir' } });
            chai.assert.strictEqual(cwd, 'dir1/childDir');
        });

    });

    describe('cd', () => {
        it('should exist', () => {
            chai.assert.isFunction(bash.commands.pwd.exec);
        });

        it('should print out cwd', () => {
            const state = stateFactory();
            const expected = '/dir1/childDir';
            state.cwd = 'dir1/childDir';
            const { history } = bash.commands.pwd.exec(state);
            chai.assert.strictEqual(history[history.length - 1].value, expected);
        });

        it('should print out "/" for empty path', () => {
            const state = stateFactory();
            const expected = '/';
            state.cwd = '';
            const { history } = bash.commands.pwd.exec(state);
            chai.assert.strictEqual(history[history.length - 1].value, expected);
        });
    });

    describe('echo', () => {
        const state = stateFactory();

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.echo.exec);
        });

        it('should print out empty arguments', () => {
            const { history } = bash.commands.echo.exec(state, { input: 'echo' });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, '');
        });

        it('should print out arguments', () => {
            const { history } = bash.commands.echo.exec(state, { input: 'echo foo bar' });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, 'foo bar');
        });

        it('should print out static environment variables', () => {
            const { history } = bash.commands.echo.exec(state, { input: 'echo $HOME' });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, '/');
        });

        it('should print out dynamic environment variables', () => {
            const { history } = bash.commands.echo.exec(state, { input: 'echo $PWD' });
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, `/${state.cwd}`);
        });

    });

    describe('printenv', () => {
        const state = stateFactory();

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.printenv.exec);
        });

        it('should print out the environment variables', () => {
            const { history } = bash.commands.printenv.exec(state, {});
            chai.assert.strictEqual(history.length, Object.keys(EnvVariables).length);
        });

    });

    describe('whoami', () => {
        const state = stateFactory();

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.whoami.exec);
        });

        it('should print out the environment variables', () => {
            const { history } = bash.commands.whoami.exec(state, {});
            chai.assert.strictEqual(history.length, 1);
            chai.assert.strictEqual(history[0].value, state.settings.user.username);
        });

    });

    describe('rm', () => {

        it('should exist', () => {
            chai.assert.isFunction(bash.commands.rm.exec);
        });

        it('should delete files with the default command', () => {
            const state = stateFactory();
            chai.assert.isDefined(state.structure.file1);
            const { structure } = bash.commands.rm.exec(state, { args: { 0: 'file1' }, flags: { } });
            chai.assert.isUndefined(structure.file1);
        });

        it('should not delete a folder without the appropriate flags', () => {
            const state = stateFactory();
            chai.assert.isDefined(state.structure.dir1);
            const { structure } = bash.commands.rm.exec(state, { args: { 0: 'dir1' }, flags: { } });
            chai.assert.isDefined(structure.dir1);
        });

        it('should delete a folder with -r', () => {
            const state = stateFactory();
            chai.assert.isDefined(state.structure.dir1);
            const { structure } = bash.commands.rm.exec(state, { args: { 0: 'dir1' }, flags: { r: true } });
            chai.assert.isUndefined(structure.dir1);
        });

        it('should delete a folder with -R', () => {
            const state = stateFactory();
            chai.assert.isDefined(state.structure.dir1);
            const { structure } = bash.commands.rm.exec(state, { args: { 0: 'dir1' }, flags: { R: true } });
            chai.assert.isUndefined(structure.dir1);
        });
    });

});
