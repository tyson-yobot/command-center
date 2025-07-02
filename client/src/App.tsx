import React, { lazy, Suspense, useState } from "react";
import { FEATURES, Feature } from "@/feature-registry";
import "./index.css";

// Lazy loader for modal components
const loadModule = (path: string) =>
  lazy(() => import(/* @vite-ignore */ path));

export default function App() {
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const Modal = activeFeature ? loadModule(activeFeature.componentPath) : null;

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-[#0d82da] drop-shadow-xl">
          ⚙️ YoBot® Command Center
        </h1>
        <p className="text-[#c3c3c3] mt-2">Automation & Ops Dashboard</p>
      </header>

      {/* Feature Launchpad */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {FEATURES.map((feature: Feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveFeature(feature)}
            className="yobot-card flex flex-col items-center justify-center p-4 hover:scale-105 transition-transform"
          >
            <span className="text-4xl mb-2">{feature.emoji}</span>
            <span className="font-semibold text-center leading-tight">
              {feature.label}
            </span>
          </button>
        ))}
      </section>

      {/* Dynamic Modal */}
      {activeFeature && Modal && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center text-white">
              Loading…
            </div>
          }
        >
          <Modal onClose={() => setActiveFeature(null)} />
        </Suspense>
      )}
    </div>
  );
}
