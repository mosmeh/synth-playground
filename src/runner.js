import scriptProcessorScript from '!!raw-loader!./script-processor';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const OSC_FFT_SIZE = 1024;
const SPECTRUM_FFT_SIZE = 2048;

export default class Runner {
    constructor(script) {
        this._script = script;
        this._audioContext = new AudioContext();
        this._gainNode = this._audioContext.createGain();
        this._gainNode.connect(this._audioContext.destination);

        this._oscAnalyser = this._audioContext.createAnalyser();
        this._oscAnalyser.minDecibels = -96;
        this._oscAnalyser.maxDecibels = -10;
        this._oscAnalyser.fftSize = OSC_FFT_SIZE;
        this._gainNode.connect(this._oscAnalyser);
        this._oscArray = new Uint8Array(OSC_FFT_SIZE);

        this._spectrumAnalyser = this._audioContext.createAnalyser();
        this._spectrumAnalyser.minDecibels = -96;
        this._spectrumAnalyser.maxDecibels = -10;
        this._spectrumAnalyser.fftSize = SPECTRUM_FFT_SIZE;
        this._gainNode.connect(this._spectrumAnalyser);
        this._spectrumArray = new Uint8Array(SPECTRUM_FFT_SIZE / 2);

        this._scriptNode = null;

        this.onerror = () => {};
    }

    async dispose() {
        if (this._audioContext.state !== 'closed') {
            this.stopScript();
            await this._audioContext.close();
        }
    }

    async startScript() {
        const workletScript = `${this._script}\n\n${scriptProcessorScript}`;
        const blob = new Blob([workletScript], {
            type: 'application/javascript',
        });
        const url = URL.createObjectURL(blob);
        await this._audioContext.audioWorklet.addModule(url, {
            credentials: 'omit',
        });

        try {
            this._scriptNode = new AudioWorkletNode(
                this._audioContext,
                'script-processor',
                {
                    numberOfInputs: 0,
                    numberOfOutputs: 1,
                    outputChannelCount: [2],
                }
            );
        } catch (e) {
            this.stopScript();
            this.onerror(e);
            throw e;
        }

        this._scriptNode.onprocessorerror = (e) => {
            this.stopScript();
            this.onerror(e);
        };
        this._scriptNode.connect(this._gainNode);
    }

    stopScript() {
        if (this._scriptNode !== null) {
            this._scriptNode.disconnect();
            this._scriptNode = null;
        }
    }

    get volume() {
        return this._gainNode.gain.value;
    }

    set volume(value) {
        this._gainNode.gain.value = value;
    }

    get sampleRate() {
        return this._audioContext.sampleRate;
    }

    getByteTimeDomainData() {
        this._oscAnalyser.getByteTimeDomainData(this._oscArray);
        return this._oscArray;
    }

    getByteFrequencyData() {
        this._spectrumAnalyser.getByteFrequencyData(this._spectrumArray);
        return this._spectrumArray;
    }
}
