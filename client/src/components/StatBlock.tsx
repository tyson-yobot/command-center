// components/StatBlock.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BarChartBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function StatBlock({ title, value, icon: Icon, className }: {
  title: string;
  value: string;
  icon?: any;
  className?: string;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] bg-black rounded-2xl p-6 border-2 border-[#0d82da] shadow-[0_0_20px_#0d82daAA] relative overflow-hidden",
        className
      )}
    >
      {/* Silver shine top overlay */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#aaa] to-[#fff] opacity-70 z-10" />

      <Card className="bg-black shadow-none border-none z-20 relative">
        <CardContent className="flex flex-col gap-2 p-0">
          <div className="text-sm text-[#c3c3c3] font-semibold flex items-center gap-2">
            {Icon && <Icon className="text-[#0d82da] w-4 h-4" />} {title}
          </div>
          <div className="text-2xl font-bold text-white">{value}</div>
        </CardContent>
      </Card>

      {/* Analytics Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <button
            onClick={() => setShowModal(true)}
            className="absolute bottom-3 right-3 bg-[#0d82da] text-white font-bold text-xs px-3 py-1.5 rounded-md shadow-md hover:brightness-125 transition"
          >
            <BarChartBig className="w-4 h-4 inline-block mr-1" /> Report
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl bg-black border-2 border-[#0d82da] shadow-[0_0_40px_#0d82da]">
          <DialogHeader>
            <DialogTitle className="text-white font-bold text-xl">📊 Detailed Metrics</DialogTitle>
          </DialogHeader>
          <div className="w-full h-[400px] text-white flex items-center justify-center">
            {/* Placeholder for charts - replace with actual chart component */}
            <p className="text-center opacity-70">Analytics charts coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}