// Based on https://mohayonao.github.io/web-audio-sound-examples/#hihat/2

const AMP = 0.8;
const VOLUMES = [0.25, 0.05, 0.125, 0.075];
let t = 0;
let counter = 0;
let volume = VOLUMES[0];

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Tempo',
                defaultValue: 120,
                minValue: 50,
                maxValue: 200,
            },
            {
                name: 'Pattern',
                defaultValue: 4,
                minValue: 1,
                maxValue: 4,
            },
            {
                name: 'Release',
                defaultValue: 0.01,
                minValue: 0,
                maxValue: 0.1,
            },
        ];
    }
    process(_, outputs, params) {
        const interval = 60 / (params['Tempo'][0] * VOLUMES.length);
        const patternLength = Math.floor(params['Pattern'][0]);
        const release = params['Release'][0];

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            const v = AMP * volume * Math.exp(-t / release);
            outL[i] = v * (2 * Math.random() - 1);
            outR[i] = v * (2 * Math.random() - 1);

            t += 1 / sampleRate;
            if (t > interval) {
                t = 0;
                volume = VOLUMES[++counter % patternLength];
            }
        }
        return true;
    }
}

registerProcessor('main', Processor);
