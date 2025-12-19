import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./DescriptionEditor.css";

/* ===============================
   Upload Adapter (Images only)
================================ */
class UploadAdapter {
  constructor(loader, uploadUrl) {
    this.loader = loader;
    this.uploadUrl = uploadUrl;
  }

  async upload() {
    const file = await this.loader.file;

    const data = new FormData();
    data.append("upload", file);

    const res = await fetch(this.uploadUrl, {
      method: "POST",
      body: data,
    });

    const json = await res.json();

    // ✅ CKEditor REQUIRES `default`
    if (!json.default) {
      throw new Error("Upload failed");
    }

    return {
      default: json.default,
    };
  }

  abort() {}
}

/* ===============================
   Upload Adapter Plugin
================================ */
function UploadAdapterPlugin(editor, uploadUrl) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new UploadAdapter(loader, uploadUrl);
  };
}

/* ===============================
   MAIN COMPONENT
================================ */
export default function DescriptionEditor({
  uploadEndpoint = "/api/subcategories/upload-image",
}) {
  const [data, setData] = useState("");

  return (
    <div className="description-wrapper">
      <label>Description</label>

      <CKEditor
        editor={ClassicEditor}
        data={data}
        config={{
          extraPlugins: [(editor) => UploadAdapterPlugin(editor, uploadEndpoint)],

          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "link",
            "imageUpload",
            "mediaEmbed",
            "|",
            "undo",
            "redo",
          ],

          mediaEmbed: {
            previewsInData: true,
          },
        }}
        onChange={(event, editor) => {
          setData(editor.getData());
        }}
      />

      {/* HTML Preview */}
      <div style={{ marginTop: 15 }}>
        <strong>HTML Preview</strong>
        <div
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginTop: 5,
          }}
          dangerouslySetInnerHTML={{ __html: data }}
        />
      </div>
    </div>
  );
}
