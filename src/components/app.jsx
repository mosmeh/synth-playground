import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    useReducer,
} from 'react';
import { Header } from './header';
import { ToolBar } from './tool-bar';
import { Visualizer } from './visualizer';
import { Editor } from './editor';
import { StatusBar } from './status-bar';
import { OpenExampleDialog } from './open-example-dialog';
import { ScriptRunner, Speaker, Analyzer, Recorder } from '../audio';
import { DEFAULT_SCRIPT, NEW_SCRIPT } from '../templates';
import { getExample } from '../examples';

const SCRIPT_KEY = 'synth-playground-script';
const VOLUME_KEY = 'synth-playground-volume';

const inisitalState = {
    status: 'stopped',
    recording: false,
    script: localStorage.getItem(SCRIPT_KEY) || DEFAULT_SCRIPT,
    editorShouldRefresh: false,
};

function reducer(state, action) {
    switch (action.type) {
        case 'new':
            return {
                ...state,
                status: 'stopped',
                recording: false,
                script: NEW_SCRIPT,
                editorShouldRefresh: true,
            };
        case 'overwrite_script':
            return {
                ...state,
                status: 'stopped',
                recording: false,
                script: action.script,
                editorShouldRefresh: true,
            };
        case 'run':
            return {
                ...state,
                status: 'starting',
                recording: false,
            };
        case 'stop':
            return {
                ...state,
                status: 'stopped',
                recording: false,
            };
        case 'toggle_recording':
            if (state.recording) {
                return {
                    ...state,
                    recording: false,
                };
            } else if (state.status === 'running') {
                return {
                    ...state,
                    recording: true,
                };
            } else {
                return {
                    ...state,
                    status: 'starting',
                    recording: true,
                };
            }
        case 'on_script_start':
            return {
                ...state,
                status: 'running',
            };
        case 'on_script_error':
            return {
                ...state,
                status: 'error',
                recording: false,
            };
        case 'on_editor_change':
            return {
                ...state,
                script: action.script,
            };
        case 'on_editor_refresh':
            return {
                ...state,
                editorShouldRefresh: false,
            };
        default:
            throw new Error();
    }
}

export function App() {
    const [state, dispatch] = useReducer(reducer, inisitalState);

    const [volume, setVolume] = useState(
        () => localStorage.getItem(VOLUME_KEY) || 1
    );
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [runner, setRunner] = useState(null);
    const [speaker, setSpeaker] = useState(null);
    const [analyzer, setAnalyzer] = useState(null);
    const [recorder, setRecorder] = useState(null);

    const editorRef = useRef();

    // editor

    const openFile = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = () => {
            dispatch({ type: 'overwrite_script', script: reader.result });
        };
        reader.readAsText(file);
    }, []);

    useEffect(() => {
        if (state.editorShouldRefresh) {
            editorRef.current.scrollToTop();
            dispatch({ type: 'on_editor_refresh' });
        }
    }, [state.editorShouldRefresh]);

    // audio

    useEffect(() => {
        switch (state.status) {
            case 'starting':
                if (runner !== null) {
                    runner.disposeAsync();
                }

                const newRunner = new ScriptRunner(state.script);
                newRunner.onerror = () => dispatch({ type: 'on_script_error' });
                newRunner.startScriptAsync();
                setRunner(newRunner);

                setSpeaker(new Speaker(newRunner.outputNode));
                setAnalyzer(new Analyzer(newRunner.outputNode));

                dispatch({ type: 'on_script_start' });
                break;
            case 'stopped':
                if (runner !== null) {
                    runner.disposeAsync();
                    setRunner(null);
                    setSpeaker(null);
                    setAnalyzer(null);
                }
                break;
        }
    }, [runner, state.recording, state.script, state.status]);

    useEffect(() => {
        if (speaker !== null) {
            speaker.volume = volume;
        }
    }, [speaker, volume]);

    useEffect(() => {
        if (state.recording) {
            if (state.status === 'running' && recorder === null) {
                const newRecorder = new Recorder(runner.outputNode);
                newRecorder.start();
                setRecorder(newRecorder);
            }
        } else if (recorder !== null) {
            if (state.status === 'error') {
                recorder.stop();
            } else {
                recorder.stopAndSave();
            }
            recorder.dispose();
            setRecorder(null);
        }
    }, [recorder, runner, state.recording, state.status]);

    // event listeners

    useEventListener('beforeunload', () => {
        localStorage.setItem(SCRIPT_KEY, state.script);
        localStorage.setItem(VOLUME_KEY, volume);
    });

    useEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    useEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            openFile(e.dataTransfer.files[0]);
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
                dispatch({ type: 'run' });
            } else if (e.code === 'Period') {
                e.preventDefault();
                dispatch({ type: 'stop' });
            }
        }
    });

    const handleNew = useCallback(() => dispatch({ type: 'new' }), []);
    const handleRun = useCallback(() => dispatch({ type: 'run' }), []);
    const handleStop = useCallback(() => dispatch({ type: 'stop' }), []);
    const handleRecord = useCallback(
        () => dispatch({ type: 'toggle_recording' }),
        []
    );
    const handleEditorChange = useCallback((value) => {
        dispatch({ type: 'on_editor_change', script: value });
    }, []);

    const handleOpenDialog = useCallback(() => setDialogIsOpen(true), []);
    const handleCloseDialog = useCallback(() => setDialogIsOpen(false), []);
    const handleSelectExample = useCallback(async (name) => {
        dispatch({
            type: 'overwrite_script',
            script: await getExample(name).catch(() => '// Not found'),
        });
        setDialogIsOpen(false);
    }, []);

    return (
        <>
            <Header
                left={
                    <ToolBar
                        running={state.status === 'running'}
                        recording={state.recording}
                        volume={volume}
                        onNew={handleNew}
                        onOpenFile={openFile}
                        onOpenExample={handleOpenDialog}
                        onRun={handleRun}
                        onStop={handleStop}
                        onRecord={handleRecord}
                        onVolumeChange={setVolume}
                    />
                }
                right={<Visualizer analyzer={analyzer} />}
            />
            <Editor
                ref={editorRef}
                value={state.script}
                onChange={handleEditorChange}
                onRun={handleRun}
                onStop={handleStop}
            />
            <StatusBar status={state.status} />
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
