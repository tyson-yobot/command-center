import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
      console.log("WebSocket connected");
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
      console.log("WebSocket disconnected");
      
      // Show reconnection toast
      toast({
        title: "Connection Lost",
        description: "Attempting to reconnect...",
        variant: "destructive",
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to establish real-time connection",
        variant: "destructive",
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, [toast]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "notification":
        toast({
          title: data.title,
          description: data.message,
        });
        break;
      case "metrics_update":
        // This would trigger a refetch of metrics data
        console.log("Metrics updated:", data);
        break;
      case "bot_status_change":
        toast({
          title: "Bot Status Changed",
          description: `Bot is now ${data.status}`,
        });
        break;
      default:
        console.log("Unknown WebSocket message type:", data.type);
    }
  };

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
