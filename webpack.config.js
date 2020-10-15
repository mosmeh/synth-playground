const path = require('path');
const process = require('process');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.jsx'),
    output: {
        path: path.resolve(__dirname, 'public'),
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'public'),
        open: true,
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css', '.ttf'],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ttf$/,
                use: 'file-loader',
            },
        ],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                exclude: /^examples\/.+\.js$/,
            }),
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src', 'index.html'),
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src', 'examples'),
                    to: 'examples',
                    globOptions: {
                        ignore: ['**/index.js'],
                    },
                },
            ],
        }),
        new MonacoWebpackPlugin({
            languages: ['typescript', 'javascript'],
        }),
    ],
};

if (process.env.NODE_ENV !== 'production') {
    module.exports.devtool = 'inline-source-map';
}
