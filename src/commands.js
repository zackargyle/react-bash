import * as Util from './util';
import { Errors } from './const';

const helpCommands = ['clear', 'ls', 'cat', 'mkdir', 'cd', 'pwd'];

export const help = {
    exec: ({ history, structure, cwd }) => {
        return { structure, cwd,
            history: history.concat(
                { value: 'React-bash:' },
                { value: 'These shell commands are defined internally.  Type \'help\' to see this list.' },
                ...helpCommands.map(value => ({ value }))
            ),
        };
    },
};

export const clear = {
    exec: ({ structure, cwd }) => {
        return { structure, cwd, history: [] };
    },
};

export const ls = {
    exec: (state, args) => {
        const { history, structure, cwd } = state;
        const path = args[0] || '';
        const fullPath = Util.extractPath(path, cwd);
        const { err, dir } = Util.getDirectoryByPath(structure, fullPath);

        if (err) {
            return Util.appendError(state, err, path);
        } else {
            let content = Object.keys(dir);
            if (!args.flags.a) {
                content = content.filter(name => name[0] !== '.');
            }
            if (args.flags.l) {
                return { structure, cwd,
                    history: history.concat(content.map(value => {
                        return { value };
                    })),
                };
            } else {
                return { structure, cwd,
                    history: history.concat({ value: content.join(' ') }),
                };
            }
        }
    },
};

export const cat = {
    exec: (state, args) => {
        const { history, structure, cwd } = state;
        const path = args[0];
        const relativePath = path.split('/');
        const fileName = relativePath.pop();
        const fullPath = Util.extractPath(relativePath.join('/'), cwd);
        const { err, dir } = Util.getDirectoryByPath(structure, fullPath);
        if (err) {
            return Util.appendError(state, err, path);
        } else if (!dir[fileName]) {
            return Util.appendError(state, Errors.NO_SUCH_FILE, path);
        } else if (!dir[fileName].hasOwnProperty('content')) {
            return Util.appendError(state, Errors.IS_A_DIRECTORY, path);
        } else {
            return { cwd, structure,
                history: history.concat({
                    value: dir[fileName].content,
                }),
            };
        }
    },
};

export const mkdir = {
    exec: (state, args) => {
        const { history, structure, cwd } = state;
        const path = args[0];
        const relativePath = path.split('/');
        const newDirectory = relativePath.pop();
        const fullPath = Util.extractPath(relativePath.join('/'), cwd);
        const deepCopy = JSON.parse(JSON.stringify(structure));
        const { dir } = Util.getDirectoryByPath(deepCopy, fullPath);

        if (dir[newDirectory]) {
            return Util.appendError(state, Errors.FILE_EXISTS, path);
        } else {
            dir[newDirectory] = {};
            return { cwd, history, structure: deepCopy };
        }
    },
};

export const cd = {
    exec: (state, args) => {
        const { history, structure, cwd } = state;
        const path = args[0];
        if (!path || path === '/') {
            return { structure, history, cwd: '' };
        }

        const fullPath = Util.extractPath(path, cwd);
        const { err } = Util.getDirectoryByPath(structure, fullPath);

        if (err) {
            return Util.appendError(state, err, path);
        } else {
            return { history, structure, cwd: fullPath };
        }
    },
};

export const pwd = {
    exec: (state) => {
        const { history, structure, cwd } = state;
        const directory = `/${cwd}`;

        return {
            cwd, structure,
            history: history.concat({ value: directory }),
        };
    },
};
