import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function MailchimpSyncDashboard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mailchimp Sync Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Badge variant="secondary">Syncing</Badge>
          <Progress value={60} className="w-full" />
          <p>Mailchimp synchronization is in progress.</p>
          <Button className="w-full">Sync Now</Button>
        </div>
      </CardContent>
    </Card>
  );
}