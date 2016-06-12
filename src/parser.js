/*
 * This method parses a single command + args. It handles
 * the tokenization and processing of flags, anonymous args,
 * and named args.
 *
 * @param {string} input - the user input to parse
 * @returns {Object} the parsed command/arg dataf84t56y78ju7y6f
 */
export function parseInput(input) {
    const tokens = input.split(/ +/);
    const name = tokens.shift();
    const flags = {};
    const args = {};
    let anonArgPos = 0;

    while (tokens.length > 0) {
        const token = tokens.shift();
        if (token[0] === '-') {
            if (token[1] === '-') {
                const next = tokens.shift();
                args[token.slice(2)] = next;
            } else {
                token.slice(1).split('').forEach(flag => {
                    flags[flag] = true;
                });
            }
        } else {
            args[anonArgPos++] = token;
        }
    }
    return { name, flags, input, args };
}

/*
 * This function splits the input by `&&`` creating a
 * dependency chain. The chain consists of a list of
 * other commands to be run.
 *
 * @param {string} input - the user input
 * @returns {Array} a list of lists of command/arg pairs
 *
 * Example: `cd dir1; cat file.txt && pwd`
 * In this example `pwd` should only be run if dir/file.txt
 * is a readable file. The corresponding response would look
 * like this, where the outer list is the dependent lists..
 *
 * [
 *   [
 *     { command: 'cd', args: { 0: 'dir1'} },
 *     { command: 'cat', args: { 0: 'file.txt'} }
 *   ],
 *   [
 *     { command: 'pwd' }
 *   ]
 * ]
 */
export function parse(inputs) {
    return inputs.trim().split(/ *&& */)
        .map(deps => deps.split(/ *; */).map(parseInput));
}
