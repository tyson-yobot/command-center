import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnterpriseLeadPlatformProps {
  onNavigate?: (view: string) => void;
}

const EnterpriseLeadPlatform: React.FC<EnterpriseLeadPlatformProps> = ({ onNavigate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enterprise Lead Platform</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Enterprise lead platform - Coming soon</p>
      </CardContent>
    </Card>
  );
};

export default EnterpriseLeadPlatform;