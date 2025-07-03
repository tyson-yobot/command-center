import React from "react";

const YoBotPreview = () => {
  return (
    <div className="p-6 space-y-6 bg-background text-foreground font-sans">
      <div className="space-x-3">
        <button className="btn-blue">Primary</button>
        <button className="btn-red">Critical</button>
        <button className="btn-green">Success</button>
        <button className="btn-purple">Alt</button>
        <button className="btn-silver">Secondary</button>
      </div>

      <div className="yobot-card p-6">
        <h2 className="text-lg font-bold mb-2">🧠 YoBot Card Example</h2>
        <p>This card uses your official color theme, borders, and shadows.</p>
      </div>

      <div className="h-32 overflow-y-scroll scrollbar-hide border-t pt-3">
        <p className="text-sm">
          Scrollable area without scrollbar. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque...
        </p>
      </div>
    </div>
  );
};

export { YoBotPreview };
