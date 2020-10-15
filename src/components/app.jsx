import React, { useEffect, useState, useRef, useCallback } from 'react';
import Header from './header';
import ToolBar from './tool-bar';
import Visualizer from './visualizer';
import Editor from './editor';
import StatusBar from './status-bar';
import OpenExampleDialog from './open-example-dialog';
import Runner from '../runner';
import { DEFAULT_SCRIPT, NEW_SCRIPT } from '../templates';
import { getExample } from '../examples';

const SCRIPT_KEY = 'synth-playground-script';
const VOLUME_KEY = 'synth-playground-volume';

export default function App() {
    const [status, setStatus] = useState('stopped');
    const [script, setScript] = useState(
        () => localStorage.getItem(SCRIPT_KEY) || DEFAULT_SCRIPT
    );
    const [volume, setVolume] = useState(
        () => localStorage.getItem(VOLUME_KEY) || 1
    );
    const [runRequested, setRunRequested] = useState(false);
    const [dialogIsOpen, setDialogIsOpen] = useState(false);

    const editorRef = useRef();
    const runnerRef = useRef(null);
    if (runnerRef.current === null) {
        runnerRef.current = new Runner('');
    }

    const overwriteScript = useCallback((script) => {
        setStatus('stopped');
        setScript(script);
        editorRef.current.scrollToTop();
    }, []);

    const loadFile = useCallback(
        (file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                overwriteScript(reader.result);
            };
            reader.readAsText(file);
        },
        [overwriteScript]
    );

    useEffect(() => {
        if (runRequested) {
            runnerRef.current.dispose();

            runnerRef.current = new Runner(script);
            runnerRef.current.volume = volume;
            runnerRef.current.onerror = () => setStatus('error');
            runnerRef.current.startScript();

            setRunRequested(false);
            setStatus('running');
        } else if (status !== 'running') {
            runnerRef.current.stopScript();
        }
    }, [runRequested, script, status, volume]);

    useEffect(() => {
        runnerRef.current.volume = volume;
    }, [volume]);

    useEventListener('beforeunload', () => {
        localStorage.setItem(SCRIPT_KEY, script);
        localStorage.setItem(VOLUME_KEY, volume);
    });

    useEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    useEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            loadFile(e.dataTransfer.files[0]);
        }
    });

    const isMac = /Mac/i.test(navigator.userAgent);
    useEventListener('keydown', (e) => {
        const mod = isMac
            ? !e.ctrlKey && !e.shiftKey && e.metaKey
            : e.ctrlKey && !e.shiftKey && !e.metaKey;
        if (mod) {
            if (e.code === 'Enter') {
                e.preventDefault();
                setRunRequested(true);
            } else if (e.code === 'Period') {
                e.preventDefault();
                setStatus('stopped');
            }
        }
    });

    const handleNew = useCallback(() => overwriteScript(NEW_SCRIPT), [
        overwriteScript,
    ]);
    const handleRun = useCallback(() => setRunRequested(true), []);
    const handleStop = useCallback(() => setStatus('stopped'), []);
    const handleOpenDialog = useCallback(() => setDialogIsOpen(true), []);
    const handleCloseDialog = useCallback(() => setDialogIsOpen(false), []);
    const handleSelectExample = useCallback(
        async (name) => {
            overwriteScript(await getExample(name).catch(() => '// Not found'));
            setDialogIsOpen(false);
        },
        [overwriteScript]
    );

    return (
        <>
            <Header
                left={
                    <ToolBar
                        status={status}
                        volume={volume}
                        onNew={handleNew}
                        onOpenFile={loadFile}
                        onOpenExample={handleOpenDialog}
                        onRun={handleRun}
                        onStop={handleStop}
                        onVolumeChange={setVolume}
                    />
                }
                right={<Visualizer runner={runnerRef.current} />}
            />
            <Editor
                ref={editorRef}
                value={script}
                onChange={setScript}
                onRun={handleRun}
                onStop={handleStop}
            />
            <StatusBar status={status} />
            <OpenExampleDialog
                isOpen={dialogIsOpen}
                onRequestClose={handleCloseDialog}
                onSelect={handleSelectExample}
            />
        </>
    );
}

function useEventListener(event, handler, element = window) {
    const handlerRef = useRef();

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const listener = (e) => handlerRef.current(e);
        element.addEventListener(event, listener);
        return () => element.removeEventListener(event, listener);
    }, [element, event]);
}
