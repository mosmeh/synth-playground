const path = require('path');
const process = require('process');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
                test: /\.jsx?$/i,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '',
                        },
                    },
                    'css-loader',
                ],
            },
            {
                test: /\.ttf$/i,
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
        new MiniCssExtractPlugin(),
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
