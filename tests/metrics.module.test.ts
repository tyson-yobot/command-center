import axios from 'axios';


process.env.AIRTABLE_API_KEY = 'testkey';
process.env.AIRTABLE_BASE_ID = 'base123';
import { fetchMetrics } from '../metrics.module';


jest.mock('axios');

describe('fetchMetrics', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  test('returns parsed metrics', async () => {
    process.env.AIRTABLE_API_KEY = 'test';
    const { fetchMetrics } = await import('../metrics.module');

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

  test('logs warning when AIRTABLE_API_KEY missing', async () => {
    delete process.env.AIRTABLE_API_KEY;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    const { fetchMetrics } = await import('../metrics.module');
    (axios.get as jest.Mock).mockResolvedValue({ data: { records: [] } });

    await fetchMetrics();
    expect(warnSpy).toHaveBeenCalledWith('AIRTABLE_API_KEY is not set');
  });
});

test('fetchMetrics returns zeros on error', async () => {
  (axios.get as jest.Mock).mockRejectedValue(new Error('network error'));

  const metrics = await fetchMetrics();
  expect(metrics).toEqual({
    conversations: 0,
    messages: 0,
    leads: 0,
    revenue: 0,
  });
});
