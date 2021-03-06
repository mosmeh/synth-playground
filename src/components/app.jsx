import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    useReducer,
} from 'react';
import SplitPane from 'react-split-pane';

import { Header } from './header';
import { ToolBar } from './tool-bar';
import { Visualizer } from './visualizer';
import { Editor } from './editor';
import { ParamPane } from './param-pane';
import { StatusBar } from './status-bar';
import { OpenExampleDialog } from './open-example-dialog';

import { ScriptRunner, Speaker, Analyzer, Recorder } from '../audio';
import { DEFAULT_SCRIPT, NEW_SCRIPT } from '../templates';
import { getExample } from '../examples';

const SCRIPT_KEY = 'synth-playground-script';
const VOLUME_KEY = 'synth-playground-volume';
const PARAM_PANE_SIZE_KEY = 'synth-playground-param-pane-size';

const paramPaneSize =
    parseInt(localStorage.getItem(PARAM_PANE_SIZE_KEY), 10) || '20%';

const inisitalState = {
    status: 'stopped',
    recording: false,
    script: localStorage.getItem(SCRIPT_KEY) || DEFAULT_SCRIPT,
    scriptShouldStart: false,
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
                scriptShouldStart: false,
                editorShouldRefresh: true,
            };
        case 'overwrite_script':
            return {
                ...state,
                status: 'stopped',
                recording: false,
                script: action.script,
                scriptShouldStart: false,
                editorShouldRefresh: true,
            };
        case 'run':
            return {
                ...state,
                status: 'stopped',
                recording: false,
                scriptShouldStart: true,
            };
        case 'stop':
            return {
                ...state,
                status: 'stopped',
                recording: false,
                scriptShouldStart: false,
            };
        case 'toggle_recording':
            if (state.recording) {
                return {
                    ...state,
                    recording: false,
                };
            }
            switch (state.status) {
                case 'running':
                case 'starting':
                    return {
                        ...state,
                        recording: true,
                    };
                default:
                    return {
                        ...state,
                        status: 'stopped',
                        recording: true,
                        scriptShouldStart: true,
                    };
            }
        case 'on_script_starting':
            return {
                ...state,
                status: 'starting',
                scriptShouldStart: false,
            };
        case 'on_script_started':
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
    const [audioParams, setAudioParams] = useState(() => new Map());

    const splitPaneRef = useRef();
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
            setAudioParams(new Map());
            dispatch({ type: 'on_editor_refresh' });
        }
    }, [state.editorShouldRefresh]);

    // audio

    useEffect(() => {
        if (state.scriptShouldStart) {
            if (runner !== null) {
                runner.disposeAsync();
            }

            const newRunner = new ScriptRunner(state.script);
            newRunner.onerror = () => dispatch({ type: 'on_script_error' });
            newRunner.startScriptAsync().then(() => {
                setRunner(newRunner);

                setSpeaker(new Speaker(newRunner.outputNode));
                setAnalyzer(new Analyzer(newRunner.outputNode));

                dispatch({ type: 'on_script_started' });
            });

            dispatch({ type: 'on_script_starting' });
        } else if (state.status === 'stopped') {
            if (runner !== null) {
                runner.disposeAsync();
                setRunner(null);
                setSpeaker(null);
                setAnalyzer(null);
            }
        }
    }, [
        runner,
        state.recording,
        state.script,
        state.scriptShouldStart,
        state.status,
    ]);

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

    useEffect(() => {
        if (state.status === 'running') {
            setAudioParams((prev) => {
                const next = new Map();
                for (const [k, v] of runner.scriptNode.parameters) {
                    const clamp = (x) =>
                        Math.max(v.minValue, Math.min(v.maxValue, x));
                    next.set(k, {
                        value: clamp(prev.get(k)?.value ?? v.defaultValue),
                        defaultValue: clamp(v.defaultValue),
                        minValue: v.minValue,
                        maxValue: v.maxValue,
                    });
                }
                return next;
            });
        }
    }, [runner, state.status]);

    useEffect(() => {
        if (state.status === 'running') {
            for (const [k, v] of runner.scriptNode.parameters) {
                if (audioParams.has(k)) {
                    v.value = audioParams.get(k).value;
                }
            }
        }
    }, [audioParams, runner, state.status]);

    // event listeners

    useEventListener('beforeunload', () => {
        localStorage.setItem(SCRIPT_KEY, state.script);
        localStorage.setItem(VOLUME_KEY, volume);
        if (splitPaneRef.current) {
            localStorage.setItem(
                PARAM_PANE_SIZE_KEY,
                splitPaneRef.current.pane2.clientWidth
            );
        }
    });

    useEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    useEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            setDialogIsOpen(false);
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
            <SplitPane
                ref={splitPaneRef}
                split="vertical"
                primary="second"
                defaultSize={paramPaneSize}
                minSize={200}
                maxSize={-200}
                style={{ height: 'calc(100% - 72px)' }}
                pane1Style={{ overflow: 'hidden' }}
                pane2Style={{ overflow: 'hidden' }}
            >
                <Editor
                    ref={editorRef}
                    value={state.script}
                    onChange={handleEditorChange}
                    onRun={handleRun}
                    onStop={handleStop}
                />
                <ParamPane params={audioParams} setParams={setAudioParams} />
            </SplitPane>
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
