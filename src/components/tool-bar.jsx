import React, { useCallback, useRef } from 'react';

export default function ToolBar({
    status,
    volume,
    onNew,
    onOpenFile,
    onOpenExample,
    onRun,
    onStop,
    onVolumeChange,
}) {
    return (
        <div className="toolbar">
            <span className="title">
                Synth Playground
                <Spacer />
            </span>
            <Button label="New" icon="create" onClick={onNew} />
            <OpenFileButton onOpen={onOpenFile} />
            <Button
                label="Example"
                icon="library_books"
                onClick={onOpenExample}
            />
            <Spacer />
            <Button label="Run" icon="play_arrow" onClick={onRun} />
            <Button
                label="Stop"
                icon="stop"
                disabled={status !== 'running'}
                onClick={onStop}
            />
            <Volume value={volume} onChange={onVolumeChange} />
        </div>
    );
}

function Spacer() {
    return <div className="spacer" />;
}

function Button({ label, icon, disabled = false, onClick }) {
    return (
        <button className="foldable" disabled={disabled} onClick={onClick}>
            <p>
                <i className="material-icons">{icon}</i>
                <span>{label}</span>
            </p>
        </button>
    );
}

function OpenFileButton({ onOpen }) {
    const ref = useRef();

    const handleClick = useCallback(() => {
        ref.current.click();
    }, []);

    const handleChange = useCallback(
        (e) => {
            if (e.target.files.length > 0) {
                onOpen(e.target.files[0]);
            }
        },
        [onOpen]
    );

    return (
        <button className="foldable" onClick={handleClick}>
            <input
                ref={ref}
                type="file"
                accept=".js"
                style={{ display: 'none' }}
                onChange={handleChange}
            />
            <p>
                <i className="material-icons">folder</i>
                <span>Open</span>
            </p>
        </button>
    );
}

function Volume({ value, onChange }) {
    const handleChange = useCallback(
        (e) => {
            onChange(e.target.value);
        },
        [onChange]
    );

    return (
        <span>
            <i className="material-icons">volume_mute</i>
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={value}
                onChange={handleChange}
            />
            <i className="material-icons">volume_up</i>
        </span>
    );
}