import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const ws = io({ path: '/ws' });

    ws.on('connect', () => {
      setIsConnected(true);
      setSocket(ws);
      console.log("WebSocket connected");
    });

    ws.on('disconnect', () => {
      setIsConnected(false);
      setSocket(null);
      console.log("WebSocket disconnected");
      
      // Show reconnection toast
      toast({
        title: "Connection Lost",
        description: "Attempting to reconnect...",
        variant: "destructive",
      });
    });

    ws.on('connect_error', (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to establish real-time connection",
        variant: "destructive",
      });
    });

    ws.on('metrics', (data) => {
      handleWebSocketMessage({ type: 'metrics_update', data });
    });

    ws.on('notification', (data) => {
      handleWebSocketMessage({ type: 'notification', ...data });
    });

    ws.on('command_processing', (data) => {
      handleWebSocketMessage({ type: 'command_processing', data });
    });

    ws.on('automation_triggered', (data) => {
      handleWebSocketMessage({ type: 'automation_triggered', data });
    });

    return () => {
      ws.disconnect();
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
      case "automation_triggered":
        console.log("Automation function triggered:", data);
        // Show notification for automation triggers
        if (data.data?.target === 'main-desktop-command-center') {
          toast({
            title: "Automation Triggered",
            description: `Function ${data.data.function_id} executed successfully`,
          });
        }
        break;
      default:
        console.log("Unknown WebSocket message type:", data.type);
    }
  };

  const sendMessage = (message: any) => {
    if (socket && socket.connected) {
      socket.emit('message', message);
    } else {
      console.warn("Socket.IO is not connected");
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
