import React, { useState } from "react";

const Header = () => {
  const [activeSection, setActiveSection] = useState("option");

  return (
    <div>
      <h3>Header Settings</h3>

      {/* Header options list */}
      <div>
        <p onClick={() => setActiveSection("option")}>Header Option</p>
        <p onClick={() => setActiveSection("top")}>Header Top</p>
        <p onClick={() => setActiveSection("logo")}>Header Logo</p>
        <p onClick={() => setActiveSection("menu")}>Menu</p>
      </div>

      {/* Section content */}
      <div>
        {activeSection === "option" && <div>Header Option Settings</div>}
        {activeSection === "top" && <div>Header Top Settings</div>}
        {activeSection === "logo" && <div>Header Logo Settings</div>}
        {activeSection === "menu" && <div>Menu Settings</div>}
      </div>
    </div>
  );
};

export default Header;