import { parseErrorMessage } from './errorMessages';
import { ApiErrorResponse } from '../types/apiError';

describe('parseErrorMessage', () => {
  it('parses ApiErrorResponse object by ErrorCode', () => {
    const error: ApiErrorResponse = {
      status: 409,
      error: 'Conflict',
      code: 'EMAIL_ALREADY_IN_USE',
      message: 'Email already in use',
      path: '/api/auth/register',
      timestamp: '2026-10-04T12:00:00Z',
    };
    expect(parseErrorMessage(error)).toBe(
      'This email address is already registered. Please use a different email or try logging in.'
    );
  });

  it('parses stringified ApiErrorResponse JSON', () => {
    const jsonStr = JSON.stringify({
      status: 403,
      error: 'Forbidden',
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email before logging in',
      path: '/api/auth/login',
      timestamp: '2026-10-04T12:00:00Z',
    });
    expect(parseErrorMessage(jsonStr)).toBe(
      'Please verify your email address before logging in. Check your inbox for the verification email.'
    );
  });

  it('parses Axios error containing ApiErrorResponse data', () => {
    const axiosError = {
      response: {
        data: {
          status: 404,
          error: 'Not Found',
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
          path: '/api/projects/123',
          timestamp: '2026-10-04T12:00:00Z',
        },
      },
    };
    expect(parseErrorMessage(axiosError)).toBe('The requested project was not found.');
  });

  it('extracts first field error for VALIDATION_FAILED', () => {
    const validationError: ApiErrorResponse = {
      status: 400,
      error: 'Bad Request',
      code: 'VALIDATION_FAILED',
      message: 'Request validation failed',
      path: '/api/projects',
      timestamp: '2026-10-04T12:00:00Z',
      errors: {
        name: ['Name is required', 'Must not be blank'],
      },
    };
    expect(parseErrorMessage(validationError)).toBe('Name is required');
  });

  it('falls back to string pattern matching for non-JSON strings', () => {
    expect(parseErrorMessage('Request failed with status code 500')).toBe(
      'Request failed with status code 500'
    );
  });
});
