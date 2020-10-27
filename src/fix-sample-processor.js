registerProcessor(
    'fix-sample-processor',
    class extends AudioWorkletProcessor {
        process(inputs, outputs) {
            const inL = inputs[0][0];
            const inR = inputs[0][1];
            const outL = outputs[0][0];
            const outR = outputs[0][1];

            for (let i = 0; i < inL.length; ++i) {
                outL[i] = Number.isFinite(inL[i]) ? inL[i] : 0;
            }
            for (let i = 0; i < inR.length; ++i) {
                outR[i] = Number.isFinite(inR[i]) ? inR[i] : 0;
            }

            return true;
        }
    }
);
