// Based on https://webaudio.prototyping.bbc.co.uk/gunfire/

let t = 0;

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Cutoff',
                defaultValue: 800,
                minValue: 0,
                maxValue: 2000,
            },
        ];
    }
    process(_, outputs, params) {
        calcFilterCoefs(params['Cutoff'][0], 1);

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            outL[i] = outR[i] = filter(envelope(t) * noise());
            t += 1 / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);

function noise() {
    return 2 * Math.random() - 1;
}

function envelope(t) {
    if (t < 0.001) {
        return t / 0.001;
    } else if (t < 0.101) {
        return 1 - (0.7 * (t - 0.001)) / 0.1;
    } else if (t < 0.5) {
        return 0.3 - (0.3 * (t - 0.101)) / 0.399;
    } else {
        return 0;
    }
}

const b = new Float32Array(3);
const a = new Float32Array(3);

function calcFilterCoefs(freq, q) {
    const omega = (2 * Math.PI * freq) / sampleRate;
    const alpha = Math.sin(omega) / (2 * Math.pow(10, q / 20));
    b[0] = (1 - Math.cos(omega)) / 2;
    b[1] = b[0] * 2;
    b[2] = b[0];
    a[0] = 1 + alpha;
    a[1] = -2 * Math.cos(omega);
    a[2] = 1 - alpha;
}

let x1 = 0;
let x2 = 0;
let y1 = 0;
let y2 = 0;

function filter(x) {
    const y = (b[0] * x + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2) / a[0];
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
}
