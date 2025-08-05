import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, render } from '@testing-library/react';
import { useDevice } from './useDevice';

const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  });
};

const mockEventListener = () => {
  const listeners: { [key: string]: EventListener[] } = {};
  
  const addEventListener = vi.fn((event: string, callback: EventListener) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  });
  
  const removeEventListener = vi.fn((event: string, callback: EventListener) => {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
  });
  
  const triggerEvent = (event: string) => {
    if (listeners[event]) {
      listeners[event].forEach(callback => callback(new Event(event)));
    }
  };
  
  return { addEventListener, removeEventListener, triggerEvent };
};

describe('useDevice Hook', () => {
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;
  let mockEvents: ReturnType<typeof mockEventListener>;

  beforeEach(() => {
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    mockEvents = mockEventListener();
    window.addEventListener = mockEvents.addEventListener;
    window.removeEventListener = mockEvents.removeEventListener;
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    vi.clearAllMocks();
  });

  describe('Unit Tests', () => {
    test('should return false for desktop user agents', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      const { result } = renderHook(() => useDevice());
      
      expect(result.current).toBe(false);
    });

    test('should return true for mobile user agents', () => {
      const mobileUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+',
        'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)',
        'Mozilla/5.0 (webOS/1.4.0; U; en-US) AppleWebKit/532.2'
      ];

      mobileUserAgents.forEach(userAgent => {
        mockUserAgent(userAgent);
        const { result } = renderHook(() => useDevice());
        expect(result.current).toBe(true);
      });
    });

    test('should add resize event listener on mount', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      renderHook(() => useDevice());
      
      expect(mockEvents.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockEvents.addEventListener).toHaveBeenCalledTimes(1);
    });

    test('should remove resize event listener on unmount', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const { unmount } = renderHook(() => useDevice());
      const addedCallback = mockEvents.addEventListener.mock.calls[0][1];
      
      unmount();
      
      expect(mockEvents.removeEventListener).toHaveBeenCalledWith('resize', addedCallback);
      expect(mockEvents.removeEventListener).toHaveBeenCalledTimes(1);
    });

    test('should update compactView on window resize', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const { result } = renderHook(() => useDevice());
      expect(result.current).toBe(false);

      act(() => {
        mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
        mockEvents.triggerEvent('resize');
      });

      expect(result.current).toBe(true);
    });

    test('should handle multiple resize events correctly', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const { result } = renderHook(() => useDevice());
      expect(result.current).toBe(false);

      act(() => {
        mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
        mockEvents.triggerEvent('resize');
        mockEvents.triggerEvent('resize');
        mockEvents.triggerEvent('resize');
      });

      expect(result.current).toBe(true);
      act(() => {
        mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        mockEvents.triggerEvent('resize');
      });

      expect(result.current).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should work correctly in a real component', () => {
      const TestComponent = () => {
        const isCompact = useDevice();
        return <div data-testid="device-info">{isCompact ? 'Mobile' : 'Desktop'}</div>;
      };

      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
      
      const { getByTestId } = render(<TestComponent />);
      
      expect(getByTestId('device-info')).toHaveTextContent('Mobile');
    });

    test('should handle component remounting correctly', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      let { result, unmount } = renderHook(() => useDevice());
      
      expect(result.current).toBe(false);
      expect(mockEvents.addEventListener).toHaveBeenCalledTimes(1);
      
      unmount();
      expect(mockEvents.removeEventListener).toHaveBeenCalledTimes(1);

      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
      const newRender = renderHook(() => useDevice());
      
      expect(newRender.result.current).toBe(true);
      expect(mockEvents.addEventListener).toHaveBeenCalledTimes(2);
    });

    test('should be consistent across multiple hook instances', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
      
      const { result: result1 } = renderHook(() => useDevice());
      const { result: result2 } = renderHook(() => useDevice());
      
      expect(result1.current).toBe(result2.current);
      expect(result1.current).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined or null user agent gracefully', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: undefined,
      });
      
      expect(() => {
        renderHook(() => useDevice());
      }).not.toThrow();
    });

    test('should handle case-insensitive matching', () => {
      const userAgents = [
        'android test',
        'ANDROID TEST',
        'Android Test',
        'iphone test',
        'IPHONE TEST',
        'iPhone Test'
      ];

      userAgents.forEach(userAgent => {
        mockUserAgent(userAgent);
        const { result } = renderHook(() => useDevice());
        expect(result.current).toBe(true);
      });
    });

    test('should handle empty user agent string', () => {
      mockUserAgent('');
      
      const { result } = renderHook(() => useDevice());
      expect(result.current).toBe(false);
    });
  });
});

export const createMockNavigator = (userAgent: string) => {
  return {
    userAgent,

  };
};

export const withMockNavigator = (userAgent: string, testFn: () => void) => {
  const originalNavigator = global.navigator;
  (global as any).navigator = createMockNavigator(userAgent);
  
  try {
    testFn();
  } finally {
    global.navigator = originalNavigator;
  }
};