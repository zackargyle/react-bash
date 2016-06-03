import React from 'react';
import ReactDOM from 'react-dom';
import ReactBash from '../src/index';

const extensions = {
    sudo: {
        exec: ({ structure, history, cwd }) => {
            return { structure, cwd,
                history: history.concat({ value: 'Nice try... (ಠ(ಠ(ಠ_ಠ)ಠ)ಠ)' }),
            };
        },
    },
};

const history = [
    { value: 'Hackers will be high-fived. ( ‘-’)人(ﾟ_ﾟ )' },
    { value: 'Type `help` to begin' },
];

const structure = {
    private: {
        file1: { content: 'File1 in private' },
        file2: { content: 'File2 in private' },
        dir2: {
            file: { content: 'File in private/dir2' },
        },
    },
    public: {
        file1: { content: 'File2 in public' },
        file2: { content: 'File2 in public' },
        file3: { content: 'File2 in public' },
    },
    README: { content: 'This is a demo README. ✌⊂(✰‿✰)つ✌' },
};

const Root = <ReactBash history={history} structure={structure} extensions={extensions} />;
ReactDOM.render(Root, document.getElementById('app'));
