// Based on https://mohayonao.github.io/web-audio-sound-examples/#hihat/3

const INTERVAL = 0.25;
let t = 0;
let voices = [];

class Voice {
    constructor(delay, duration, volume) {
        this._delay = delay;
        this._duration = duration;
        this._volume = volume;
    }
    update() {
        if (t < this._delay || this._delay + this._duration < t) {
            return 0;
        }
        const gain =
            this._volume *
            Math.pow(1e-2 / this._volume, (t - this._delay) / this._duration);
        return gain * (2 * Math.random() - 1);
    }
    get playing() {
        return t - this._delay < this._duration;
    }
}

function update() {
    const counter = Math.ceil(Math.random() * 4);
    const duration = 0.125 / counter;
    voices = [];
    for (let i = 0; i < counter; ++i) {
        const delay = (INTERVAL / counter) * i;
        const volume = [0.1, 0.025, 0.15, 0.05][i];
        voices.push(new Voice(delay, duration, volume));
    }
}
update();

class Processor extends AudioWorkletProcessor {
    process(_, outputs) {
        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            outL[i] = outR[i] = voices.reduce((sum, v) => sum + v.update(), 0);
            t += 1 / sampleRate;
            if (t > INTERVAL) {
                update();
                t = 0;
            }
        }
        return true;
    }
}

registerProcessor('main', Processor);
