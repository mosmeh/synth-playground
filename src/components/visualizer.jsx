import React, { useEffect, useRef } from 'react';

export function Visualizer({ analyzer }) {
    return (
        <div className="visualizer">
            <Oscilloscope analyzer={analyzer} />
            <SpectrumAnalyzer analyzer={analyzer} />
        </div>
    );
}

function Oscilloscope({ analyzer }) {
    const canvasRef = useRef();

    useEffect(() => {
        let requestId = null;
        function draw() {
            const canvas = canvasRef.current;
            const width = canvas.width;
            const height = canvas.height;
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, width, height);

            context.lineWidth = 2;
            context.strokeStyle = '#007aff';
            context.beginPath();

            if (analyzer === null) {
                context.moveTo(0, height / 2);
                context.lineTo(width, height / 2);
                context.stroke();
                return;
            }

            const timeData = analyzer.getByteTimeDomainData();

            // draw a range of half the window size to prevent right ends of waveforms from being chopped off
            const drawLength = timeData.length / 2;
            const sliceWidth = (width / timeData.length) * 2;

            // SidWizPlus' PeakSpeedTrigger
            // https://github.com/maxim-zhao/SidWizPlus/blob/master/LibSidWiz/Triggers/PeakSpeedTrigger.cs

            let peakValue = Number.NEGATIVE_INFINITY;
            let shortestDistance = Number.POSITIVE_INFINITY;
            let triggerIndex = 0;
            for (let i = 0; i < drawLength; ) {
                while (timeData[i++] > 128 && i < drawLength);
                while (timeData[i++] <= 128 && i < drawLength);

                const lastCrossing = i;
                for (
                    let sample = timeData[i];
                    sample > 128 && i < drawLength;
                    ++i
                ) {
                    if (sample > peakValue) {
                        peakValue = sample;
                        triggerIndex = lastCrossing;
                        shortestDistance = i - lastCrossing;
                    } else if (
                        sample === peakValue &&
                        i - lastCrossing < shortestDistance
                    ) {
                        triggerIndex = lastCrossing;
                        shortestDistance = i - lastCrossing;
                    }

                    sample = timeData[i];
                }
            }

            for (
                let x = 0, i = triggerIndex;
                x <= width && i < timeData.length;
                x += sliceWidth, ++i
            ) {
                context.lineTo(x, ((255 - timeData[i]) / 255) * height);
            }
            context.stroke();

            requestId = requestAnimationFrame(draw);
        }
        draw();

        return () => cancelAnimationFrame(requestId);
    }, [analyzer]);

    return (
        <canvas
            ref={canvasRef}
            className="oscilloscope"
            width="250"
            height="48"
        />
    );
}

const MIN_FREQ = Math.log10(10);

function SpectrumAnalyzer({ analyzer }) {
    const canvasRef = useRef();

    useEffect(() => {
        let requestId = null;
        function draw() {
            const canvas = canvasRef.current;
            const width = canvas.width;
            const height = canvas.height;
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, width, height);

            if (analyzer === null) {
                return;
            }

            const freqData = analyzer.getByteFrequencyData();

            // DC bias
            const y = ((255 - freqData[0]) / 255) * height;
            context.beginPath();
            context.moveTo(0, y);

            const maxFreq = Math.log10(analyzer.sampleRate / 2); // Nyquist frequency
            const binWidth = maxFreq - Math.log10(freqData.length);

            for (let i = 1; i < freqData.length; ++i) {
                const x =
                    ((Math.log10(i) + binWidth - MIN_FREQ) /
                        (maxFreq - MIN_FREQ)) *
                    width;
                const y = ((255 - freqData[i]) / 255) * height;

                context.lineTo(x, y);
            }

            context.lineTo(width, height);
            context.lineTo(0, height);
            context.closePath();

            context.fillStyle = '#007aff';
            context.fill();

            requestId = requestAnimationFrame(draw);
        }
        draw();

        return () => cancelAnimationFrame(requestId);
    }, [analyzer]);

    return (
        <canvas
            ref={canvasRef}
            className="spectrum-analyzer"
            width="250"
            height="48"
        />
    );
}
