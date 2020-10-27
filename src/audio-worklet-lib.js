/* eslint-disable no-unused-vars */

/**
 * The current frame of the block of audio being processed.
 * @type {number}
 */
let currentFrame;

/**
 * The context time of the block of audio being processed in seconds.
 * @type {number}
 */
let currentTime;

/**
 * The sample rate in samples per second.
 * @type {number}
 */
let sampleRate;

/**
 * An audio processing code that runs on the audio rendering thread.
 * @interface
 */
class AudioWorkletProcessor {
    /**
     * Returns a MessagePort used for bidirectional communication between the processor and the AudioWorkletNode which it belongs to.
     * @type {MessagePort}
     * @public
     */
    get port() {}
}

/**
 * Registers a class constructor derived from AudioWorkletProcessor.
 * @template {typeof AudioWorkletProcessor} T
 * @param {string} name - A string representing the name under which the processor will be registered.
 * @param {T} processorCtor - The constructor of a class derived from AudioWorkletProcessor.
 * @return {undefined}
 */
function registerProcessor(name, processorCtor) {}
