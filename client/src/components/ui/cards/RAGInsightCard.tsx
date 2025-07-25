import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

const RAGInsightsCard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    docsEmbedded: 0,
    vectorImports: 0,
    ragHits: 0,
    aiSuggestions: 0,
    knowledgeQueries: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
   

const response = await axios.get<{ records: any[] }>(
  'https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tblhux5RjOYMaQ3R1',
  {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    },
  }
);
        const records = response.data.records;

        let docsEmbedded = 0;
        let vectorImports = 0;
        let ragHits = 0;
        let aiSuggestions = 0;
        let knowledgeQueries = 0;

        records.forEach((record: Record<string, any>) => {
          docsEmbedded += parseInt(record.fields['📄 Docs Embedded'] || '0', 10);
          vectorImports += parseInt(record.fields['📥 Vector Imports'] || '0', 10);
          ragHits += parseInt(record.fields['🤖 RAG Hits'] || '0', 10);
          aiSuggestions += parseInt(record.fields['🧠 AI Suggestions Activated'] || '0', 10);
          knowledgeQueries += parseInt(record.fields['🕵️‍♂️ Knowledge Queries'] || '0', 10);
        });

        setMetrics({ docsEmbedded, vectorImports, ragHits, aiSuggestions, knowledgeQueries });
      } catch (error: any) {
        console.error('[ERROR] Fetching RAG Airtable metrics failed:', error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-[#1f0036] to-[#4a0072] p-4 border-2 border-fuchsia-600 shadow-xl text-white">
      <CardContent>
        <h3 className="text-white text-xl font-bold mb-4">🧠 RAG Insights Dashboard</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm">📄 Docs Embedded: <span className="text-[#A3F3FF] font-bold text-lg">{metrics.docsEmbedded}</span></p>
            <Progress value={Math.min(metrics.docsEmbedded, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">📥 Vector Imports: <span className="text-[#88FFD9] font-bold text-lg">{metrics.vectorImports}</span></p>
            <Progress value={Math.min(metrics.vectorImports, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🤖 RAG Hits: <span className="text-[#FFD6F9] font-bold text-lg">{metrics.ragHits}</span></p>
            <Progress value={Math.min(metrics.ragHits, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🧠 AI Suggestions: <span className="text-[#C2FF00] font-bold text-lg">{metrics.aiSuggestions}</span></p>
            <Progress value={Math.min(metrics.aiSuggestions, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🕵️‍♂️ Knowledge Queries: <span className="text-[#FF6AD5] font-bold text-lg">{metrics.knowledgeQueries}</span></p>
            <Progress value={Math.min(metrics.knowledgeQueries, 100)} className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RAGInsightsCard;
