import chai from 'chai';
import * as BashParser from '../src/parser';

describe('BashParser', () => {

    describe('parseInput', () => {
        it('should exist', () => {
            chai.assert.isFunction(BashParser.parseInput);
        });

        it('should handle a simple command', () => {
            const { name, input } = BashParser.parseInput('ls');
            chai.assert.strictEqual(name, 'ls');
            chai.assert.strictEqual(input, 'ls');
        });

        it('should handle no args', () => {
            const { name, flags } = BashParser.parseInput('ls');
            chai.assert.strictEqual(name, 'ls');
            chai.assert.strictEqual(Object.keys(flags).length, 0);
        });

        it('should handle anonymous args', () => {
            const { args } = BashParser.parseInput('ls arg1 arg2');
            chai.assert.strictEqual(args[0], 'arg1');
            chai.assert.strictEqual(args[1], 'arg2');
        });

        it('should handle named args', () => {
            const { args } = BashParser.parseInput('ls --test arg1');
            chai.assert.strictEqual(args.test, 'arg1');
        });

        it('should handle boolean flags', () => {
            const { flags } = BashParser.parseInput('ls -l -a');
            chai.assert.strictEqual(Object.keys(flags).length, 2);
            chai.assert.strictEqual(flags.l, true);
            chai.assert.strictEqual(flags.a, true);
        });

        it('should handle grouped boolean flags', () => {
            const { flags } = BashParser.parseInput('ls -la');
            chai.assert.strictEqual(Object.keys(flags).length, 2);
            chai.assert.strictEqual(flags.l, true);
            chai.assert.strictEqual(flags.a, true);
        });

    });

    describe('parse', () => {

        it('should exist', () => {
            chai.assert.isFunction(BashParser.parse);
        });

        it('should handle a simple command', () => {
            const parsedData = BashParser.parse('ls');
            chai.assert.strictEqual(parsedData.length, 1);
            chai.assert.strictEqual(parsedData[0].length, 1);
            chai.assert.strictEqual(parsedData[0][0].name, 'ls');
        });

        it('should handle multiple commands with ;', () => {
            const [parsedData] = BashParser.parse('ls -la; cd test');
            const command1 = parsedData[0];
            const command2 = parsedData[1];
            chai.assert.strictEqual(command1.name, 'ls');
            chai.assert.strictEqual(command1.flags.l, true);
            chai.assert.strictEqual(command1.flags.a, true);
            chai.assert.strictEqual(command2.name, 'cd');
            chai.assert.strictEqual(command2.args[0], 'test');
        });

        it('should handle multiple commands with &&', () => {
            const dependencyList = BashParser.parse('ls -a && cd test');
            const [dep1, dep2] = dependencyList;
            chai.assert.strictEqual(dependencyList.length, 2);
            chai.assert.strictEqual(dep1[0].name, 'ls');
            chai.assert.strictEqual(dep1[0].flags.a, true);
            chai.assert.strictEqual(dep2[0].name, 'cd');
            chai.assert.strictEqual(dep2[0].args[0], 'test');
        });
    });
});
