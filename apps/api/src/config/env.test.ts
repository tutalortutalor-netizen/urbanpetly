import { describe, expect, it } from 'vitest';

import { parseEnv } from './env.js';

const SECRET = 'a'.repeat(32);

describe('parseEnv', () => {
  it('boots with an empty environment in development', () => {
    const env = parseEnv({});

    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.OTP_PROVIDER).toBe('fake');
  });

  it('defaults CORS to the three local dev servers', () => {
    expect(parseEnv({}).CORS_ORIGINS).toEqual([
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ]);
  });

  it('splits and trims comma separated lists', () => {
    expect(
      parseEnv({ ADMIN_PHONE_ALLOWLIST: '9810000001, 9810000002 ,' }).ADMIN_PHONE_ALLOWLIST,
    ).toEqual(['9810000001', '9810000002']);
  });

  it('coerces PORT from a string', () => {
    expect(parseEnv({ PORT: '4000' }).PORT).toBe(4000);
  });

  it('rejects a PORT that is not a usable port number', () => {
    expect(() => parseEnv({ PORT: '70000' })).toThrow(/PORT/);
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() => parseEnv({ NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });

  it('rejects a JWT secret that is too short to be safe', () => {
    expect(() => parseEnv({ JWT_ACCESS_SECRET: 'short' })).toThrow(/JWT_ACCESS_SECRET/);
  });

  it('requires database and JWT secrets in production', () => {
    const run = () => parseEnv({ NODE_ENV: 'production', OTP_PROVIDER: 'http' });

    expect(run).toThrow(/DATABASE_URL/);
    expect(run).toThrow(/JWT_ACCESS_SECRET/);
    expect(run).toThrow(/JWT_REFRESH_SECRET/);
  });

  it('refuses the fake OTP sender in production', () => {
    expect(() =>
      parseEnv({
        NODE_ENV: 'production',
        DATABASE_URL: 'mysql://user:pw@db:3306/urbanpetly',
        JWT_ACCESS_SECRET: SECRET,
        JWT_REFRESH_SECRET: SECRET,
      }),
    ).toThrow(/fake OTP sender/);
  });

  it('accepts a fully configured production environment', () => {
    const env = parseEnv({
      NODE_ENV: 'production',
      DATABASE_URL: 'mysql://user:pw@db:3306/urbanpetly',
      JWT_ACCESS_SECRET: SECRET,
      JWT_REFRESH_SECRET: SECRET,
      OTP_PROVIDER: 'http',
      OTP_API_URL: 'https://otp.example.com/send',
      OTP_API_KEY: 'key',
      CORS_ORIGINS: 'https://urbanpetly.com',
    });

    expect(env.CORS_ORIGINS).toEqual(['https://urbanpetly.com']);
  });

  it('reports every invalid variable in one error', () => {
    const error = (() => {
      try {
        parseEnv({ PORT: 'nope', LOG_LEVEL: 'chatty' });
        return null;
      } catch (e) {
        return e as Error;
      }
    })();

    expect(error?.message).toMatch(/PORT/);
    expect(error?.message).toMatch(/LOG_LEVEL/);
  });
});
