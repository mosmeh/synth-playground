// Adapted from  http://noisehack.com/generate-noise-web-audio-api/

const AMP = 0.2;

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Pink',
                defaultValue: 1,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }
    process(_, outputs, params) {
        const mix = params['Pink'][0];

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            const white = Math.random() * 2 - 1;
            const x = (1 - mix) * white + mix * pinkFilter(white);
            outL[i] = outR[i] = AMP * x;
        }
        return true;
    }
}

registerProcessor('main', Processor);

const b = new Float32Array(7);

function pinkFilter(white) {
    b[0] = 0.99886 * b[0] + white * 0.0555179;
    b[1] = 0.99332 * b[1] + white * 0.0750759;
    b[2] = 0.969 * b[2] + white * 0.153852;
    b[3] = 0.8665 * b[3] + white * 0.3104856;
    b[4] = 0.55 * b[4] + white * 0.5329522;
    b[5] = -0.7616 * b[5] - white * 0.016898;

    const out = b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362;
    b[6] = white * 0.115926;
    return out * 0.11;
}
