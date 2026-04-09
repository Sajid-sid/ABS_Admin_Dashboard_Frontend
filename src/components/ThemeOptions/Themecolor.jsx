import React, { useState, useEffect } from "react";

const ThemeColor = () => {

    const [color, setColor] = useState("#31c4ab");
    const [transparent, setTransparent] = useState(false);

    // 🔥 Apply color globally
    useEffect(() => {
        if (!transparent) {
            document.body.style.setProperty("--primary-color", color);
            localStorage.setItem("themeColor", color);
            localStorage.setItem("isTransparent", transparent);
        }
    }, [color, transparent]);

    // 🔥 Handle typing + picker
    const handleColorChange = (value) => {
        let newColor = value;

        if (!newColor.startsWith("#")) {
            newColor = "#" + newColor;
        }

        setColor(newColor);
    };

    return (
        <div style={{
            padding: "25px",
            fontFamily: "Segoe UI, sans-serif",
            background: "#f9fafc",
            minHeight: "100vh"
        }}>

            {/* TITLE */}
            <h2 style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "20px"
            }}>
                Theme Color
            </h2>

            {/* CARD */}
            <div style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "10px",
                border: "1px solid #eee",
                maxWidth: "550px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
            }}>

                {/* LABEL */}
                <p style={{
                    fontWeight: "600",
                    marginBottom: "5px"
                }}>
                    Theme Primary Color
                </p>

                <p style={{
                    color: "#777",
                    fontSize: "13px",
                    marginBottom: "20px"
                }}>
                    Set theme primary color
                </p>

                {/* INPUT ROW */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap"
                }}>

                    {/* 🔥 PREVIEW BOX */}
                    <div style={{
                        width: "160px",
                        height: "45px",
                        borderRadius: "6px",
                        background: transparent ? "transparent" : color,
                        border: "1px solid #ccc"
                    }} />

                    {/* 🔥 COLOR PICKER */}
                    <input
                        type="color"
                        value={color}
                        disabled={transparent}
                        onChange={(e) => handleColorChange(e.target.value)}
                        style={{
                            width: "50px",
                            height: "45px",
                            border: "none",
                            cursor: "pointer"
                        }}
                    />

                    {/* 🔥 HEX INPUT */}
                    <input
                        type="text"
                        value={color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        placeholder="#000000"
                        style={{
                            width: "110px",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            fontSize: "14px"
                        }}
                    />

                    {/* 🔥 TRANSPARENT */}
                    <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "14px",
                        cursor: "pointer"
                    }}>
                        <input
                            type="checkbox"
                            checked={transparent}
                            onChange={() => setTransparent(!transparent)}
                        />
                        Transparent
                    </label>

                </div>

                {/* 🔥 SAMPLE BUTTON (LIVE EFFECT) */}
                <div style={{ marginTop: "25px" }}>
                    <button style={{
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "6px",
                        background: transparent ? "#ccc" : "var(--primary-color)",
                        color: "#fff",
                        cursor: "pointer"
                    }}>
                        Preview Button
                    </button>
                </div>

            </div>

        </div>
    );
};

export default ThemeColor;