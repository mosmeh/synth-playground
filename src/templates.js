import DEFAULT_SCRIPT from '!!raw-loader!./examples/persistent-sine';

export { DEFAULT_SCRIPT };

export const NEW_SCRIPT = [
    'function loop(bufferSize, outL, outR) {',
    '    for (let i = 0; i < bufferSize; ++i) {',
    '        ',
    '    }',
    '}',
    '',
].join('\n');
