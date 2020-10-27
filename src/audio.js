import FIX_SAMPLE_PROCESSOR_URL from '!!url-loader!./fix-sample-processor';

const AudioContext = window.AudioContext || window.webkitAudioContext;

export class ScriptRunner {
    constructor(script) {
        this.onerror = () => {};

        this._script = script;
        this._context = new AudioContext();
        this._outputNode = this._context.createGain();
    }

    async disposeAsync() {
        if (this._context.state !== 'closed') {
            await this._context.close();
        }
    }

    async startScriptAsync() {
        const blob = new Blob([this._script], {
            type: 'application/javascript',
        });
        const url = URL.createObjectURL(blob);

        try {
            await this._context.audioWorklet.addModule(url, {
                credentials: 'omit',
            });

            this._scriptNode = new AudioWorkletNode(this._context, 'main', {
                numberOfInputs: 0,
                numberOfOutputs: 1,
                outputChannelCount: [2],
            });
        } catch (e) {
            await this.disposeAsync();
            this.onerror(e);
            throw e;
        } finally {
            URL.revokeObjectURL(url);
        }

        this._scriptNode.onprocessorerror = async (e) => {
            await this.disposeAsync();
            this.onerror(e);
        };

        await this._context.audioWorklet.addModule(FIX_SAMPLE_PROCESSOR_URL, {
            credentials: 'omit',
        });
        this._fixSampleNode = new AudioWorkletNode(
            this._context,
            'fix-sample-processor',
            {
                numberOfInputs: 1,
                numberOfOutputs: 1,
                outputChannelCount: [2],
            }
        );

        this._scriptNode.connect(this._fixSampleNode);
        this._fixSampleNode.connect(this._outputNode);
    }

    get outputNode() {
        return this._outputNode;
    }
}

export class Speaker {
    constructor(sourceNode) {
        const context = sourceNode.context;
        this._gainNode = context.createGain();
        sourceNode.connect(this._gainNode);
        this._gainNode.connect(context.destination);
    }

    get volume() {
        return this._gainNode.gain.value;
    }

    set volume(value) {
        this._gainNode.gain.value = value;
    }
}

const MIN_DB = -96;
const MAX_DB = -10;
const OSC_FFT_SIZE = 1024;
const SPECTRUM_FFT_SIZE = 2048;

export class Analyzer {
    constructor(sourceNode) {
        this._context = sourceNode.context;

        this._oscAnalyser = this._context.createAnalyser();
        this._oscAnalyser.minDecibels = MIN_DB;
        this._oscAnalyser.maxDecibels = MAX_DB;
        this._oscAnalyser.fftSize = OSC_FFT_SIZE;
        sourceNode.connect(this._oscAnalyser);
        this._oscArray = new Uint8Array(OSC_FFT_SIZE);

        this._spectrumAnalyser = this._context.createAnalyser();
        this._spectrumAnalyser.minDecibels = MIN_DB;
        this._spectrumAnalyser.maxDecibels = MAX_DB;
        this._spectrumAnalyser.fftSize = SPECTRUM_FFT_SIZE;
        sourceNode.connect(this._spectrumAnalyser);
        this._spectrumArray = new Uint8Array(SPECTRUM_FFT_SIZE / 2);
    }

    get sampleRate() {
        return this._context.sampleRate;
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

const mimeType = MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')
    ? 'audio/ogg; codecs=opus' // Firefox
    : 'audio/webm'; // Chrome

export class Recorder {
    constructor(sourceNode) {
        this._sourceNode = sourceNode;

        this._dest = sourceNode.context.createMediaStreamDestination();
        sourceNode.connect(this._dest);

        this._mediaRecorder = new MediaRecorder(this._dest.stream, {
            mimeType,
        });

        const chunks = [];
        this._mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
        };

        this._save = false;
        this._mediaRecorder.onstop = () => {
            if (this._save) {
                const blob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.download = '';
                link.click();
                URL.revokeObjectURL(url);
            }
        };
    }

    dispose() {
        if (this._dest !== null) {
            this._sourceNode.disconnect(this._dest);
            this._dest = null;
        }
    }

    start() {
        this._mediaRecorder.start();
    }

    stop() {
        this._mediaRecorder.stop();
        this.dispose();
    }

    stopAndSave() {
        this._save = true;
        this._mediaRecorder.stop();
        this.dispose();
    }
}
