// Based on https://mohayonao.github.io/web-audio-sound-examples/#coin/1

const AMP = 0.2;
let t = 0;

class Processor extends AudioWorkletProcessor {
    process(_, outputs) {
        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            const freq = t < 0.075 ? 990 : 1320;
            const env = t < 0.075 ? 1 : Math.max(0, 1 - (t - 0.075) / 0.825);
            outL[i] = outR[i] = AMP * env * square(freq, t);
            t += 1 / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);

// Based on https://github.com/Archie3d/qmusic/blob/master/source/plugins/au-generator/src/Generator.cpp

function square(f, t) {
    const PULSE_WIDTH = 0.5;
    const phase = (f * t) % 1;
    const dt = f / sampleRate;
    const raw = phase < PULSE_WIDTH ? 1 : -1;
    return (
        raw + polyBlep(phase, dt) - polyBlep((phase + 1 - PULSE_WIDTH) % 1, dt)
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
