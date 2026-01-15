import { describe, it, expect, beforeEach } from 'vitest';
import { BMTCClient } from '../../src/client/bmtc-client';

describe('BMTCClient', () => {
  let client: BMTCClient;

  beforeEach(() => {
    client = new BMTCClient();
  });

  it('should create a client instance', () => {
    expect(client).toBeInstanceOf(BMTCClient);
  });

  it('should have default base URL', () => {
    expect(client.getBaseURL()).toBe(
      'https://bmtcmobileapi.karnataka.gov.in/WebAPI',
    );
  });

  it('should allow custom base URL', () => {
    const customClient = new BMTCClient({
      baseURL: 'https://custom-api.example.com',
    });
    expect(customClient.getBaseURL()).toBe('https://custom-api.example.com');
  });

  it('should return ky client instance', () => {
    const kyClient = client.getClient();
    expect(kyClient).toBeDefined();
  });
});
