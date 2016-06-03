import { Errors, BACK_REGEX } from './const';

export function trim(str, char) {
    if (str[0] === char) {
        str = str.substr(1);
    }
    if (str[str.length - 1] === char) {
        str = str.substr(0, str.length - 1);
    }
    return str;
}

export function reportError(state, error, command) {
    return Object.assign({}, state, {
        history: state.history.concat({
            value: error.replace('$1', command),
        }),
    });
}

/*
 * This is a utility method for chaining the relativePath
 * onto the rootPath. It includes backwards movement and
 * normalization.
 */
export function extractPath(relativePath, rootPath) {
    // Short circuit for relative path
    if (relativePath === '') return rootPath;

    // Strip trailing slash
    relativePath = trim(relativePath, '/');

    // Create raw path
    let path = `${rootPath ? rootPath + '/' : ''}${relativePath}`;

    // Strip ../ references
    while (path.match(BACK_REGEX)) {
        path = path.replace(BACK_REGEX, '');
    }
    return trim(path, '/');
}

/*
 * This is a utility method for traversing the <structure>
 * down the '/' separated <relativePath>
 */
export function getDirectoryByPath(structure, relativePath) {
    const path = relativePath.split('/');

    // Short circuit for empty root path
    if (!path[0]) return { dir: structure };

    let dir = structure;
    let i = 0;
    while (i < path.length) {
        const key = path[i];
        const child = dir[key];
        if (child && typeof child === 'object') {
            if (child.content) {
                return { err: Errors.NOT_A_DIRECTORY.replace('$1', relativePath) };
            } else {
                dir = child;
            }
        } else {
            return { err: Errors.NO_SUCH_FILE.replace('$1', relativePath) };
        }
        i++;
    }
    return { dir };
}
