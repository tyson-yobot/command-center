import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';

interface LiveChatInterfaceProps {
  onBack: () => void;
}

const LiveChatInterface: React.FC<LiveChatInterfaceProps> = ({ onBack }) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <MessageCircle className="h-5 w-5" />
        <h2 className="text-xl font-bold">Live Chat Interface</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No active chat sessions
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { LiveChatInterface };