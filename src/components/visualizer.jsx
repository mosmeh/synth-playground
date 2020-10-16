import React, { useEffect, useRef } from 'react';

export default function Visualizer({ runner }) {
    return (
        <div className="visualizer">
            <Oscilloscope runner={runner} />
            <SpectrumAnalyzer runner={runner} />
        </div>
    );
}

function Oscilloscope({ runner }) {
    const canvasRef = useRef();

    useEffect(() => {
        let requestId;
        function draw() {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.lineWidth = 2;
            context.strokeStyle = '#007aff';
            context.beginPath();

            const dataArray = runner.getByteTimeDomainData();

            const sliceWidth = canvas.width / dataArray.length;
            let x = 0;
            for (let i = 0; i < dataArray.length; ++i) {
                const v = dataArray[i] / 128;
                const y = (v * canvas.height) / 2;
                if (i === 0) {
                    context.moveTo(x, y);
                } else {
                    context.lineTo(x, y);
                }
                x += sliceWidth;
            }

            context.lineTo(canvas.width, canvas.height / 2);
            context.stroke();

            requestId = requestAnimationFrame(draw);
        }
        draw();

        return () => cancelAnimationFrame(requestId);
    }, [runner]);

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

function SpectrumAnalyzer({ runner }) {
    const canvasRef = useRef();

    useEffect(() => {
        let requestId;
        function draw() {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.lineWidth = 1.5;
            context.strokeStyle = '#007aff';

            const dataArray = runner.getByteFrequencyData();

            // DC bias
            const x = context.lineWidth / 2;
            const y = (canvas.height * (255 - dataArray[0])) / 255;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x, canvas.height);
            context.stroke();

            const maxFreq = Math.log10(runner.sampleRate / 2); // Nyquist frequency
            const binWidth = maxFreq - Math.log10(dataArray.length);

            for (let i = 1; i < dataArray.length; ++i) {
                const x =
                    (canvas.width * (Math.log10(i) + binWidth - MIN_FREQ)) /
                    (maxFreq - MIN_FREQ);
                const y = (canvas.height * (255 - dataArray[i])) / 255;

                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x, canvas.height);
                context.stroke();
            }

            requestId = requestAnimationFrame(draw);
        }
        draw();

        return () => cancelAnimationFrame(requestId);
    }, [runner]);

    return (
        <canvas
            ref={canvasRef}
            className="spectrum-analyzer"
            width="250"
            height="48"
        />
    );
}
