import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function CallMonitoringPopup() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Call Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Badge variant="secondary">Active</Badge>
          <p>Call monitoring is active and functioning properly.</p>
          <Button className="w-full">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}