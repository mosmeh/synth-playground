const AMP = 0.2;

// http://noisehack.com/generate-noise-web-audio-api/
let b0 = 0;
let b1 = 0;
let b2 = 0;
let b3 = 0;
let b4 = 0;
let b5 = 0;
let b6 = 0;

function pink() {
    const white = Math.random() * 2 - 1;

    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;

    const out = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    return out * 0.11;
}

function loop(bufferSize, outL, outR) {
    for (let i = 0; i < bufferSize; ++i) {
        outL[i] = outR[i] = AMP * pink();
    }
}
