import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import imageIcon from "@ckeditor/ckeditor5-core/theme/icons/image.svg";
import "./DescriptionEditor.css";

/* ===============================
   Upload Adapter (Image + Video)
================================ */
class UploadAdapter {
  constructor(loader, editor, uploadUrl) {
    this.loader = loader;
    this.editor = editor;
    this.uploadUrl = uploadUrl;
  }

  upload() {
    return this.loader.file.then((file) => {
      return new Promise(async (resolve, reject) => {
        try {
          const data = new FormData();
          data.append("upload", file);

          const res = await fetch(this.uploadUrl, {
            method: "POST",
            body: data,
          });

          const json = await res.json();
          const { url, type } = json;

          if (!url) throw new Error("Upload failed");

          // ✅ IMAGE
          if (type === "image") {
            resolve({ default: url });
            return;
          }

          // ✅ VIDEO
          const videoHTML = `
            <video controls style="max-width:100%">
              <source src="${url}" type="${file.type}" />
            </video>
          `;

          this.editor.model.change(() => {
            this.editor.setData(this.editor.getData() + videoHTML);
          });

          resolve({ default: url });
        } catch (err) {
          reject(err.message || "Upload error");
        }
      });
    });
  }

  abort() {}
}

/* ===============================
   Upload Adapter Plugin
================================ */
function UploadAdapterPlugin(editor, uploadUrl) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new UploadAdapter(loader, editor, uploadUrl);
  };
}

/* ===============================
   🎬 Upload Media Button Plugin
================================ */
function MediaUploadPlugin(editor) {
  editor.ui.componentFactory.add("uploadMedia", (locale) => {
    const view = new ButtonView(locale);

    view.set({
      label: "Upload Media",
      icon: imageIcon,
      tooltip: true,
    });

    view.on("execute", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,video/*"; // ✅ KEY LINE
      input.click();

      input.onchange = () => {
        const file = input.files[0];
        if (!file) return;

        const loader = editor.plugins
          .get("FileRepository")
          .createLoader(file);

        editor.plugins
          .get("FileRepository")
          .createUploadAdapter(loader)
          .upload();
      };
    });

    return view;
  });
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
        config={{
          extraPlugins: [
            (editor) => UploadAdapterPlugin(editor, uploadEndpoint),
            MediaUploadPlugin,
          ],
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
            "uploadMedia", // 🎬 OUR BUTTON
            "|",
            "undo",
            "redo",
          ],
        }}
        data={data}
        onChange={(event, editor) => setData(editor.getData())}
      />

      {/* Preview */}
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
