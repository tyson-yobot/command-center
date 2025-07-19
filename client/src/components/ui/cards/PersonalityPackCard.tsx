// PersonalityPackCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../card';

const PersonalityPackCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>PersonalityPack</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Manage and deploy bot personality presets.</p>
    </CardContent>
  </Card>
);

export default PersonalityPackCard;