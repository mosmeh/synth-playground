const AMP = 0.3;
let t = 0;

class Processor extends AudioWorkletProcessor {
    process(_, outputs) {
        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            outL[i] = Math.sin(2 * Math.PI * 440 * t) * AMP;
            outR[i] = Math.sin(2 * Math.PI * 442 * t) * AMP;
            t += 1 / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);
