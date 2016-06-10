const BaseStyles = {};

BaseStyles.ReactBash = {
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '\'Inconsolata\', monospace',
    fontSize: '13px',
    fontWeight: '400',
    height: '100%',
    overflow: 'hidden',
    textAlign: 'left',
};

BaseStyles.header = {
    padding: '5px 10px 0',
};

const circle = {
    borderRadius: '50%',
    display: 'inline-block',
    height: '15px',
    marginRight: '5px',
    width: '15px',
};

BaseStyles.redCircle = Object.assign({}, circle, {
    backgroundColor: '#bf616a',
});

BaseStyles.yellowCircle = Object.assign({}, circle, {
    backgroundColor: '#ebcb8b',
});

BaseStyles.greenCircle = Object.assign({}, circle, {
    backgroundColor: '#a3be8c',
});

BaseStyles.body = {
    flexGrow: 1,
    overflowY: 'scroll',
    padding: '10px',
};

BaseStyles.form = {
    display: 'flex',
};

BaseStyles.input = {
    background: 'none',
    border: 'none',
    color: 'inherit',
    flexGrow: '1',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    outline: 'none !important',
    padding: 0,
};

BaseStyles.prefix = {
    marginRight: '5px',
};

export default {
    light: Object.assign({}, BaseStyles, {
        body: Object.assign({}, BaseStyles.body, {
            backgroundColor: '#fff',
            color: '#5D5D5D',
        }),
        header: Object.assign({}, BaseStyles.header, {
            backgroundColor: '#eee',
        }),
        prefix: Object.assign({}, BaseStyles.prefix, {
            color: '#bd081c',
        }),
    }),
    dark: Object.assign({}, BaseStyles, {
        body: Object.assign({}, BaseStyles.body, {
            backgroundColor: '#000',
            color: '#d0d0d0',
        }),
        header: Object.assign({}, BaseStyles.header, {
            backgroundColor: '#dcdbdb',
        }),
        prefix: Object.assign({}, BaseStyles.prefix, {
            color: '#5b65fb',
        }),
    }),
};
