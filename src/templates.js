import DEFAULT_SCRIPT from '!!raw-loader!./examples/persistent-sine';

export { DEFAULT_SCRIPT };

export const NEW_SCRIPT = [
    'class Processor extends AudioWorkletProcessor {',
    '    process(_, outputs) {',
    '        const outL = outputs[0][0];',
    '        const outR = outputs[0][1];',
    '        for (let i = 0; i < outL.length; ++i) {',
    '            ',
    '        }',
    '        return true;',
    '    }',
    '}',
    '',
    "registerProcessor('main', Processor);",
    '',
].join('\n');
