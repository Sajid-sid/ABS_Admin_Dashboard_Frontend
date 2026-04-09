import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WebSettings.css";

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
    alert_text_color: "#000000",
    alert_bg_color: "#ffffff",
    theme: "light",
    primary_color: "#4f46e5",
    secondary_color: "#06b6d4",
    font_style: "Poppins",
    footer_headline: "",
    copyright_text: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    twitter_url: ""
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
    alert("Settings saved 🚀");
    setHasChanges(false);
  };

  const sections = [
    { id: "alerts", label: "Alerts", icon: "🔔" },
    { id: "logo", label: "Logo", icon: "🖼" },
    { id: "theme", label: "Theme", icon: "🎨" },
    { id: "font", label: "Font", icon: "🔤" },
    { id: "footer", label: "Footer", icon: "📄" },
    { id: "social", label: "Social", icon: "🌐" }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "alerts":
        return (
          <div className="section">
            <h3>Alerts</h3>

            <div
              className="alertPreviewWrapper"
              style={{
                background: settings.alert_bg_color,
                color: settings.alert_text_color
              }}
            >
              <div className="alertMarquee">
                <div className="alertTrack">
                  {[1,2,3,4,5]
                    .map(n => settings[`alert_${n}_text`])
                    .filter(Boolean)
                    .map((t, i) => (
                      <span key={i} className="alertItem">{t}</span>
                    ))}
                </div>
              </div>
            </div>

            {[1,2,3,4,5].map(n => (
              <input
                key={n}
                name={`alert_${n}_text`}
                placeholder={`Alert Text ${n}`}
                value={settings[`alert_${n}_text`] || ""}
                onChange={handleChange}
              />
            ))}

            <label>Text Color</label>
            <div className="colorField">
              <div className="colorBox" style={{background:settings.alert_text_color}}/>
              <input type="color" name="alert_text_color" value={settings.alert_text_color} onChange={handleChange}/>
              <input type="text" name="alert_text_color" value={settings.alert_text_color} onChange={handleChange}/>
            </div>

            <label>Background Color</label>
            <div className="colorField">
              <div className="colorBox" style={{background:settings.alert_bg_color}}/>
              <input type="color" name="alert_bg_color" value={settings.alert_bg_color} onChange={handleChange}/>
              <input type="text" name="alert_bg_color" value={settings.alert_bg_color} onChange={handleChange}/>
            </div>
          </div>
        );

      case "logo":
        return (
          <div className="section">
            <h3>Logo</h3>
            <input type="file" onChange={handleLogoChange}/>
            {logoPreview && <img className="logoPreview" src={logoPreview}/>}
          </div>
        );

      case "theme":
        return (
          <div className="section">
            <h3>Theme</h3>

            <select name="theme" value={settings.theme} onChange={handleChange}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>

            <label>Primary Color</label>
            <div className="colorField">
              <div className="colorBox" style={{background:settings.primary_color}}/>
              <input type="color" name="primary_color" value={settings.primary_color} onChange={handleChange}/>
              <input type="text" name="primary_color" value={settings.primary_color} onChange={handleChange}/>
            </div>

            <label>Secondary Color</label>
            <div className="colorField">
              <div className="colorBox" style={{background:settings.secondary_color}}/>
              <input type="color" name="secondary_color" value={settings.secondary_color} onChange={handleChange}/>
              <input type="text" name="secondary_color" value={settings.secondary_color} onChange={handleChange}/>
            </div>
          </div>
        );

      case "font":
        return (
          <div className="section">
            <h3>Font</h3>

            <select name="font_style" value={settings.font_style} onChange={handleChange}>
              <option>Poppins</option>
              <option>Roboto</option>
              <option>Inter</option>
              <option>Montserrat</option>
            </select>

            <div className="fontPreview" style={{fontFamily:settings.font_style}}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
        );

      case "footer":
        return (
          <div className="section">
            <h3>Footer</h3>
            <input name="footer_headline" placeholder="Footer headline" value={settings.footer_headline} onChange={handleChange}/>
            <input name="copyright_text" placeholder="Copyright" value={settings.copyright_text} onChange={handleChange}/>
          </div>
        );

      case "social":
        return (
          <div className="section">
            <h3>Social Links</h3>
            <input name="facebook_url" placeholder="Facebook" value={settings.facebook_url} onChange={handleChange}/>
            <input name="instagram_url" placeholder="Instagram" value={settings.instagram_url} onChange={handleChange}/>
            <input name="linkedin_url" placeholder="LinkedIn" value={settings.linkedin_url} onChange={handleChange}/>
            <input name="twitter_url" placeholder="Twitter" value={settings.twitter_url} onChange={handleChange}/>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settingsPage">
      <div className="settingsContainer">

        <aside className="settingsSidebar">
          <h2>Site Settings</h2>

          {sections.map(item => (
            <button
              key={item.id}
              className={`sidebarItem ${activeSection===item.id ? "active" : ""}`}
              onClick={()=>setActiveSection(item.id)}
            >
              <span className="sidebarIcon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </aside>

        <main className="settingsMain">
          <div key={activeSection} className="settingsCard">
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