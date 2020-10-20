// Based on https://mohayonao.github.io/web-audio-sound-examples/#hihat/2

const AMP = 0.8;
const VOLUMES = [0.25, 0.05, 0.125, 0.075];
let t = 0;
let counter = 0;
let volume = VOLUMES[0];

function loop(bufferSize, outL, outR) {
    for (let i = 0; i < bufferSize; ++i) {
        const v = AMP * volume * Math.exp(-t / 0.01);
        outL[i] = v * (2 * Math.random() - 1);
        outR[i] = v * (2 * Math.random() - 1);

        t += 1 / sampleRate;
        if (t > 0.125) {
            t = 0;
            volume = VOLUMES[++counter % VOLUMES.length];
        }
    }
}
