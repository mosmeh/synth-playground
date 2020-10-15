import React, { useMemo } from 'react';
import Modal from 'react-modal';
import { EXAMPLES } from '../examples';

export default function OpenExampleDialog({
    isOpen,
    onRequestClose,
    onSelect,
}) {
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
            <div className="header-area">
                <div className="content">Choose an example</div>
            </div>
            <ul className="item-list">{items}</ul>
            <div className="button-area">
                <div className="button" onClick={onRequestClose}>
                    Close
                </div>
            </div>
        </Modal>
    );
}
