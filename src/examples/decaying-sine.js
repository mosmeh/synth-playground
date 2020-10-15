const AMP = 0.4;
let t = 0;

function loop(bufferSize, outL, outR) {
    for (let i = 0; i < bufferSize; ++i) {
        const env = Math.exp(-t / 0.2);
        outL[i] = AMP * env * Math.sin(2 * Math.PI * 880 * t);
        outR[i] = AMP * env * Math.sin(2 * Math.PI * 882 * t);
        t += 1 / sampleRate;
    }
}
