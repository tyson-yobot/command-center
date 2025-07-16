import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Airtable from 'airtable';

const ContactRatioCard = () => {
  const [totalOutboundCalls, setTotalOutboundCalls] = useState(0);
  const [answeredCalls, setAnsweredCalls] = useState(0);
  const [contactRatio, setContactRatio] = useState(0);
  const [contactsReached, setContactsReached] = useState(0);
  const [contactsUnreachable, setContactsUnreachable] = useState(0);

  useEffect(() => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appRt8V3tH4g5Z5if');

    base('tblOXzI1AzCklA0Jv')
      .select({})
      .eachPage((records, fetchNextPage) => {
        let outbound = 0;
        let answered = 0;
        let reachable = 0;
        let unreachable = 0;

        records.forEach(record => {
          const isOutbound = record.fields['📤 Outbound Call'] === true;
          const wasAnswered = record.fields['📞 Answered'] === true;
          const wasReached = record.fields['👤 Contact Reached'] === true;
          const wasUnreachable = record.fields['❌ Contact Unreachable'] === true;

          if (isOutbound) outbound++;
          if (wasAnswered) answered++;
          if (wasReached) reachable++;
          if (wasUnreachable) unreachable++;
        });

        setTotalOutboundCalls(outbound);
        setAnsweredCalls(answered);
        setContactRatio(outbound > 0 ? Math.round((answered / outbound) * 100) : 0);
        setContactsReached(reachable);
        setContactsUnreachable(unreachable);

        fetchNextPage();
      });
  }, []);

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-950 text-white border-4 border-[#0d82da] shadow-xl rounded-2xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">📈 Contact Ratio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-[#c3c3c3]">📤 Outbound Calls</p>
          <p className="text-xl font-semibold text-[#00ffff]">{totalOutboundCalls}</p>
          <Progress value={totalOutboundCalls} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📞 Answered Calls</p>
          <p className="text-xl font-semibold text-[#00ffff]">{answeredCalls}</p>
          <Progress value={answeredCalls} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">📈 Contact Ratio</p>
          <p className="text-xl font-semibold text-[#00ffff]">{contactRatio}%</p>
          <Progress value={contactRatio} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">👤 Contacts Reached</p>
          <p className="text-xl font-semibold text-[#00ffff]">{contactsReached}</p>
          <Progress value={contactsReached} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
        <div>
          <p className="text-sm text-[#c3c3c3]">❌ Contacts Unreachable</p>
          <p className="text-xl font-semibold text-[#00ffff]">{contactsUnreachable}</p>
          <Progress value={contactsUnreachable} className="h-2 mt-1 bg-yobot-primary/20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactRatioCard;
