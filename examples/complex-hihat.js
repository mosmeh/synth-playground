// Based on https://mohayonao.github.io/web-audio-sound-examples/#hihat/3

let t = 0;
let voices = [];

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Interval',
                defaultValue: 0.25,
                minValue: 0.1,
                maxValue: 1,
            },
            {
                name: 'Pattern',
                defaultValue: 4,
                minValue: 1,
                maxValue: 4,
            },
        ];
    }
    process(_, outputs, params) {
        const interval = params['Interval'][0];
        const patternLength = Math.floor(params['Pattern'][0]);

        const outL = outputs[0][0];
        const outR = outputs[0][1];
        for (let i = 0; i < outL.length; ++i) {
            outL[i] = outR[i] = voices.reduce((sum, v) => sum + v.update(), 0);
            t += 1 / sampleRate;
            if (t > interval) {
                update(interval, patternLength);
                t = 0;
            }
        }
        return true;
    }
}

registerProcessor('main', Processor);

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
}

function update(interval, patternLength) {
    const counter = Math.ceil(Math.random() * patternLength);
    const duration = interval / (2 * counter);
    voices = [];
    for (let i = 0; i < counter; ++i) {
        const delay = (interval / counter) * i;
        const volume = [0.1, 0.025, 0.15, 0.05][i];
        voices.push(new Voice(delay, duration, volume));
    }
}
update(0.25, 4);
