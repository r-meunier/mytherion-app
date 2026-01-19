import logger from './logger';

describe('logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleDebugSpy.mockRestore();
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  // ==================== Basic Logging Tests ====================

  describe('basic logging', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log debug messages in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });
      logger.debug('Test debug');
      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });

  // ==================== Context Enrichment Tests ====================

  describe('context enrichment', () => {
    it('should log with context object', () => {
      logger.info('User action', { userId: 123, action: 'login' });
      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0];
      expect(logCall).toContain('User action');
    });

    it('should handle error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log with multiple context fields', () => {
      logger.info('Complex log', {
        userId: 1,
        projectId: 2,
        action: 'create',
      });
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  // ==================== Child Logger Tests ====================

  describe('child logger', () => {
    it('should create child logger with service context', () => {
      const childLogger = logger.child({ service: 'projectService' });
      childLogger.info('Service log');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0];
      expect(logCall.some((arg: any) => 
        JSON.stringify(arg).includes('projectService')
      )).toBe(true);
    });

    it('should inherit parent context in child logger', () => {
      const childLogger = logger.child({ service: 'authService' });
      childLogger.info('Auth event', { userId: 456 });
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should create nested child loggers', () => {
      const serviceLogger = logger.child({ service: 'api' });
      const requestLogger = serviceLogger.child({ requestId: '123' });
      
      requestLogger.info('Request processed');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  // ==================== Log Level Tests ====================

  describe('log levels', () => {
    it('should respect production log level', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
      });
      
      // Debug should not log in production
      logger.debug('Debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
      
      // Info should log in production
      logger.info('Info message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log all levels in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });
      
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');
      
      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  // ==================== Error Handling Tests ====================

  describe('error handling', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      expect(errorCall.some((arg: any) => 
        arg instanceof Error || (typeof arg === 'object' && arg.message === 'Test error')
      )).toBe(true);
    });

    it('should handle error with context', () => {
      const error = new Error('Database error');
      logger.error('DB operation failed', error, { 
        query: 'SELECT * FROM users',
        userId: 123 
      });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle non-Error objects', () => {
      logger.error('String error', 'Something went wrong');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  // ==================== Timestamp Tests ====================

  describe('timestamps', () => {
    it('should include timestamp in logs', () => {
      logger.info('Timestamped message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0];
      // Check if any argument contains a timestamp-like string
      const hasTimestamp = logCall.some((arg: any) => 
        typeof arg === 'string' && /\d{4}-\d{2}-\d{2}/.test(arg)
      );
      expect(hasTimestamp).toBe(true);
    });
  });
});
