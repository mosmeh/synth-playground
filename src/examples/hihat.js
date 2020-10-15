const AMP = 0.3;
let t = 0;

function loop(bufferSize, outL, outR) {
    for (let i = 0; i < bufferSize; ++i) {
        const env = Math.exp(-t / 0.015);
        outL[i] = AMP * env * (2 * Math.random() - 1);
        outR[i] = AMP * env * (2 * Math.random() - 1);
        t += 1 / sampleRate;
    }
}
