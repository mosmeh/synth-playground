import React from 'react';

export default function Header({ left, right }) {
    return (
        <div className="header">
            <div className="header-left">{left}</div>
            <div className="header-right">{right}</div>
        </div>
    );
}
