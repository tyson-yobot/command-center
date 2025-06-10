import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ZendeskChatWidget() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Zendesk Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Badge variant="default">Connected</Badge>
          <p>Zendesk chat integration is ready.</p>
          <Button className="w-full">Open Chat</Button>
        </div>
      </CardContent>
    </Card>
  );
}