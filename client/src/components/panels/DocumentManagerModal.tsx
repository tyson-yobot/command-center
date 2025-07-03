import React, { useEffect, useState } from "react";

import UniversalModal from "../modals/UniversalModal";
import {
  listRAGDocuments,
  deleteRAGDocument,
  deleteAllRAGDocuments,
} from "../../modules/rag/documents";
import { RAGDocMeta } from "../../modules/rag/rag.types";
import { Button } from "../ui/button";


import { toast } from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DocumentManagerModal: React.FC<Props> = ({ open, onClose }) => {
  const [docs, setDocs] = useState<RAGDocMeta[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await listRAGDocuments();
      setDocs(data);
    } catch {
      toast.error("Failed to load docs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadDocs();
  }, [open]);

  const handleDelete = async (id: string) => {
    await deleteRAGDocument(id);
    toast.success("Deleted");
    loadDocs();
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete ALL documents?")) return;
    await deleteAllRAGDocuments();
    toast.success("All documents deleted");
    loadDocs();
  };

  return (
    <UniversalModal open={open} onClose={onClose} title="Manage Documents">
      <div className="p-4 space-y-4">
        {docs.length === 0 ? (
          <p className="text-sm text-gray-400">No documents uploaded yet.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {docs.map(doc => (
              <li key={doc.id} className="flex justify-between items-center">
                <span className="truncate max-w-[70%] text-[#c3c3c3]">{doc.name}</span>
                <Button className="btn-red" onClick={() => handleDelete(doc.id)}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}

        {docs.length > 0 && (
          <div className="flex justify-end">
            <Button className="btn-red" onClick={handleDeleteAll}>
              Delete All
            </Button>
          </div>
        )}
      </div>
    </UniversalModal>
  );
};

export default DocumentManagerModal;