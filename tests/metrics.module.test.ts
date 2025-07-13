import axios from 'axios';
process.env.AIRTABLE_API_KEY = 'test';
import { fetchMetrics } from '../metrics.module';

jest.mock('axios');

test('fetchMetrics returns parsed metrics', async () => {
  process.env.AIRTABLE_API_KEY = 'test';
  const mockedResponse = {
    data: {
      records: [
        {
          fields: {
            fldcA7pxYCafK3DUw: 1,
            fldfPk5WrGABynlHl: 2,
            fldiGhisCfsshtBnP: 3,
            fldwvwGDKQ2c8E7Hx: 4,
          },
        },
      ],
    },
  };
  (axios.get as jest.Mock).mockResolvedValue(mockedResponse);

  const metrics = await fetchMetrics();
  expect(metrics).toEqual({
    conversations: 1,
    messages: 2,
    leads: 3,
    revenue: 4,
  });
});
