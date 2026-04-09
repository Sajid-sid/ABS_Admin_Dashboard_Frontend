import React from "react";

const TopbarBanner = ({ settings = {}, setSettings }) => {
  const isEnabled = settings?.topbarEnabled ?? false;
  const bannerImage = settings?.bannerImage ?? null;

  // Toggle topbar enable/disable
  const toggleTopbar = () => {
    if (!setSettings) return;

    setSettings((prev) => ({
      ...prev,
      topbarEnabled: !prev.topbarEnabled,
    }));
  };

  // Handle banner image upload
  const handleImageChange = (e) => {
    if (!setSettings) return;

    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSettings((prev) => ({
        ...prev,
        bannerImage: imageUrl,
      }));
    }
  };

  return (
    <div className="topbar-banner-settings">
      <h3>Topbar Banner</h3>

      <label>Enable Topbar Banner</label>
      <br />
      <button onClick={toggleTopbar}>
        {isEnabled ? "Disable" : "Enable"}
      </button>

      <br />
      <br />

      <label>Banner Image</label>
      <br />
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {bannerImage && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={bannerImage}
            width="200"
            alt="Banner Preview"
            style={{ borderRadius: "6px", border: "1px solid #ddd" }}
          />
        </div>
      )}
    </div>
  );
};

export default TopbarBanner;