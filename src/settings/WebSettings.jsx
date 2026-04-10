import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WebSettings.css";

const SIDEBAR_ITEMS = [
  { id: "alerts",  label: "Alerts",       icon: "🔔", desc: "Scrolling notification bar" },
  { id: "logo",    label: "Logo",         icon: "🖼",  desc: "Site logo & branding" },
  { id: "theme",   label: "Theme",        icon: "🎨", desc: "Colors & appearance" },
  { id: "font",    label: "Typography",   icon: "🔤", desc: "Font family & style" },
  { id: "footer",  label: "Footer",       icon: "📄", desc: "Footer content" },
  { id: "social",  label: "Social Links", icon: "🌐", desc: "Social media URLs" },
];

const FONTS = ["Poppins", "Roboto", "Inter", "Montserrat", "DM Sans", "Nunito"];

const ColorField = ({ label, name, value, onChange }) => (
  <div className="fieldGroup">
    {label && <label className="fieldLabel">{label}</label>}
    <div className="colorField">
      <div className="colorSwatch" style={{ background: value }}>
        <input type="color" name={name} value={value} onChange={onChange} />
      </div>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="colorHexInput"
        maxLength={7}
        spellCheck={false}
      />
    </div>
  </div>
);

const WebSettings = () => {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [activeSection, setActiveSection] = useState("alerts");
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState({
    alert_1_text: "",
    alert_2_text: "",
    alert_3_text: "",
    alert_4_text: "",
    alert_5_text: "",
    alert_text_color: "#0f172a",
    alert_bg_color: "#eff6ff",
    theme: "light",
    primary_color: "#2563eb",
    secondary_color: "#06b6d4",
    font_style: "Poppins",
    footer_headline: "",
    copyright_text: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    twitter_url: "",
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await axios.get(`${BASE_URL}/api/settings`);
    if (res.data.settings) {
      setSettings(res.data.settings);
      if (res.data.settings.logo_url) {
        setLogoPreview(`${BASE_URL}${res.data.settings.logo_url}`);
      }
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
    setHasChanges(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    const form = new FormData();
    Object.keys(settings).forEach((k) => form.append(k, settings[k]));
    if (logo) form.append("logo", logo);
    await axios.put(`${BASE_URL}/api/settings`, form);
    alert("Settings saved");
    setHasChanges(false);
  };

  const alertTexts = [1, 2, 3, 4, 5]
    .map((n) => settings[`alert_${n}_text`])
    .filter(Boolean);

  const activeItem = SIDEBAR_ITEMS.find((i) => i.id === activeSection);

  const renderSection = () => {
    switch (activeSection) {

      case "alerts":
        return (
          <>
            {/* Preview */}
            <div className="cardBlock">
              <p className="alertPreviewLabel">Live Preview</p>
              <div
                className="alertPreviewCard"
                style={{
                  background: settings.alert_bg_color,
                  color: settings.alert_text_color,
                }}
              >
                <div className="alertMarquee">
                  <div className="alertTrack">
                    {(alertTexts.length ? alertTexts : ["Your alert messages will appear here..."])
                      .concat(alertTexts.length ? alertTexts : ["Your alert messages will appear here..."])
                      .map((t, i) => (
                        <span key={i} className="alertItem">{t}</span>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Alert texts */}
            <div className="cardBlock">
              <h4>Alert Messages</h4>
              <div className="alertInputsGrid">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div className="fieldGroup" key={n}>
                    <label className="fieldLabel">Alert {n}</label>
                    <input
                      type="text"
                      name={`alert_${n}_text`}
                      placeholder={`Enter alert message ${n}…`}
                      value={settings[`alert_${n}_text`] || ""}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="cardBlock">
              <h4>Colors</h4>
              <div className="colorRow">
                <ColorField
                  label="Text Color"
                  name="alert_text_color"
                  value={settings.alert_text_color}
                  onChange={handleChange}
                />
                <ColorField
                  label="Background Color"
                  name="alert_bg_color"
                  value={settings.alert_bg_color}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        );

      case "logo":
        return (
          <div className="cardBlock">
            <h4>Upload Logo</h4>
            <div className="logoUploadArea">
              <input type="file" accept="image/*" onChange={handleLogoChange} />
              <span className="logoUploadIcon">🖼</span>
              <p className="logoUploadText">Click to upload or drag & drop</p>
              <p className="logoUploadSub">PNG, SVG, or JPG · Max 2MB</p>
            </div>
            {logoPreview && (
              <div className="logoPreviewArea">
                <img className="logoPreview" src={logoPreview} alt="Logo preview" />
                <span className="logoPreviewMeta">Current logo</span>
              </div>
            )}
          </div>
        );

      case "theme":
        return (
          <>
            <div className="cardBlock">
              <h4>Color Scheme</h4>
              <div className="themeChips">
                <button
                  type="button"
                  className={`themeChip light ${settings.theme === "light" ? "selected" : ""}`}
                  onClick={() => { handleChange({ target: { name: "theme", value: "light" } }); }}
                >
                  <span className="themeChipDot" />
                  Light
                </button>
                <button
                  type="button"
                  className={`themeChip dark ${settings.theme === "dark" ? "selected" : ""}`}
                  onClick={() => { handleChange({ target: { name: "theme", value: "dark" } }); }}
                >
                  <span className="themeChipDot" />
                  Dark
                </button>
              </div>
            </div>

            <div className="cardBlock">
              <h4>Brand Colors</h4>
              <div className="colorRow">
                <ColorField
                  label="Primary"
                  name="primary_color"
                  value={settings.primary_color}
                  onChange={handleChange}
                />
                <ColorField
                  label="Secondary"
                  name="secondary_color"
                  value={settings.secondary_color}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        );

      case "font":
        return (
          <div className="cardBlock">
            <h4>Font Family</h4>
            <div className="fieldGroup">
              <label className="fieldLabel">Choose font</label>
              <select name="font_style" value={settings.font_style} onChange={handleChange}>
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="fontPreviewBox" style={{ fontFamily: settings.font_style }}>
              <span>The quick brown fox jumps over the lazy dog — 0123456789</span>
            </div>
          </div>
        );

      case "footer":
        return (
          <div className="cardBlock">
            <h4>Footer Content</h4>
            <div className="fieldGroup">
              <label className="fieldLabel">Headline</label>
              <input
                type="text"
                name="footer_headline"
                placeholder="e.g. Let's build something great together"
                value={settings.footer_headline}
                onChange={handleChange}
              />
            </div>
            <div className="fieldGroup">
              <label className="fieldLabel">Copyright text</label>
              <input
                type="text"
                name="copyright_text"
                placeholder="e.g. © 2024 Acme Inc. All rights reserved."
                value={settings.copyright_text}
                onChange={handleChange}
              />
            </div>
          </div>
        );

      case "social":
        return (
          <div className="cardBlock">
            <h4>Social Profiles</h4>
            <div className="socialGrid">
              {[
                { name: "facebook_url",  icon: "f",  placeholder: "facebook.com/yourpage" },
                { name: "instagram_url", icon: "In", placeholder: "instagram.com/yourprofile" },
                { name: "linkedin_url",  icon: "Li", placeholder: "linkedin.com/in/yourprofile" },
                { name: "twitter_url",   icon: "𝕏",  placeholder: "x.com/yourhandle" },
              ].map(({ name, icon, placeholder }) => (
                <div className="fieldGroup" key={name}>
                  <label className="fieldLabel">{name.replace("_url", "").replace(/^./, c => c.toUpperCase())}</label>
                  <div className="socialField">
                    <span className="socialBadge">{icon}</span>
                    <input
                      type="text"
                      name={name}
                      placeholder={placeholder}
                      value={settings[name]}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settingsPage">
      <div className="settingsContainer">

        {/* Sidebar */}
        <aside className="settingsSidebar">
          <h2>Settings</h2>
          <div className="sidebarGroup">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`sidebarItem ${activeSection === item.id ? "active" : ""}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="sidebarIcon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="settingsMain">
          {activeItem && (
            <div className="sectionHeader">
              <div className="sectionIconLarge">{activeItem.icon}</div>
              <div>
                <h3>{activeItem.label}</h3>
                <p>{activeItem.desc}</p>
              </div>
            </div>
          )}

          <div className="settingsCard">
            {renderSection()}
          </div>
        </main>

      </div>

      {hasChanges && (
        <div className="saveBarSticky">
          <span>Unsaved changes</span>
          <button className="saveBtn" onClick={saveSettings}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default WebSettings;