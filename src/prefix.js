import React, { Component, PropTypes } from 'react';
import * as Styles from './styles';

export default class Prefix extends Component {
    render() {
        const { cwd, prefix } = this.props;
        return <span style={Styles.prefix}>{`${prefix} ~${cwd} $`}</span>;
    }
}

Prefix.propTypes = {
    cwd: PropTypes.string.isRequired,
    prefix: PropTypes.string.isRequired,
};
