// ✅ ADVANCED TOOLS DRAWER — FULL AUTOMATION
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdvancedToolsDrawer = () => {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    axios.get('https://api.yobot.ai/advanced-tools?token=prod_A1B2C3')
      .then(res => setTools(res.data.tools))
      .catch(err => {
        console.error('Advanced Tools Fetch Error', err);
        toast.error('❌ Advanced Tools failed to load');
      });
  }, []);

  const launchTool = (toolId) => {
    axios.post('https://api.yobot.ai/launch-tool', { toolId, authKey: 'prod_A1B2C3' })
      .then(() => toast.success(`✅ ${toolId} Launched`))
      .catch(() => toast.error(`❌ Failed to launch ${toolId}`));
  };

  return (
    <div className="rounded-xl border-4 border-yellow-400 p-4 bg-gradient-to-br from-gray-800 to-gray-600 shadow-xl text-white">
      <h2 className="text-xl font-bold mb-4">🧰 Advanced Tools</h2>
      <ul className="space-y-2">
        {tools.map((tool, i) => (
          <li key={i} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
            <span className="font-semibold">{tool.name}</span>
            <button
              onClick={() => launchTool(tool.id)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-700 rounded text-sm"
            >Launch</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
