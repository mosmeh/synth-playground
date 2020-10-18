import React, { useMemo } from 'react';
import Modal from 'react-modal';
import { EXAMPLES } from '../examples';

export function OpenExampleDialog({ isOpen, onRequestClose, onSelect }) {
    const items = useMemo(
        () =>
            Object.keys(EXAMPLES).map((name) => (
                <li key={name} onClick={() => onSelect(name)}>
                    {name}
                </li>
            )),
        [onSelect]
    );

    return (
        <Modal
            className="dialog"
            isOpen={isOpen}
            onRequestClose={onRequestClose}
        >
            <div className="message">Choose an example</div>
            <ul className="list">{items}</ul>
            <button className="close" onClick={onRequestClose}>
                Close
            </button>
        </Modal>
    );
}
