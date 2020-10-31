// Based on http://amid.fish/karplus-strong
// http://amid.fish/assets/karplus-strong-algorithm/simpleks.js

const AMP = 0.6;
let t = 0;

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Frequency',
                defaultValue: 110,
                minValue: 50,
                maxValue: 1000,
            },
            {
                name: 'Cutoff',
                defaultValue: 0.5,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }
    process(_, outputs, params) {
        const freq = params['Frequency'][0];
        const cutoff = params['Cutoff'][0];

        const period = 1 / freq;
        setDelayTime(period);

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            let x = t < period ? 2 * Math.random() - 1 : 0;
            x += filter(delayOutput(), cutoff);
            delayInput(x);
            outL[i] = outR[i] = AMP * x;
            t += 1 / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);

const delay = new Float32Array(2048);
let readPtr = 0;
let writePtr = 0;

function setDelayTime(time) {
    writePtr = (readPtr + time * sampleRate) & 2047;
}

function delayInput(x) {
    delay[writePtr] = x;
    readPtr = (readPtr + 1) & 2047;
    writePtr = (writePtr + 1) & 2047;
}

function delayOutput() {
    return delay[readPtr];
}

let y1 = 0;

function filter(x, cutoff) {
    const y = cutoff * x + (1 - cutoff) * y1;
    y1 = y;
    return y;
}
