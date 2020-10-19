// https://webaudio.prototyping.bbc.co.uk/gunfire/

function noise() {
    return 2 * Math.random() - 1;
}

function envelope(t) {
    if (t < 0.001) {
        return t / 0.001;
    } else if (t < 0.101) {
        return 1 - (0.7 * (t - 0.001)) / 0.1;
    } else if (t < 0.5) {
        return 0.3 - (0.3 * (t - 0.101)) / 0.399;
    } else {
        return 0;
    }
}

const FREQ = 800;
const Q = 1;

const omega = (2 * Math.PI * FREQ) / sampleRate;
const alpha = Math.sin(omega) / (2 * Math.pow(10, Q / 20));
const b0 = (1 - Math.cos(omega)) / 2;
const b1 = b0 * 2;
const b2 = b0;
const a0 = 1 + alpha;
const a1 = -2 * Math.cos(omega);
const a2 = 1 - alpha;

let x1 = 0;
let x2 = 0;
let y1 = 0;
let y2 = 0;

function filter(x) {
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
}

let t = 0;
function loop(bufferSize, outL, outR) {
    for (let i = 0; i < bufferSize; ++i) {
        outL[i] = outR[i] = filter(envelope(t) * noise());
        t += 1 / sampleRate;
    }
}
