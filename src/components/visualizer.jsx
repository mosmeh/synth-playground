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
            height="47"
        />
    );
}

function SpectrumAnalyzer({ runner }) {
    const canvasRef = useRef();

    useEffect(() => {
        let requestId;
        function draw() {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = '#007aff';

            const dataArray = runner.getByteFrequencyData();
            const bins = Math.min(40, dataArray.length);

            const barWidth = Math.floor(canvas.width / bins);
            let x = 0;
            for (let i = 0; i < bins; ++i) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                context.fillRect(
                    x,
                    canvas.height - barHeight,
                    barWidth - 1,
                    barHeight
                );
                x += barWidth;
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
            height="47"
        />
    );
}
