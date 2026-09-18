// src/components/ui/ImagePicker.jsx
import { useRef, useState } from "react";
import { Image as ImageIcon, Camera, X, Loader2 } from "lucide-react";
import { uploadImage } from "../../api/upload.js";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function ImagePicker({ value, onChange, label }) {
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      onChange(res.url);
      showToast({ type: "success", title: "Image uploaded" });
    } catch (err) {
      showToast({ type: "error", title: "Upload failed", description: err.response?.data?.message || err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && (
        <label className="text-text-secondary" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 500 }}>
          {label}
        </label>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])} />

      {!value ? (
        <div className="flex" style={{ gap: "8px" }}>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="inline-flex items-center justify-center rounded-lg font-medium"
            style={{ flex: 1, padding: "12px", gap: "8px", fontSize: "13px", border: "1px dashed var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", opacity: uploading ? 0.6 : 1, cursor: "pointer" }}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
            Gallery
          </button>
          <button type="button" onClick={() => camRef.current?.click()} disabled={uploading}
            className="inline-flex items-center justify-center rounded-lg font-medium"
            style={{ flex: 1, padding: "12px", gap: "8px", fontSize: "13px", border: "1px dashed var(--color-border-strong)", backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", opacity: uploading ? 0.6 : 1, cursor: "pointer" }}>
            <Camera size={14} />
            Camera
          </button>
        </div>
      ) : (
        <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--color-border)" }}>
          <img src={value} alt="Preview" style={{ width: "100%", maxHeight: "280px", objectFit: "cover", display: "block" }} />
          <button type="button" onClick={() => onChange("")}
            style={{ position: "absolute", top: "8px", right: "8px", padding: "6px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", border: "none", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
