const AMP = 0.1;
const FREQS = [60, 64, 67, 71].map(midicps);
let t = 0;

class Processor extends AudioWorkletProcessor {
    process(_, outputs) {
        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            outL[i] = outR[i] =
                AMP *
                Math.exp(-t / 0.2) *
                FREQS.reduce((sum, f) => sum + saw(f, t), 0);

            t += 1 / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);

function saw(f, t) {
    return 2 * ((f * t) % 1) - 1;
}

function midicps(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}
