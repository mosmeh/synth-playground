import React, { useCallback, useMemo, useState } from 'react';

export function ParamPane({ params, setParams }) {
    const list = useMemo(
        () =>
            Array.from(params).map(([k, v]) => (
                <li key={k}>
                    <ParamInput
                        name={k}
                        param={v}
                        onChange={(value) => {
                            setParams((prev) => {
                                const next = new Map(prev);
                                next.get(k).value = value;
                                return next;
                            });
                        }}
                    />
                </li>
            )),
        [params, setParams]
    );

    const handleReset = useCallback(() => {
        setParams((prev) => {
            const next = new Map(prev);
            for (const v of next.values()) {
                v.value = v.defaultValue;
            }
            return next;
        });
    }, [setParams]);

    return (
        <div className="param-pane">
            <div className="param-header">
                <span className="title">AudioParams</span>
                <button className="reset button" onClick={handleReset}>
                    Reset
                </button>
            </div>
            <div className="param-body">
                <ul>{list}</ul>
            </div>
        </div>
    );
}

function ParamInput({ name, param, onChange }) {
    const [uncommittedValue, setUncommittedValue] = useState(null);

    const fixValue = useCallback(
        (value) => {
            let x = parseFloat(value);
            if (Number.isNaN(x)) {
                x = param.minValue;
            }
            return Math.max(param.minValue, Math.min(param.maxValue, x));
        },
        [param.maxValue, param.minValue]
    );

    const handleRangeChange = useCallback(
        (e) => {
            onChange(e.target.value);
        },
        [onChange]
    );

    const handleNumberChange = useCallback(
        (e) => {
            onChange(fixValue(e.target.value));
            setUncommittedValue(e.target.value);
        },
        [fixValue, onChange]
    );

    const handleNumberBlur = useCallback(() => {
        onChange(fixValue(uncommittedValue ?? param.value));
        setUncommittedValue(null);
    }, [param.value, fixValue, uncommittedValue, onChange]);

    return (
        <label>
            <p className="name">{name}</p>
            <p className="input-container">
                <input
                    type="range"
                    value={param.value}
                    min={param.minValue}
                    max={param.maxValue}
                    step="any"
                    onChange={handleRangeChange}
                />
                <input
                    type="number"
                    value={
                        uncommittedValue ??
                        Number(param.value).toLocaleString('en-US', {
                            useGrouping: false,
                            maximumSignificantDigits: 7,
                        })
                    }
                    min={param.minValue}
                    max={param.maxValue}
                    step="any"
                    onChange={handleNumberChange}
                    onBlur={handleNumberBlur}
                />
            </p>
        </label>
    );
}
