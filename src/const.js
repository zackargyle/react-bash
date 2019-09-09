export const IS_SERVER = typeof window === 'undefined';

export const BACK_REGEX = /\/?\.?[\w-_]+\/\.\./;

export const Errors = {
    COMMAND_NOT_FOUND: '-bash: $1: command not found',
    FILE_EXISTS: 'mkdir: $1: File exists',
    NO_SUCH_FILE: '-bash: cd: $1: No such file or directory',
    NOT_A_DIRECTORY: '-bash: cd: $1: Not a directory',
    IS_A_DIRECTORY: 'cat: $1: Is a directory',
};

export const EnvVariables = {
    TERM_PROGRAM: 'ReactBash.app',
    TERM: 'reactbash-256color',
    TERM_PROGRAM_VERSION: '1.6.0',
    TERM_SESSION_ID: 'w0t0p1:37842145-87D9-4768-BEC3-3684BAF3A964',
    USER: state => state.settings.user.username,
    PATH: '/',
    PWD: state => `/${state.cwd}`,
    LANG: () => {
        return !IS_SERVER ? `${navigator.language.replace('-', '_')}.UTF-8` : 'en_US.UTF-8';
    },
    HOME: '/',
    LOGNAME: state => state.settings.user.username,
    OLDPWD: '/',
};
