import * as Util from './util';
import { Errors } from './const';
import * as BaseCommands from './commands';

export default class Bash {

    constructor(extensions = {}) {
        this.commands = Object.assign(extensions, BaseCommands);
        this.prevCommands = [];
        this.prevCommandsIndex = 0;
    }

    execute(input, state) {
        this.prevCommands.push(input);
        this.prevCommandsIndex = this.prevCommands.length;

        // Append input to history
        const newState = Object.assign({}, state, {
            history: state.history.concat({
                cwd: state.cwd,
                value: input,
            }),
        });

        const { command, args } = this.parseInput(input);
        if (this.commands[command]) {
            return this.commands[command].exec(newState, args);
        } else {
            return Util.reportError(newState, Errors.COMMAND_NOT_FOUND, input);
        }
    }

    parseInput(input) {
        const tokens = input.trim().split(/ +/);
        const command = tokens.shift();

        // Short circuit if command doesn't exist
        if (!this.commands[command]) return { command };

        const aliases = this.commands[command].aliases || {};
        const args = {};
        let anonArgPos = 0;

        while (tokens.length > 0) {
            let token = tokens.shift();
            if (token[0] === '-') {
                if (aliases[token]) {
                    token = aliases[token];
                }
                if (token[1] === '-') {
                    args[token.substr(2)] = true;
                } else {
                    const next = tokens.shift();
                    args[token.substr(1)] = next;
                }
            } else {
                args[anonArgPos++] = token;
            }
        }
        return { command, args };
    }

    autocomplete(token, { structure, cwd }) {
        // Autocomplete paths
        let partialPath;
        let path = cwd;
        if (token.includes('/')) {
            const pathList = token.split('/');
            token = pathList.pop();
            partialPath = pathList.join('/');
            path = Util.extractPath(partialPath, cwd);
        }

        const { err, dir } = Util.getDirectoryByPath(structure, path);
        if (err) return null;

        // Don't include commands in path autocompletes
        let potentialItems = Object.keys(dir);
        if (path === cwd) {
            potentialItems = potentialItems.concat(Object.keys(this.commands));
        }

        const items = potentialItems.filter(item => item.indexOf(token) === 0);
        if (items.length === 1) {
            return path !== cwd ? `${partialPath}/${items[0]}` : items[0];
        } else {
            return null;
        }
    }

    getPrevCommand() {
        return this.prevCommands[--this.prevCommandsIndex];
    }

    getNextCommand() {
        return this.prevCommands[++this.prevCommandsIndex];
    }

    hasPrevCommand() {
        return this.prevCommandsIndex !== 0;
    }

    hasNextCommand() {
        return this.prevCommandsIndex !== this.prevCommands.length - 1;
    }

}
