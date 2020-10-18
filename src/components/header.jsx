import React from 'react';

export function Header({ left, right }) {
    return (
        <div className="header">
            <div className="left">{left}</div>
            <div className="right">{right}</div>
        </div>
    );
}
