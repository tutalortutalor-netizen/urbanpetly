import { describe, expect, it } from 'vitest';

import { AppError, ERROR_CODES, ERROR_STATUS, errorResponseSchema } from './errors.js';

describe('error codes', () => {
  it('maps every code to a status', () => {
    for (const code of ERROR_CODES) {
      expect(ERROR_STATUS[code]).toBeGreaterThanOrEqual(400);
    }
  });
});

describe('AppError', () => {
  it('derives the status from the code', () => {
    expect(new AppError('NOT_FOUND', 'Provider not found').status).toBe(404);
    expect(new AppError('RATE_LIMITED', 'Slow down').status).toBe(429);
  });

  it('renders the contract error envelope', () => {
    const body = new AppError('VALIDATION_ERROR', 'Bad query', { field: 'radiusKm' }).toResponse();

    expect(errorResponseSchema.parse(body)).toEqual({
      error: { code: 'VALIDATION_ERROR', message: 'Bad query', details: { field: 'radiusKm' } },
    });
  });

  it('omits details when none were given', () => {
    expect(new AppError('FORBIDDEN', 'Not your request').toResponse()).toEqual({
      error: { code: 'FORBIDDEN', message: 'Not your request' },
    });
  });
});
