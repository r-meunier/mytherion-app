import { isApiErrorResponse } from './apiError';

describe('isApiErrorResponse', () => {
  it('accepts a backend error body', () => {
    expect(
      isApiErrorResponse({
        status: 409,
        error: 'Conflict',
        code: 'EMAIL_ALREADY_IN_USE',
        message: 'Email already in use',
        path: '/api/auth/register',
        timestamp: '2026-10-03T12:00:00Z',
      }),
    ).toBe(true);
  });

  it.each([null, undefined, 'Request failed', 42, {}, { status: 500, message: 'x' }])(
    'rejects %p',
    (body) => {
      expect(isApiErrorResponse(body)).toBe(false);
    },
  );
});
