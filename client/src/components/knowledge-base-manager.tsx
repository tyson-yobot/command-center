import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database } from 'lucide-react';

interface KnowledgeBaseManagerProps {
  onBack: () => void;
}

const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ onBack }) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Database className="h-5 w-5" />
        <h2 className="text-xl font-bold">Knowledge Base Manager</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No knowledge base entries available
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { KnowledgeBaseManager };