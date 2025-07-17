import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

// ✅ HARD-CODED Airtable Base ID + Table ID
// Base ID: appRt8V3tH4g5Z5if
// Table ID: tbl4VnloRZJbaOZuw (💳 Stripe Payments Log)

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbl4VnloRZJbaOZuw';
const AIRTABLE_API_KEY = 'Bearer AIRTABLE_API_KEY';

const StripeBillingCard = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    failedPayments: 0,
    avgSubscription: 0,
    churnedClients: 0,
  });

  useEffect(() => {
    axios({
      method: 'GET',
      url: AIRTABLE_API_URL,
      headers: {
        Authorization: AIRTABLE_API_KEY,
      },
    }).then((response: any) => {
      const records: any[] = response.data.records;

      let totalRevenue = 0;
      let activeSubscriptions = 0;
      let failedPayments = 0;
      let totalSubscription = 0;
      let subscriptionCount = 0;
      let churnedClients = 0;

      for (const r of records) {
        totalRevenue += parseFloat(r.fields['💰 Total Paid'] || '0');
        activeSubscriptions += r.fields['📅 Subscription Status'] === 'Active' ? 1 : 0;
        failedPayments += parseInt(r.fields['❌ Failed Payments'] || '0');
        if (r.fields['💵 Subscription Amount']) {
          totalSubscription += parseFloat(r.fields['💵 Subscription Amount']);
          subscriptionCount++;
        }
        churnedClients += r.fields['🔁 Churned'] === true ? 1 : 0;
      }

      setMetrics({
        totalRevenue: +totalRevenue.toFixed(2),
        activeSubscriptions,
        failedPayments,
        avgSubscription: subscriptionCount > 0 ? +(totalSubscription / subscriptionCount).toFixed(2) : 0,
        churnedClients,
      });
    });
  }, []);

  return (
    <Card className="bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] p-4 border-2 border-[#00FFFF] shadow-xl text-white">
      <CardContent>
        <h3 className="text-white text-xl font-bold mb-4">💳 Stripe Billing KPIs</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm">💰 Total Revenue: <span className="text-[#00FFAA] font-bold text-lg">${metrics.totalRevenue}</span></p>
            <Progress value={Math.min(metrics.totalRevenue / 1000 * 100, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">📅 Active Subscriptions: <span className="text-[#FF3366] font-bold text-lg">{metrics.activeSubscriptions}</span></p>
            <Progress value={Math.min(metrics.activeSubscriptions, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">❌ Failed Payments: <span className="text-[#FF00FF] font-bold text-lg">{metrics.failedPayments}</span></p>
            <Progress value={Math.min(metrics.failedPayments, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">💵 Avg Subscription Value: <span className="text-[#00FFFF] font-bold text-lg">${metrics.avgSubscription}</span></p>
            <Progress value={Math.min(metrics.avgSubscription / 100 * 100, 100)} className="mt-1" />
          </div>
          <div>
            <p className="text-sm">🔁 Churned Clients: <span className="text-[#FFFF00] font-bold text-lg">{metrics.churnedClients}</span></p>
            <Progress value={Math.min(metrics.churnedClients, 100)} className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeBillingCard;
