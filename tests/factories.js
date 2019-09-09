
export function stateFactory(state = {}) {
    return {
        settings: { user: { username: 'default' } },
        cwd: state.cwd || '',
        structure: state.structure || {
            '.privateDir': {
                childDir: {},
            },
            '.privateFile': { content: 'Private File contents' },
            file1: { content: 'file1' },
            multilinefile1: { content: 'file2\nhasfour\nnewlines\n \n' },
            dir1: {
                childDir: {
                    childDirFile: { content: 'childDirFile' },
                },
                dir1File: { content: 'dir1File' },
            },
        },
        history: state.history || [],
    };
}
