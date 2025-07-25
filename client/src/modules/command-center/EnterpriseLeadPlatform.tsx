// Enterprise Lead Platform - YoBot®
// Swapped from CommandCenter.tsx to EnterpriseLeadPlatform.tsx layout

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LeadScraperModal from "@/components/modals/LeadScraperModal";
import yobotLogo from "@/assets/Engage Smarter Logo Transparent.png";

const EnterpriseLeadPlatform = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleLaunchModal = (tool: string) => {
    setSelectedTool(tool);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTool(null);
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <header className="flex justify-between items-center bg-white text-black px-6 py-4 rounded-xl shadow border-b-4 border-blue-500">
        <img src={yobotLogo} alt="YoBot Logo" className="h-10" />
        <h1 className="text-2xl font-bold">📈 Enterprise Lead Platform</h1>
      </header>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-6 text-center">🎯 Choose Your Lead Scraper</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Button
            className="bg-gradient-to-br from-slate-300 to-white text-black hover:from-white hover:to-slate-300 font-semibold shadow-xl py-6 rounded-2xl border border-white/30"
            onClick={() => handleLaunchModal("PhantomBuster")}
          >
            🥷 PhantomBuster
          </Button>
          <Button
            className="bg-gradient-to-br from-indigo-700 to-purple-800 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold shadow-xl py-6 rounded-2xl border border-white/30"
            onClick={() => handleLaunchModal("Apify")}
          >
            🧪 Apify
          </Button>
          <Button
            className="bg-gradient-to-br from-blue-500 to-gray-300 hover:from-gray-200 hover:to-blue-500 text-white font-semibold shadow-xl py-6 rounded-2xl border border-white/30"
            onClick={() => handleLaunchModal("Apollo")}
          >
            🚀 Apollo
          </Button>
        </div>
      </div>

      <LeadScraperModal
        isOpen={modalOpen}
        tool={selectedTool}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default EnterpriseLeadPlatform;
