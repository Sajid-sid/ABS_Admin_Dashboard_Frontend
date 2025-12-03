// DescriptionEditor.jsx
import React, { useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./DescriptionEditor.css"; // optional styling

// Custom upload adapter class
class MyUploadAdapter {
  constructor(loader, uploadUrl) {
    this.loader = loader; // CKEditor FileLoader instance
    this.uploadUrl = uploadUrl;
  }

  // Starts the upload process.
  upload() {
    return this.loader.file
      .then(file => new Promise((resolve, reject) => {
        const data = new FormData();
        // "upload" will be the field name the backend expects
        data.append("upload", file);

        fetch(this.uploadUrl, {
          method: "POST",
          body: data
        })
        .then(async res => {
          if (!res.ok) {
            const text = await res.text();
            return reject(text || "Upload failed");
          }
          return res.json();
        })
        .then(json => {
          // backend must return { url: "https://..." }
          resolve({
            default: json.url
          });
        })
        .catch(err => {
          reject(err.message || "Upload error");
        });
      }));
  }

  // Optional: abort the upload.
  abort() {
    // Not implemented: you can abort fetch if you implement AbortController.
  }
}

// Plugin to integrate upload adapter with CKEditor instance
function MyCustomUploadAdapterPlugin(editor, uploadUrl) {
  editor.plugins.get("FileRepository").createUploadAdapter = loader => {
    return new MyUploadAdapter(loader, uploadUrl);
  };
}

export default function DescriptionEditor({ uploadEndpoint = "/api/upload" }) {
  const [data, setData] = useState("");
  const editorRef = useRef();

  return (
    <div className="description-wrapper">
      <label className="description-label">Description</label>
      <CKEditor
        editor={ClassicEditor}
        config={{
          extraPlugins: [editor => MyCustomUploadAdapterPlugin(editor, uploadEndpoint)],
          toolbar: [
            "undo", "redo",
            "|", "bold", "italic", "underline",
            "|", "link", "bulletedList", "numberedList",
            "|", "insertTable", "mediaEmbed", "uploadImage",
            "|", "removeFormat"
          ],
          image: {
            toolbar: [ "imageTextAlternative", "imageStyle:full", "imageStyle:side" ]
          },
          table: {
            contentToolbar: [ "tableColumn", "tableRow", "mergeTableCells" ]
          },
          mediaEmbed: {
            previewsInData: true
          }
        }}
        onReady={editor => {
          editorRef.current = editor;
        }}
        data={data}
        onChange={(event, editor) => {
          const html = editor.getData();
          setData(html);
        }}
      />
      {/* Example: show html content */}
      <div style={{ marginTop: 12 }}>
        <strong>HTML output preview (for debugging):</strong>
        <div style={{ border: "1px solid #ddd", padding: 8, minHeight: 60 }}>
          <div dangerouslySetInnerHTML={{ __html: data }} />
        </div>
      </div>
    </div>
  );
}
