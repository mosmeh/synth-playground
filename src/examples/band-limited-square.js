// Based on https://mohayonao.github.io/web-audio-sound-examples/#coin/1

const AMP = 0.2;
let t = 0;
let phase = 0;

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Duty cycle',
                defaultValue: 0.5,
                minValue: 0,
                maxValue: 1,
            },
            {
                name: 'PolyBLEP',
                defaultValue: 1,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }
    process(_, outputs, params) {
        const duty = params['Duty cycle'][0];
        const mix = params['PolyBLEP'][0];

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            const freq = t < 0.075 ? 990 : 1320;
            const env = t < 0.075 ? 1 : Math.max(0, 1 - (t - 0.075) / 0.825);
            const x =
                (1 - mix) * square(phase, duty) +
                mix * polyBlepSquare(phase, freq / sampleRate, duty);
            outL[i] = outR[i] = AMP * env * x;
            t += 1 / sampleRate;
            phase += freq / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);

function square(phase, duty = 0.5) {
    return phase % 1 < duty ? 1 : -1;
}

// Based on https://github.com/Archie3d/qmusic/blob/master/source/plugins/au-generator/src/Generator.cpp

function polyBlepSquare(phase, dt, duty = 0.5) {
    phase %= 1;
    return (
        square(phase, duty) +
        polyBlep(phase, dt) -
        polyBlep((phase + 1 - duty) % 1, dt)
    );
}

function polyBlep(t, dt) {
    if (t < dt) {
        t /= dt;
        return t + t - t * t - 1;
    } else if (t > 1 - dt) {
        t = (t - 1) / dt;
        return t * t + t + t + 1;
    }
    return 0;
}
