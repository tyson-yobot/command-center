import React, { useEffect, useState } from 'react';

const BASE_ID = 'appRt8V3tH4g5Z5if';
const TABLE_ID = 'tblCLICONF';

const TopNavBarCard = () => {
  const [agent, setAgent] = useState('Agent');

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula=feature_key='dashboard_greeting'`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_TOKEN}`,
          },
        }
      );
      const json = await res.json();
      setAgent(json.records?.[0]?.fields?.value || 'Agent');
    };
    loadUser();
  }, []);

  return (
    <nav className="w-full px-4 py-2 flex justify-between items-center bg-yobot-primary/10 border-b border-yobot-primary text-white">
      <div className="text-lg font-bold tracking-tight">YoBot® Command Center</div>
      <div className="text-sm">Welcome, {agent}</div>
    </nav>
  );
};

export default TopNavBarCard;
