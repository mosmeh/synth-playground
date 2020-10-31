const AMP = 0.1;
const NOTES = [60, 64, 67, 71];
let t = 0;
const phase = new Float32Array(4);

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Transpose',
                defaultValue: 0,
                minValue: -12,
                maxValue: 12,
            },
            {
                name: 'Poly',
                defaultValue: 4,
                minValue: 1,
                maxValue: 4,
            },
            {
                name: 'Release',
                defaultValue: 0.2,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }
    process(_, outputs, params) {
        const transpose = Math.trunc(params['Transpose'][0]);
        const poly = Math.floor(params['Poly'][0]);
        const release = params['Release'][0];

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            let x = 0;
            for (let p = 0; p < poly; ++p) {
                x += saw(phase[p]);
            }
            outL[i] = outR[i] = AMP * Math.exp(-t / release) * x;
            t += 1 / sampleRate;
            NOTES.forEach((note, i) => {
                phase[i] += midicps(note + transpose) / sampleRate;
            });
        }
        return true;
    }
}

registerProcessor('main', Processor);

function saw(phase) {
    return 2 * (phase % 1) - 1;
}

function midicps(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}
