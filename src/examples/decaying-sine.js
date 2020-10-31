const AMP = 0.4;
let t = 0;
const phase = [0, 0];

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Frequency',
                defaultValue: 880,
                minValue: 50,
                maxValue: 1000,
            },
            {
                name: 'Detune',
                defaultValue: 2,
                minValue: 0,
                maxValue: 10,
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
        const freq = params['Frequency'][0];
        const detune = params['Detune'][0];
        const release = params['Release'][0];

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            const env = Math.exp(-t / release);
            outL[i] = AMP * env * Math.sin(phase[0]);
            outR[i] = AMP * env * Math.sin(phase[1]);
            t += 1 / sampleRate;
            phase[0] += (2 * Math.PI * freq) / sampleRate;
            phase[1] += (2 * Math.PI * (freq + detune)) / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);
