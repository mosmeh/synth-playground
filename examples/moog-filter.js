const AMP = 0.3;

// Adapted from https://www.musicdsp.org/en/latest/Filters/26-moog-vcf-variation-2.html

class MoogFilter {
    constructor(cutoff, resonance) {
        this.cutoff = cutoff || sampleRate;
        this.resonance = resonance || 0;
        this._in1 = this._in2 = this._in3 = this._in4 = 0;
        this._out1 = this._out2 = this._out3 = this._out4 = 0;
    }
    value() {
        return this._out4;
    }
    process(x) {
        const f = (this.cutoff / sampleRate) * 1.16;
        const fb = this.resonance * (1.0 - 0.15 * f * f);
        x -= this._out4 * fb;
        x *= 0.35013 * (f * f) * (f * f);
        this._out1 = x + 0.3 * this._in1 + (1 - f) * this._out1;
        this._in1 = x;
        this._out2 = this._out1 + 0.3 * this._in2 + (1 - f) * this._out2;
        this._in2 = this._out1;
        this._out3 = this._out2 + 0.3 * this._in3 + (1 - f) * this._out3;
        this._in3 = this._out2;
        this._out4 = this._out3 + 0.3 * this._in4 + (1 - f) * this._out4;
        this._in4 = this._out3;
        return this._out4;
    }
}

class Envelope {
    constructor(a, r) {
        this.a = a || 0;
        this.r = r || 0;
        this.released = false;
        this._t = 0;
    }
    release() {
        if (!this.released) {
            this._t = -this.r * Math.log(this.value());
            this.released = true;
        }
    }
    value() {
        if (this.released) {
            return Math.exp(-this._t / this.r);
        } else {
            return 1 - Math.exp(-this._t / this.a);
        }
    }
    update() {
        this._t += 1 / sampleRate;
        return this.value();
    }
}

class Delay {
    constructor(time, wet, feedback) {
        this.wet = wet || 1;
        this.feedback = feedback || 0;
        this._buf = new Float32Array(65536);
        this._readPtr = 0;
        this._writePtr = (time * sampleRate) & 65535;
    }
    process(x) {
        const x1 = this._buf[this._readPtr++];
        this._buf[this._writePtr++] = x + this.feedback * x1;
        this._readPtr &= 65535;
        this._writePtr &= 65535;
        return x + this.wet * x1;
    }
}

const lowpass = new MoogFilter(0, 3.8);
const ampEnv = new Envelope(0, 1);
const filterEnv = new Envelope(1, 1);
const delay = [new Delay(0.4, 0.5, 0.4), new Delay(0.5, 0.5, 0.4)];

let t = 0;

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Cutoff',
                defaultValue: 21,
                minValue: 0,
                maxValue: 40,
            },
            {
                name: 'Resonance',
                defaultValue: 3.8,
                minValue: 0,
                maxValue: 4,
            },
            {
                name: 'Attack',
                defaultValue: 1,
                minValue: 0,
                maxValue: 2,
            },
        ];
    }
    process(_, outputs, params) {
        const cutoff = params['Cutoff'][0] * 1000;
        const attack = params['Attack'][0];
        lowpass.resonance = params['Resonance'][0];
        filterEnv.a = attack;

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            const noise = Math.random() * 2 - 1;

            lowpass.cutoff = cutoff * filterEnv.update();
            const x = ampEnv.update() * lowpass.process(noise);

            outL[i] = AMP * delay[0].process(x);
            outR[i] = AMP * delay[1].process(x);

            t += 1 / sampleRate;
            if (t > attack + 0.5) {
                ampEnv.release();
                filterEnv.release();
            }
        }
        return true;
    }
}

registerProcessor('main', Processor);
