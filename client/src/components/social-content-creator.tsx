import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

export function SocialContentCreator() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Social Content Creator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Badge variant="default">Ready</Badge>
          <Progress value={90} className="w-full" />
          <Textarea placeholder="Enter your content ideas..." className="min-h-[100px]" />
          <Button className="w-full">Generate Content</Button>
        </div>
      </CardContent>
    </Card>
  );
}