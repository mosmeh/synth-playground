// Based on https://mohayonao.github.io/web-audio-sound-examples/#fm-bell/1

const AMP = 0.2;
const DURATION = 4;
const T1 = DURATION * 0.5;
const T2 = T1 + DURATION * 0.5;
const NOTE = 60;

let t = 0;
let phase1 = 0;
let phase2 = 0;

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Color',
                defaultValue: 8,
                minValue: 0,
                maxValue: 30,
            },
            {
                name: 'Transpose',
                defaultValue: 0,
                minValue: -12,
                maxValue: 12,
            },
        ];
    }
    process(_, outputs, params) {
        const color = params['Color'][0];
        const transpose = Math.trunc(params['Transpose'][0]);
        const freq = mtof(NOTE + transpose);

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            const op2 =
                Math.sin(phase2) *
                freq *
                (color + (1 - color) * Math.min(1, t / T1));
            const op1 = Math.sin(phase1) * Math.max(0, 1 - t / T2);
            outL[i] = outR[i] = AMP * op1;

            phase2 += (2 * Math.PI * 3.5 * freq) / sampleRate;
            phase1 += (2 * Math.PI * (freq + op2)) / sampleRate;
            t += 1 / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);

function mtof(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}
