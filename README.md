# ReactBash

ReactBash is a configurable/extendable bash terminal component.  

It provides a simple interface for adding a terminal to your application. The terminal has a few built in base commands, and allows a simple means of extending the understandable commands. It boasts things like autocomplete on tab, previous command navigation, and a test suite you can trust. It is easy to install and get started.

```
npm install --save react-bash
```

Try out the [DEMO](http://zackargyle.github.io/react-bash/)

![](https://raw.githubusercontent.com/zackargyle/react-bash/master/demo/screenshot.png)

### Props
prop         | description
------------ | -----------
`extensions` | An object of bash command extensions
`history`    | An array of initial history items
`structure`  | An object representing the file system
`prefix`     | The string used to prefix commands in history: defaults to `hacker@default`

### Extending the command list
The `extension` prop is an easy way to extend the bash commands that can be parsed from the terminal input. In essence, each command is a state reducer returning a new terminal state. This provides a lot of flexibility. Each command has access to the `structure`, `history`, and `cwd`, and expects the object returned to be applied in `setState` of the React component. Note that each extension should keep the state immutable, otherwise the component will not update. Check out the code for the `clear` command as an example.

```js
export const clear = {
    exec: ({ structure, history, cwd }) => {
        return { structure, cwd, history: [] };
    },
};
```

Some commands can use optional or required arguments. ReactBash uses the [yargs](https://www.npmjs.com/package/yargs) approach provides an `args` object to each command. There are three types of arguments: `anonymous` args, `boolean` args (--), and `named` args (-). As an example of how ReactBash parses the commands, check out this fictional example that utilizes all three in order.

```js
const input = 'foo some/path --bar -hello world';
const { command, args } = bash.parseInput(input);

command === 'foo'
args = {
    0: 'some/path',
    bar: true,
    hello: 'world'
}
```

### History
The history prop and state arrays are lists of items that will be displayed as history items in the terminal. If you'd like to add a welcome message to the initial state of the terminal, it's as easy as passing in a prop.

```js
const history = [{ value: 'Welcome to the terminal!' }];
<ReactBash history={history}  />
```

### Structure
The structure object is a representation of the "file system" found within the terminal. It is what is used to navigate into/out of directories, display file contents, and suggesting autocompletions. Each key in the dict is either a `directory` or a `file`. If the object has a `content` field then it is assumed to be a `file`. This simplified the interface and makes it easier to get started. Here's an example of what a `structure` might look like.

```js
const structure = {
    rootDir: {
        file1: { content: 'File1 in rootDir' },
        file2: { content: 'File2 in rootDir' },
        childDir1: {
            file: { content: 'File in rootDir/childDir1' },
        },
        childDir2: {}
    },
    rootFile: { content: 'Contents for the root file' },
};

```

### Scripts
script         | description
-------------- | -----------
`npm start`    | run the demo on `localhost:3000`
`npm run test` | run the test suite
`npm run lint` | run the linter

### Patrons
Be the first to contribute!
✌⊂(✰‿✰)つ✌

## License
[MIT](http://isekivacenz.mit-license.org/)