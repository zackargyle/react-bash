/* eslint-disable */
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');

const port = process.env.PORT || 3000;

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
}).listen(port, 'localhost', err => {
    if (err) {
        console.log(err);
    }
    console.log(`Listening at localhost:${port}`);
});
