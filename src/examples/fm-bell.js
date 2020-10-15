const AMP = 0.2;

// https://mohayonao.github.io/web-audio-sound-examples/#fm-bell/1
const DURATION = 4;
const COLOR = 8;
const T1 = DURATION * 0.5;
const T2 = T1 + DURATION * 0.5;
const FREQ = 440;

let t = 0;
let phase1 = 0;
let phase2 = 0;

function loop(bufferSize, outL, outR) {
    for (let i = 0; i < bufferSize; ++i) {
        const op2 =
            Math.sin(phase2) *
            FREQ *
            (COLOR + (1 - COLOR) * Math.min(1, t / T1));
        const op1 = Math.sin(phase1) * Math.max(0, 1 - t / T2);
        outL[i] = outR[i] = AMP * op1;

        phase2 += (2 * Math.PI * 3.5 * FREQ) / sampleRate;
        phase1 += (2 * Math.PI * (FREQ + op2)) / sampleRate;
        t += 1 / sampleRate;
    }
}
