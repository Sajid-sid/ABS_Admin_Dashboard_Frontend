import React, { useState } from "react";
import "./DarkMode.css";

const DarkMode = () => {
    const [enabled, setEnabled] = useState(true);
    const [mode, setMode] = useState("light");

    return (
        <div className="darkmode-container">
            <h1>Site Mood</h1>

            <div className="dm-row">
                <h3>Enable Dark / Light Switcher</h3>

                <label className="switch">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => setEnabled(!enabled)}
                    />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="dm-row">
                <h3>Default Mood</h3>

                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    disabled={!enabled}
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>
        </div>
    );
};

export default DarkMode;