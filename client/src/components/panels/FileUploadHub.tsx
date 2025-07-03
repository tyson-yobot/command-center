import * as React from "react";
import UniversalModal from "@/components/modals/UniversalModal";
import { useDropzone } from "react-dropzone";
import {
  ingestFileToRAG,
  listRAGDocuments,
  deleteRAGDocument,
  deleteAllRAGDocuments,
} from "@/modules/rag";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────
type UploadStatus = "processing" | "done" | "error";

interface UploadEntry {
  id: string;
  name: string;
  status: UploadStatus;
  selected?: boolean;
}

export interface FileUploadHubProps {
  open: boolean;
  onClose: () => void;
}

// ──────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────
const FileUploadHub: React.FC<FileUploadHubProps> = ({ open, onClose }) => {
  const [uploads, setUploads] = React.useState<UploadEntry[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) void fetchDocs();
  }, [open]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const docs = await listRAGDocuments();
      setUploads(
        docs.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          status: "done" as const,
          selected: false,
        }))
      );
    } catch {
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      setUploads(prev => [
        { id: file.name, name: file.name, status: "processing" },
        ...prev,
      ]);
      try {
        await ingestFileToRAG(file);
        toast.success("Memory updated ✅");
        void fetchDocs();
      } catch {
        setUploads(prev =>
          prev.map(u =>
            u.name === file.name ? { ...u, status: "error" } : u
          )
        );
        toast.error("Upload failed");
      }
    }
  }, []);

  const handleDeleteSelected = async () => {
    const toDelete = uploads.filter(u => u.selected);
    await Promise.all(toDelete.map(doc => deleteRAGDocument(doc.id)));
    toast.success("Deleted selected documents");
    void fetchDocs();
  };

  const handleDeleteAll = async () => {
    await deleteAllRAGDocuments();
    toast.success("All documents deleted");
    setUploads([]);
  };

  const toggleSelect = (id: string) => {
    setUploads(prev =>
      prev.map(u => (u.id === id ? { ...u, selected: !u.selected } : u))
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <UniversalModal open={open} onClose={onClose} title="Upload Documents">
      {/* Drag-and-drop zone */}
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center p-6 border-4 border-dashed rounded-2xl w-full bg-[#1a1a1a] border-[#0d82da] shadow-[0_0_25px_#0d82da] select-none"
      >
        <input {...getInputProps()} />
        <p className="text-white">
          {isDragActive ? "Drop the files here…" : "Drag & drop files here, or click to select"}
        </p>
      </div>

      {/* List */}
      <div className="mt-4 w-full">
        <h3 className="text-white mb-2">RAG Documents {loading && "(loading…)"}</h3>
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {uploads.map(u => (
            <li
              key={u.id}
              className="flex items-center justify-between text-[#c3c3c3]"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={u.selected || false}
                  onChange={() => toggleSelect(u.id)}
                />
                <span className="truncate max-w-[60%]">{u.name}</span>
              </label>
              <span>
                {u.status === "done" && "🟢"}
                {u.status === "processing" && "🟡"}
                {u.status === "error" && "🔴"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-6">
        <Button onClick={handleDeleteSelected} className="btn-red">
          Delete Selected
        </Button>
        <Button onClick={handleDeleteAll} className="btn-red">
          Delete All
        </Button>
        <Button onClick={onClose} className="btn-silver">
          Close
        </Button>
      </div>
    </UniversalModal>
  );
};

export default FileUploadHub;
