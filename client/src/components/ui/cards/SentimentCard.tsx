import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../card';

const SentimentCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>🙂 Sentiment</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Conversation sentiment analysis breakdown.</p>
    </CardContent>
  </Card>
);
export default SentimentCard;
