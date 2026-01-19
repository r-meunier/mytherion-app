import authReducer, {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
  clearError,
  clearUser,
} from './authSlice';
import { AuthState } from '../types/auth';
import { configureStore } from '@reduxjs/toolkit';

// Mock the authService
jest.mock('../services/authService', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

import { authService } from '../services/authService';

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    role: 'USER',
    emailVerified: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== Initial State Tests ====================

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  // ==================== Reducer Tests ====================

  describe('clearError', () => {
    it('should clear error state', () => {
      const stateWithError: AuthState = {
        ...initialState,
        error: 'Some error',
      };

      const newState = authReducer(stateWithError, clearError());

      expect(newState.error).toBeNull();
    });
  });

  describe('clearUser', () => {
    it('should clear user and set isAuthenticated to false', () => {
      const authenticatedState: AuthState = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      const newState = authReducer(authenticatedState, clearUser());

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });

  // ==================== Register User Tests ====================

  describe('registerUser', () => {
    it('should set loading state on pending', () => {
      const action = { type: registerUser.pending.type };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set user and authenticated on fulfilled', () => {
      const action = {
        type: registerUser.fulfilled.type,
        payload: mockUser,
      };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', () => {
      const errorMessage = 'Registration failed';
      const action = {
        type: registerUser.rejected.type,
        payload: errorMessage,
      };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  // ==================== Login User Tests ====================

  describe('loginUser', () => {
    it('should set loading state on pending', () => {
      const action = { type: loginUser.pending.type };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set user and authenticated on fulfilled', () => {
      const action = {
        type: loginUser.fulfilled.type,
        payload: mockUser,
      };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', () => {
      const errorMessage = 'Invalid credentials';
      const action = {
        type: loginUser.rejected.type,
        payload: errorMessage,
      };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  // ==================== Logout User Tests ====================

  describe('logoutUser', () => {
    it('should set loading state on pending', () => {
      const authenticatedState: AuthState = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      const action = { type: logoutUser.pending.type };
      const state = authReducer(authenticatedState, action);

      expect(state.isLoading).toBe(true);
    });

    it('should clear user and set unauthenticated on fulfilled', () => {
      const authenticatedState: AuthState = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      const action = { type: logoutUser.fulfilled.type };
      const state = authReducer(authenticatedState, action);

      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error on rejected', () => {
      const authenticatedState: AuthState = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

      const errorMessage = 'Logout failed';
      const action = {
        type: logoutUser.rejected.type,
        payload: errorMessage,
      };
      const state = authReducer(authenticatedState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  // ==================== Check Auth Tests ====================

  describe('checkAuth', () => {
    it('should set loading state on pending', () => {
      const action = { type: checkAuth.pending.type };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(true);
    });

    it('should set user and authenticated on fulfilled', () => {
      const action = {
        type: checkAuth.fulfilled.type,
        payload: mockUser,
      };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should clear user and set unauthenticated on rejected without error', () => {
      const action = { type: checkAuth.rejected.type };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull(); // Should not show error for failed auth check
    });
  });

  // ==================== Async Thunk Integration Tests ====================

  describe('async thunks', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          auth: authReducer,
        },
      });
    });

    it('should handle successful registration', async () => {
      const mockAuthService = authService as jest.Mocked<typeof authService>;
      mockAuthService.register.mockResolvedValue(mockUser);

      await store.dispatch(
        registerUser({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        })
      );

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle failed login', async () => {
      const mockAuthService = authService as jest.Mocked<typeof authService>;
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await store.dispatch(
        loginUser({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      );

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('should handle successful logout', async () => {
      const mockAuthService = authService as jest.Mocked<typeof authService>;
      mockAuthService.logout.mockResolvedValue();

      // First set authenticated state
      store.dispatch({
        type: loginUser.fulfilled.type,
        payload: mockUser,
      });

      // Then logout
      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle successful auth check', async () => {
      const mockAuthService = authService as jest.Mocked<typeof authService>;
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      await store.dispatch(checkAuth());

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });
});
