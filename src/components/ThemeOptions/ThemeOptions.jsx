import React, { useState } from "react";
import "./ThemeOptions.css";
import General from "./General";
import Header from "./Header";
import TopbarBanner from "./TopBanner";
import DarkMode from "./DarkMode";
import ThemeColor from "./Themecolor";
import Social from "./Social";

/* Dynamic Categories */
const navCategories = {
  Jewelry: ["Home", "Necklace", "Earrings"],
  "Fashion / Clothing": ["Shirts", "Dresses", "Jackets"],
  Footwear: ["Shoes", "Sandals"]
};

/* Default Theme Settings */
const defaultSettings = {
  themeColor: "#31c4ab",
  darkMode: false,
  socialLinks: {},
  headerOptions: {},
  navCategories: navCategories,
  topbarEnabled: false,
  bannerImage: null
};

const ThemeOptions = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [activeSub, setActiveSub] = useState("");
  const [openCategory, setOpenCategory] = useState(null);

  const [openMenu, setOpenMenu] = useState({
    general: true,
    header: false
  });

  /* Local Theme Settings State */
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("themeSettings");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (error) {
      console.error("Error loading settings:", error);
      return defaultSettings;
    }
  });

  /* Toggle Sidebar Menu */
  const toggleMenu = (menu) => {
    setOpenMenu((prev) => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  /* Save Settings */
  const handleSave = () => {
    localStorage.setItem("themeSettings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  /* Reset Only Active Section */
  const handleResetSection = () => {
    setSettings((prev) => {
      const updated = { ...prev };

      if (activeTab === "general") {
        if (activeSub === "navlogo") updated.themeColor = defaultSettings.themeColor;
        if (activeSub === "dark") updated.darkMode = defaultSettings.darkMode;
        if (activeSub === "navcat") updated.navCategories = defaultSettings.navCategories;
      }

      if (activeTab === "header") {
        updated.headerOptions = defaultSettings.headerOptions;
      }

      if (activeTab === "topbar") {
        updated.topbarEnabled = defaultSettings.topbarEnabled;
        updated.bannerImage = defaultSettings.bannerImage;
      }

      if (activeTab === "social") {
        updated.socialLinks = defaultSettings.socialLinks;
      }

      return updated;
    });

    alert("Section reset successfully!");
  };

  /* Reset All Settings */
  const handleResetAll = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("themeSettings");
    alert("All settings reset to default!");
  };

  return (
    <div className="to-theme-container">
      {/* HEADER */}
      <div className="to-topbar">
        <h2>Fashion Theme</h2>
        <div className="to-top-buttons">
          <button onClick={handleSave}>Save Changes</button>
          <button onClick={handleResetSection}>Reset Section</button>
          <button onClick={handleResetAll}>Reset All</button>
        </div>
      </div>

      <div className="to-main">
        {/* SIDEBAR */}
        <div className="to-theme-options-list">
          {/* GENERAL */}
          <p
            className={activeTab === "general" ? "to-active-menu" : ""}
            onClick={() => {
              setActiveTab("general");
              toggleMenu("general");
            }}
          >
            General
          </p>

          {openMenu.general && (
            <div className="to-submenu">
              <p
                className={activeSub === "navcat" ? "to-active-sub" : ""}
                onClick={() => setActiveSub("navcat")}
              >
                Nav Categories
              </p>

              {activeSub === "navcat" && (
                <div className="to-submenu-level2">
                  {Object.entries(settings.navCategories).map(
                    ([category, items]) => (
                      <div key={category}>
                        <p
                          className="to-category-title"
                          onClick={() =>
                            setOpenCategory(
                              openCategory === category ? null : category
                            )
                          }
                        >
                          {category}
                          <span>{openCategory === category ? "-" : "+"}</span>
                        </p>

                        {openCategory === category && (
                          <div className="to-submenu-level3">
                            {items.map((item, index) => (
                              <p key={index}>{item}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              <p onClick={() => setActiveSub("navlogo")}>
                🌓 Appearance / Theme Color
              </p>

              <p onClick={() => setActiveSub("dark")}>
                🌙 Dark / Light Switcher
              </p>
            </div>
          )}

          {/* HEADER */}
          <p
            className={activeTab === "header" ? "to-active-menu" : ""}
            onClick={() => {
              setActiveTab("header");
              toggleMenu("header");
            }}
          >
            Header
          </p>

          {/* TOPBAR */}
          <p
            className={activeTab === "topbar" ? "to-active-menu" : ""}
            onClick={() => setActiveTab("topbar")}
          >
            Topbar Banner
          </p>

          {/* BLOG */}
          <p>Blog</p>

          {/* SOCIAL */}
          <p
            className={activeTab === "social" ? "to-active-menu" : ""}
            onClick={() => setActiveTab("social")}
          >
            Social
          </p>
        </div>

        {/* CONTENT */}
        <div className="to-content">
          {activeTab === "general" && activeSub === "" && (
            <General settings={settings} setSettings={setSettings} />
          )}
          {activeTab === "general" && activeSub === "navlogo" && (
            <ThemeColor settings={settings} setSettings={setSettings} />
          )}
          {activeTab === "general" && activeSub === "navcat" && (
            <General settings={settings} setSettings={setSettings} />
          )}
          {activeTab === "general" && activeSub === "dark" && (
            <DarkMode settings={settings} setSettings={setSettings} />
          )}
          {activeTab === "header" && (
            <Header settings={settings} setSettings={setSettings} />
          )}
          {activeTab === "topbar" && (
            <TopbarBanner settings={settings} setSettings={setSettings} />
          )}
          {activeTab === "social" && (
            <Social settings={settings} setSettings={setSettings} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeOptions;