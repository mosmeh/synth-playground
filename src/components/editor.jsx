import React, {
    useRef,
    useCallback,
    useImperativeHandle,
    forwardRef,
} from 'react';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import AUDIO_WORKLET_LIB from '!!raw-loader!../audio-worklet-lib';

const OPTIONS = {
    automaticLayout: true,
    scrollBeyondLastLine: false,
};

export const Editor = forwardRef(function Editor(
    { value, onChange, onRun, onStop },
    ref
) {
    const handleEditorWillMount = useCallback((monaco) => {
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            lib: ['esnext'],
            allowJs: true,
            checkJs: true,
            allowNonTsExtensions: true,
        });

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
            noSuggestionDiagnostics: false,
            diagnosticCodesToIgnore: [
                2322, // Type '{0}' is not assignable to type '{1}'.
                7044, // Parameter '{0}' implicitly has an '{1}' type, but a better type may be inferred from usage.
            ],
        });

        monaco.languages.typescript.javascriptDefaults.addExtraLib(
            AUDIO_WORKLET_LIB
        );
    }, []);

    const handleEditorDidMount = useCallback(
        (editor) => {
            editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                onRun
            );
            editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_DOT,
                onStop
            );
        },
        [onRun, onStop]
    );

    const editorRef = useRef();

    useImperativeHandle(
        ref,
        () => ({
            scrollToTop() {
                editorRef.current.editor.setScrollTop(0);
            },
        }),
        []
    );

    return (
        <div className="editor">
            <MonacoEditor
                ref={editorRef}
                language="javascript"
                options={OPTIONS}
                value={value}
                onChange={onChange}
                editorWillMount={handleEditorWillMount}
                editorDidMount={handleEditorDidMount}
            />
        </div>
    );
});
