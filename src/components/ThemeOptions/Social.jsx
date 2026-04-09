import React, { useState } from "react";

const Social = () => {
    const [socials, setSocials] = useState([
        {
            name: "Facebook",
            icon: "fa-facebook",
            url: "https://www.facebook.com/p/Aspire-TekHub-Solutions-61565362786512/",
            open: true
        },
        {
            name: "WhatsApp",
            icon: "fa-whatsapp",   // small 'w' (IMPORTANT)
            url: "https://wa.me/918096100571",
            open: false
        },
        {
            name: "Instagram",
            icon: "fa-instagram",
            url: "https://www.instagram.com/aspireths_store/",
            open: false
        },
        {
            name: "LinkedIn",
            icon: "fa-linkedin",
            url: "https://www.linkedin.com/company/aspire-tekhub-solutions/posts/?feedView=all",
            open: false
        }
    ]);

    const addSocial = () => {
        setSocials([
            ...socials,
            {
                name: "",
                icon: "",
                url: "",
                open: true
            }
        ]);
    };

    const toggleOpen = (index) => {
        const updated = [...socials];
        updated[index].open = !updated[index].open;
        setSocials(updated);
    };

    const handleChange = (index, field, value) => {
        const updated = [...socials];
        updated[index][field] = value;
        setSocials(updated);
    };

    const deleteItem = (index) => {
        const updated = socials.filter((_, i) => i !== index);
        setSocials(updated);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Social</h2>

            <p style={{ fontWeight: "600", marginTop: "10px" }}>
                Social Profile Links
            </p>

            <p style={{ fontSize: "13px", color: "gray", marginBottom: "15px" }}>
                Add social icon and url.
            </p>

            <button
                onClick={addSocial}
                style={{
                    marginBottom: "15px",
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#4CAF50",
                    color: "white",
                    cursor: "pointer"
                }}
            >
                + Add Social
            </button>

            {socials.map((item, index) => (
                <div
                    key={index}
                    style={{
                        border: "1px solid #f1c40f",
                        borderRadius: "6px",
                        marginBottom: "15px",
                        overflow: "hidden"
                    }}
                >
                    {/* HEADER */}
                    <div
                        onClick={() => toggleOpen(index)}
                        style={{
                            background: "#fff8e1",
                            padding: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >
                        <span>{item.name}</span>
                        <span>{item.open ? "▾" : "▸"}</span>
                    </div>

                    {/* BODY */}
                    {item.open && (
                        <div
                            style={{
                                padding: "15px",
                                background: "#fafafa",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px"
                            }}
                        >
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                    handleChange(index, "name", e.target.value)
                                }
                                placeholder="Name"
                                style={{
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#eee"
                                }}
                            />

                            <input
                                type="text"
                                value={item.icon}
                                onChange={(e) =>
                                    handleChange(index, "icon", e.target.value)
                                }
                                placeholder="fa-facebook"
                                style={{
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#eee",
                                }}
                            />

                            <input
                                type="text"
                                value={item.url}
                                onChange={(e) =>
                                    handleChange(index, "url", e.target.value)
                                }
                                placeholder="https://..."
                                style={{
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#eee"
                                }}
                            />

                            <button
                                onClick={() => deleteItem(index)}
                                style={{
                                    width: "90px",
                                    padding: "8px",
                                    border: "none",
                                    borderRadius: "6px",
                                    background: "#ff6b6b",
                                    color: "white",
                                    cursor: "pointer"
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Social;