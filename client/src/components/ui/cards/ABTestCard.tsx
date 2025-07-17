import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

// Strong typing for record shape
interface ABTestFields {
  '📞 Total Calls': number;
  '🅰️ Conversion Rate A': string;
  '🅱️ Conversion Rate B': string;
  '✅ Winning Variant': 'A' | 'B' | string;
}

const ABTestCard = () => {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const base = new Airtable({ apiKey: 'keyUqv2kA1ZybA8Rf' }).base('appRt8V3tH4g5Z5if');

    const fetchAllRecords = async () => {
      const fetched: any[] = [];

      await base('tbl6Ak4SpT8dug61Yr')
        .select({ view: 'Grid view' })
        .eachPage((arg1: any, arg2: any) => {
          fetched.push(...arg1);
          arg2();
        });

      setRecords(fetched);
    };

    fetchAllRecords();
  }, []);

  const totalTests = records.length;
  const overTenCalls = records.filter((r: any) => r.fields['📞 Total Calls'] > 10).length;

  const aConversions = records
    .map((r: any) => parseFloat(r.fields['🅰️ Conversion Rate A']))
    .filter((x: any) => !isNaN(x));

  const bConversions = records
    .map((r: any) => parseFloat(r.fields['🅱️ Conversion Rate B']))
    .filter((x: any) => !isNaN(x));

  const aConversionAvg = aConversions.reduce((a: any, b: any) => a + b, 0) / (aConversions.length || 1);
  const bConversionAvg = bConversions.reduce((a: any, b: any) => a + b, 0) / (bConversions.length || 1);

  const winningCount = records.filter((r: any) =>
    ['A', 'B'].includes(r.fields['✅ Winning Variant'])
  ).length;

  return (
    <Card className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] text-white border-2 border-[#0d82da] shadow-lg rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-neon font-bold text-xl">🧪 A/B Test Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">📊 Total A/B Tests Run</p>
          <p className="text-lg font-semibold text-neon">{totalTests}</p>
          <Progress value={Math.min(100, totalTests)} className="h-2 mt-1" />
        </div>

        <div>
          <p className="text-sm text-gray-400">📞 % of Tests with &gt;10 Calls</p>
          <p className="text-lg font-semibold text-neon">
            {((overTenCalls / (totalTests || 1)) * 100).toFixed(1)}%
          </p>
          <Progress value={Math.min(100, (overTenCalls / (totalTests || 1)) * 100)} className="h-2 mt-1" />
        </div>

        <div>
          <p className="text-sm text-gray-400">🅰️ Average Conversion Rate (A Variant)</p>
          <p className="text-lg font-semibold text-neon">{aConversionAvg.toFixed(2)}%</p>
          <Progress value={Math.min(100, aConversionAvg)} className="h-2 mt-1" />
        </div>

        <div>
          <p className="text-sm text-gray-400">🅱️ Average Conversion Rate (B Variant)</p>
          <p className="text-lg font-semibold text-neon">{bConversionAvg.toFixed(2)}%</p>
          <Progress value={Math.min(100, bConversionAvg)} className="h-2 mt-1" />
        </div>

        <div>
          <p className="text-sm text-gray-400">✅ Winning Variant Count</p>
          <p className="text-lg font-semibold text-neon">{winningCount}</p>
          <Progress value={Math.min(100, (winningCount / (totalTests || 1)) * 100)} className="h-2 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ABTestCard;
