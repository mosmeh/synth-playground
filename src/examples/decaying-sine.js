const AMP = 0.4;
let t = 0;

class Processor extends AudioWorkletProcessor {
    process(_, outputs) {
        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            const env = Math.exp(-t / 0.2);
            outL[i] = AMP * env * Math.sin(2 * Math.PI * 880 * t);
            outR[i] = AMP * env * Math.sin(2 * Math.PI * 882 * t);
            t += 1 / sampleRate;
        }
        return true;
    }
}

registerProcessor('main', Processor);
