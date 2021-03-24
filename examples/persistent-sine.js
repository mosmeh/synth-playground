const AMP = 0.3;
const phase = [0, 0];

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Frequency',
                defaultValue: 440,
                minValue: 50,
                maxValue: 1000,
            },
            {
                name: 'Detune',
                defaultValue: 2,
                minValue: 0,
                maxValue: 10,
            },
        ];
    }
    process(_, outputs, params) {
        const freq = params['Frequency'][0];
        const detune = params['Detune'][0];

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            outL[i] = AMP * Math.sin(phase[0]);
            outR[i] = AMP * Math.sin(phase[1]);
            phase[0] += (2 * Math.PI * freq) / sampleRate;
            phase[1] += (2 * Math.PI * (freq + detune)) / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);
