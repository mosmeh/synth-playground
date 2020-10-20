class ScriptProcessor extends AudioWorkletProcessor {
    process(_inputs, outputs) {
        if (typeof loop === 'undefined') {
            return false;
        }

        const outL = outputs[0][0];
        const outR = outputs[0][1];

        loop(outL.length, outL, outR);

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
