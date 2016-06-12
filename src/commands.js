import * as Util from './util';
import { Errors } from './const';

const helpCommands = ['clear', 'ls', 'cat', 'mkdir', 'cd', 'pwd', 'echo', 'printenv'];

export const help = {
    exec: (state) => {
        return Object.assign({}, state, {
            history: state.history.concat(
                { value: 'React-bash:' },
                { value: 'These shell commands are defined internally.  Type \'help\' to see this list.' },
                ...helpCommands.map(value => ({ value }))
            ),
        });
    },
};

export const clear = {
    exec: (state) => {
        return Object.assign({}, state, { history: [] });
    },
};

export const ls = {
    exec: (state, args) => {
        const path = args[0] || '';
        const fullPath = Util.extractPath(path, state.cwd);
        const { err, dir } = Util.getDirectoryByPath(state.structure, fullPath);

        if (err) {
            return Util.appendError(state, err, path);
        } else {
            let content = Object.keys(dir);
            if (!args.$flags.a) {
                content = content.filter(name => name[0] !== '.');
            }
            if (args.$flags.l) {
                return Object.assign({}, state, {
                    history: state.history.concat(content.map(value => {
                        return { value };
                    })),
                });
            } else {
                return Object.assign({}, state, {
                    history: state.history.concat({ value: content.join(' ') }),
                });
            }
        }
    },
};

export const cat = {
    exec: (state, args) => {
        const path = args[0];
        const relativePath = path.split('/');
        const fileName = relativePath.pop();
        const fullPath = Util.extractPath(relativePath.join('/'), state.cwd);
        const { err, dir } = Util.getDirectoryByPath(state.structure, fullPath);
        if (err) {
            return Util.appendError(state, err, path);
        } else if (!dir[fileName]) {
            return Util.appendError(state, Errors.NO_SUCH_FILE, path);
        } else if (!dir[fileName].hasOwnProperty('content')) {
            return Util.appendError(state, Errors.IS_A_DIRECTORY, path);
        } else {
            return Object.assign({}, state, {
                history: state.history.concat({
                    value: dir[fileName].content,
                }),
            });
        }
    },
};

export const mkdir = {
    exec: (state, args) => {
        const path = args[0];
        const relativePath = path.split('/');
        const newDirectory = relativePath.pop();
        const fullPath = Util.extractPath(relativePath.join('/'), state.cwd);
        const deepCopy = JSON.parse(JSON.stringify(state.structure));
        const { dir } = Util.getDirectoryByPath(deepCopy, fullPath);

        if (dir[newDirectory]) {
            return Util.appendError(state, Errors.FILE_EXISTS, path);
        } else {
            dir[newDirectory] = {};
            return Object.assign({}, state, { structure: deepCopy });
        }
    },
};

export const cd = {
    exec: (state, args) => {
        const path = args[0];
        if (!path || path === '/') {
            return Object.assign({}, state, { cwd: '' });
        }

        const fullPath = Util.extractPath(path, state.cwd);
        const { err } = Util.getDirectoryByPath(state.structure, fullPath);

        if (err) {
            return Util.appendError(state, err, path);
        } else {
            return Object.assign({}, state, { cwd: fullPath });
        }
    },
};

export const pwd = {
    exec: (state) => {
        const directory = `/${state.cwd}`;
        return Object.assign({}, state, {
            history: state.history.concat({ value: directory }),
        });
    },
};

export const echo = {
    exec: (state, { $input }) => {
        const ECHO_LENGTH = 'echo '.length;
        const envVariables = Util.getEnvVariables(state);
        const value = $input.slice(ECHO_LENGTH).replace(/(\$\w+)/g, key => {
            return envVariables[key.slice(1)] || '';
        });
        return Object.assign({}, state, {
            history: state.history.concat({ value }),
        });
    },
};

export const printenv = {
    exec: (state) => {
        const envVariables = Util.getEnvVariables(state);
        const values = Object.keys(envVariables).map(key => {
            return { value: `${key}=${envVariables[key]}` };
        });
        return Object.assign({}, state, {
            history: state.history.concat(values),
        });
    },
};
