import React, { useState, useEffect } from "react";

export default function FontSelector() {

  const [font, setFont] = useState(
    localStorage.getItem("font") || "'Poppins', sans-serif"
  );

  useEffect(() => {
    // Apply to root (html)
    document.documentElement.style.setProperty("--app-font", font);

    // Apply directly to body also
    document.body.style.fontFamily = font;

    localStorage.setItem("font", font);
  }, [font]);

  return (
    <div className="font-selector">
      <select
        value={font}
        onChange={(e) => setFont(e.target.value)}
        className="font-dropdown"
      >
        <option value="' english', sans-serif">select</option>
        <option value="'Roboto', sans-serif">Roboto</option>
        <option value="Arial, sans-serif">Arial</option>
        <option value="Verdana, sans-serif">Verdana</option>
        <option value="Tahoma, sans-serif">Tahoma</option>
        <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="'Courier New', monospace">Courier New</option>
        <option value="'Segoe UI', sans-serif">Segoe UI</option>
        <option value="'Lucida Sans', sans-serif">Lucida Sans</option>
        <option value="Impact, sans-serif">Impact</option>

      </select>
    </div>
  );
}