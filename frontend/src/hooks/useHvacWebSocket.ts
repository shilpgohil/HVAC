import { useEffect, useState, useRef, useCallback } from 'react';

interface WebSocketState {
  isConnected: boolean;
  lastTick: any | null;
  error: string | null;
}

function getDefaultWsUrl(): string {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL
        .replace(/^http:/, 'ws:')
        .replace(/^https:/, 'wss:')
        .replace(/\/api\/v1\/?$/, '/ws/telemetry');
    }
  }
  return 'ws://127.0.0.1:8000/ws/telemetry';
}

export function useHvacWebSocket(url: string = getDefaultWsUrl()) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastTick: null,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'SIMULATION_TICK') {
            setState(prev => ({ ...prev, lastTick: message.payload }));
          }
        } catch {
          // invalid json payload
        }
      };

      socket.onerror = () => {
        setState(prev => ({ ...prev, error: 'WebSocket connection error' }));
      };

      socket.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false }));
        wsRef.current = null;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      };
    } catch (err: any) {
      setState(prev => ({ ...prev, isConnected: false, error: err.message }));
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 2500);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return state;
}
