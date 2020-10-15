import React from 'react';

export default function StatusBar({ status }) {
    return <div className={`statusbar ${status}`}>{getMessage(status)}</div>;
}

function getMessage(status) {
    switch (status) {
        case 'running':
            return 'Running';
        case 'stopped':
            return 'Stopped';
        case 'error':
            return 'An error was thrown in the script. Fix the script and try again.';
    }
}
