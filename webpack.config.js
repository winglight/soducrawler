var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
    entry: [
        './js/admin.js',
    ],
    output: {
        path: __dirname + "/dist",
        filename: "admin.js",
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel' },
            { test: /\.html$/, loader: 'html' },
            { test: /\.(woff2?|svg|ttf|eot)(\?.*)?$/, loader: 'url' },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'index.html'),
            inject: true,
            hash: true,
            filename: 'index.html',
        }),
    ],
    externals: {
        'text-encoding': 'window'
    }
};
