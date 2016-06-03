import React, { Component, PropTypes } from 'react';
import Bash from './bash';
import Prefix from './prefix';
import * as Styles from './styles';

const CTRL_CHAR_CODE = 17;
const L_CHAR_CODE = 76;
const UP_CHAR_CODE = 38;
const DOWN_CHAR_CODE = 40;
const TAB_CHAR_CODE = 9;

export default class ReactBash extends Component {

    constructor({ history, structure, extensions }) {
        super();
        this.Bash = new Bash(extensions);
        this.ctrlPressed = false;
        this.state = {
            history: history.slice(),
            structure: Object.assign({}, structure),
            cwd: '',
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.renderHistoryItem = this.renderHistoryItem.bind(this);
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    /*
     * Utilize immutability
     */
    shouldComponentUpdate(nextProps, nextState) {
        return (this.state !== nextState) || (this.props !== nextProps);
    }

    /*
     * Grab last word and attempt to autocomplete. If it works,
     * update the input.
     */
    attemptAutocomplete() {
        const tokens = this.refs.input.value.split(/ +/);
        const command = this.Bash.autocomplete(tokens.pop(), this.state);
        if (command) {
            this.refs.input.value = tokens.concat(command).join(' ');
        }
    }

    /*
     * Handle keydown for special hot keys. The tab key
     * has to be handled on key down to prevent default.
     * @param {Event} evt - the DOM event
     */
    handleKeyDown(evt) {
        if (evt.which === CTRL_CHAR_CODE) {
            this.ctrlPressed = true;
        } else if (evt.which === TAB_CHAR_CODE) {
            // Tab must be on keydown to prevent default
            this.attemptAutocomplete();
            evt.preventDefault();
        }
    }

    /*
     * Handle keyup for special hot keys.
     * @param {Event} evt - the DOM event
     *
     * -- Supported hot keys --
     * ctrl + l : clear
     * up - prev command from history
     * down - next command from history
     * tab - autocomplete
     */
    handleKeyUp(evt) {
        if (evt.which === L_CHAR_CODE) {
            if (this.ctrlPressed) {
                this.setState(this.Bash.execute('clear', this.state));
            }
        } else if (evt.which === UP_CHAR_CODE) {
            if (this.Bash.hasPrevCommand()) {
                this.refs.input.value = this.Bash.getPrevCommand();
            }
        } else if (evt.which === DOWN_CHAR_CODE) {
            if (this.Bash.hasNextCommand()) {
                this.refs.input.value = this.Bash.getNextCommand();
            } else {
                this.refs.input.value = '';
            }
        } else if (evt.which === CTRL_CHAR_CODE) {
            this.ctrlPressed = false;
        }
    }

    handleSubmit(evt) {
        evt.preventDefault();

        // Execute command
        const input = evt.target[0].value;
        const newState = this.Bash.execute(input, this.state);
        this.setState(newState);
        this.refs.input.value = '';
    }

    renderHistoryItem(item, key) {
        const prefix = item.hasOwnProperty('cwd') ? (
            <Prefix cwd={item.cwd} prefix={this.props.prefix} />
        ) : undefined;
        return <div data-test-id={`history-${key}`} key={key} >{prefix}{item.value}</div>;
    }

    render() {
        const { prefix } = this.props;
        const { history, cwd } = this.state;
        return (
            <div className="ReactBash" style={Styles.ReactBash}>
                <div style={Styles.header}>
                    <span style={Styles.redCircle}></span>
                    <span style={Styles.yellowCircle}></span>
                    <span style={Styles.greenCircle}></span>
                </div>
                <div style={Styles.body} onClick={() => this.refs.input.focus()}>
                    {history.map(this.renderHistoryItem)}
                    <form onSubmit={evt => this.handleSubmit(evt)} style={Styles.form}>
                        <Prefix cwd={cwd} prefix={prefix} />
                        <input
                          autoComplete="off"
                          onKeyDown={this.handleKeyDown}
                          onKeyUp={this.handleKeyUp}
                          ref="input"
                          style={Styles.input}
                        />
                    </form>
                </div>
            </div>
        );
    }
}

ReactBash.propTypes = {
    extensions: PropTypes.object,
    history: PropTypes.array,
    structure: PropTypes.object,
    prefix: PropTypes.string,
};

ReactBash.defaultProps = {
    extensions: {},
    history: [],
    structure: {},
    prefix: 'hacker@default',
};

/*
    - make story
    - disable React developer tools
    - "echo $PATH"
    - "exit"
    - grep
    - tail
    - whoami
    - text formatting
*/
