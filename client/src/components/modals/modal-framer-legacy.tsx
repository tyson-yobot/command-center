import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,.8)] backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className="card-shell max-w-lg w-full"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
        >
          <header className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">{title}</h3>
            <button className="btn-red px-4 py-1 text-sm" onClick={onClose}>✖</button>
          </header>
          <div>{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
