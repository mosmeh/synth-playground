const AMP = 0.3;
let t = 0;

function loop(bufferSize, outL, outR) {
    for (let i = 0; i < bufferSize; ++i) {
        outL[i] = Math.sin(2 * Math.PI * 440 * t) * AMP;
        outR[i] = Math.sin(2 * Math.PI * 442 * t) * AMP;
        t += 1 / sampleRate;
    }
}
