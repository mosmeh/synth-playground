module.exports = {
    env: {
        browser: true,
        es2020: true,
    },
    plugins: ['react', 'react-hooks'],
    extends: [
        'google',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
    ],
    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        'require-jsdoc': 'off',
        'react/prop-types': 'off',
    },
    overrides: [
        {
            files: ['src/examples/*.js'],
            rules: {
                'no-unused-vars': [
                    'error',
                    {
                        varsIgnorePattern: 'loop',
                    },
                ],
            },
        },
    ],
};
