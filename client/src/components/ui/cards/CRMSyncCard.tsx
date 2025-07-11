import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../card';

const CRMSyncCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>🔄 CRMSync</CardTitle>
    </CardHeader>
    <CardContent>
      <p>CRM sync status, failures, and last run time.</p>
    </CardContent>
  </Card>
);
export default CRMSyncCard;
