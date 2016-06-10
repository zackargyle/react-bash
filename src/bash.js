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
        if (command === '') {
            return newState;
        } else if (this.commands[command]) {
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

        function parseToken(token) {
            if (token[0] === '-') {
                if (aliases[token]) {
                    const argTokens = [].concat(aliases[token]);
                    argTokens.forEach(parseToken);
                    return;
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

        while (tokens.length > 0) {
            parseToken(tokens.shift());
        }
        return { command, args };
    }

    /*
     * This is a very naive autocomplete method that works for both
     * commands and directories. If the input contains only one token it
     * should only suggest commands.
     *
     * @param {string} input - the user input
     * @param {Object} state - the terminal state
     * @param {Object} state.structure - the file structure
     * @param {string} state.cwd - the current working directory
     *
     * @returns {?string} a suggested autocomplete for the <input>
     */
    autocomplete(input, { structure, cwd }) {
        const tokens = input.split(/ +/);
        let token = tokens.pop();
        const filter = item => item.indexOf(token) === 0;
        const result = str => tokens.concat(str).join(' ');

        if (tokens.length === 0) {
            const suggestions = Object.keys(this.commands).filter(filter);
            return suggestions.length === 1 ? result(suggestions[0]) : null;
        } else {
            const pathList = token.split('/');
            token = pathList.pop();
            const partialPath = pathList.join('/');
            const path = Util.extractPath(partialPath, cwd);
            const { err, dir } = Util.getDirectoryByPath(structure, path);
            if (err) return null;
            const suggestions = Object.keys(dir).filter(filter);
            const prefix = partialPath ? `${partialPath}/` : '';
            return suggestions.length === 1 ? result(`${prefix}${suggestions[0]}`) : null;
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
