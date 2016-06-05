# \<ReactBash /\>

ReactBash is a configurable / extendable bash terminal component. It provides an easy way of adding a terminal to your application. The terminal has a few built in base commands, and allows a simple means of extending the understandable commands. It boasts things like autocomplete on tab, previous command navigation, and a test suite you can trust. It is easy to install and get started.

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
The `extension` prop is an easy way to extend the bash commands that can be parsed from the terminal input. In essence, each command is a state reducer returning a new terminal state. This provides a lot of flexibility. Each command has access to the `structure`, `history`, and `cwd`, and expects the object returned to be applied in `setState` of the React component. Note that each extension should keep the state immutable, otherwise the component will not update. If we were to extend the commands with and existing command like 'clear, here's how we could do it.

```js
export const clear = {
    exec: ({ structure, history, cwd }, args) => {
        return { structure, cwd, history: [] };
    },
};
const extensions = { clear };
<ReactBash extensions={extensions} />
```

Each command is given the `state` and a parsed `args` object. Some commands can use optional or required arguments. ReactBash uses the [yargs](https://www.npmjs.com/package/yargs) approach. There are three types of arguments: `anonymous` args, `boolean` args (--), and `named` args (-). You can also alias commands for shorthands or multiple ways of writing the same argument (see the ls command for an example). To see how ReactBash parses the input, check out this fictional example that utilizes all three in order.

For the input `foo some/path --bar -hello world`, ReactBash would parse the input as:
```js
command = 'foo'
args = {
    0: 'some/path',
    bar: true,
    hello: 'world'
}
```

### History
The history prop and state arrays are lists of items that will be displayed as history items in the terminal. Essentially, anything that gets 'printed' out onto the terminal is a `history` item. The `prefix` prop is available to alter the bash user info that prepends commands in the history. If you'd like to add a welcome message to the initial state of the terminal, it's as easy as passing in a prop.

```js
const history = [{ value: 'Welcome to the terminal!' }];
<ReactBash history={history}  />
```

### Structure
The structure object is a representation of the "file system" found within the terminal. It is what is used to navigate into/out of directories, display file contents, and suggesting autocompletions. Each key in the dict is either a `directory` or a `file`. If the object has a `content` field then it is assumed to be a `file`. This simplified the interface and makes it easier to get started. Here's an example of what a `structure` might look like.

```js
const structure = {
    src: {
        file1: { content: 'This is the text content for <file1> of <src>' },
        file2: { content: 'This is the text content for <file2> of <src>' },
        childDir1: {
            file: { content: 'This is the text content for <file> of <src/childDir1>' },
        },
        childDir2: {
        }
    },
    '.hiddenDir': {
    },
    '.hiddenFile': { content: 'This is a hidden file' },
    file: { content: 'This is the text content for <file> of the root directory' },
};

```

### Scripts
script         | description
-------------- | -----------
`npm start`    | run the demo on `localhost:3000`
`npm run test` | run the test suite
`npm run lint` | run the linter

### Patrons
* [Derek Stavis](https://github.com/derekstavis)

>Be the second to contribute!
>✌⊂(✰‿✰)つ✌

**Some ideas for contributions:**
* Add `echo` command with environment variables?
* Add `grep` command that walks/searches the `structure`
* Add `whoami` command
* Add handles for the three circles at the top left of the terminal
* Add multiline support / text formatting for `cat`

## License
[MIT](http://isekivacenz.mit-license.org/)
