import { useEffect, useRef } from "react";

export function useSSE<T>(url: string, onEvent: (event: T) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close(); // Ensure no duplicate connections
      }

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event: { data: string }) => {
        try {
          const data = JSON.parse(event.data) as T;
          onEvent(data);
        } catch (error) {
          console.error("Error parsing SSE event:", error);
        }
      };

      eventSource.onerror = () => {
        console.error("SSE connection lost. Attempting to reconnect...");
        eventSource.close();
        setTimeout(connect, 3000); // Retry only if the connection was lost
      };
    };

    connect(); // Initial connection

    return () => {
      eventSourceRef.current?.close();
    };
  }, [url, onEvent]);
}
