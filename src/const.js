export const BACK_REGEX = /\/?[\w-_]+\/\.\./;

export const Errors = {
    COMMAND_NOT_FOUND: '-bash: $1: command not found',
    FILE_EXISTS: 'mkdir: $1: File exists',
    NO_SUCH_FILE: '-bash: cd: $1: No such file or directory',
    NOT_A_DIRECTORY: '-bash: cd: $1: Not a directory',
    IS_A_DIRECTORY: 'cat: $1: Is a directory',
};
