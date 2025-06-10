import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function ContentCreatorDashboard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Creator Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Badge variant="default">Active</Badge>
          <Progress value={75} className="w-full" />
          <p>Content creation system is running smoothly.</p>
          <Button className="w-full">Create Content</Button>
        </div>
      </CardContent>
    </Card>
  );
}