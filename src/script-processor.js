class ScriptProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(_inputs, outputs) {
        if (typeof loop === 'undefined') {
            return false;
        }

        const out = outputs[0];
        loop(out[0].length, out[0], out[1]);
        return true;
    }
}

registerProcessor('script-processor', ScriptProcessor);
