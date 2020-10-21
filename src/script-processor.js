class ScriptProcessor extends AudioWorkletProcessor {
    process(inputs, outputs) {
        if (typeof loop === 'undefined') {
            return false;
        }

        const input = inputs[0][0];
        const outL = outputs[0][0];
        const outR = outputs[0][1];

        loop(outL.length, outL, outR, input);

        for (let i = 0; i < outL.length; ++i) {
            if (!Number.isFinite(outL[i])) {
                outL[i] = 0;
            }
        }
        for (let i = 0; i < outR.length; ++i) {
            if (!Number.isFinite(outR[i])) {
                outR[i] = 0;
            }
        }

        return true;
    }
}

registerProcessor('script-processor', ScriptProcessor);
