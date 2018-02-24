const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript');

module.exports = {

    input: './index.ts',

    output: {
        file: 'index.js',
        format: 'cjs'
    },

    external: [ // Supresses native module external dependency warnings
        'crypto',
        'https'
    ],

    plugins: [
        resolve({
            extensions: ['.js', '.json']
        }),
        commonjs(),
        typescript({
            typescript: require('typescript') // Override TS version, cuz v1.8.9 is used by default
        })
    ]

};
