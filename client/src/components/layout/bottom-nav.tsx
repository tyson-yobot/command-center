import { useLocation } from "wouter";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  MessageCircle, 
  Settings, 
  Users, 
  FileText,
  Scan
} from "lucide-react";
import type { Notification } from "@shared/schema";

export default function BottomNav() {
  const [location] = useLocation();
  
  // Determine if we're in mobile mode and adjust paths accordingly
  const isMobile = location.startsWith('/mobile');
  const basePath = isMobile ? '/mobile' : '';
  
  const navItems = [
    { path: isMobile ? "/mobile" : "/", label: "Dashboard", icon: BarChart3 },
    { path: `${basePath}/conversations`, label: "Chats", icon: MessageCircle },
    { path: `${basePath}/scanner`, label: "Scan", icon: Scan },
    { path: `${basePath}/crm`, label: "CRM", icon: Users },
    { path: `${basePath}/reports`, label: "Reports", icon: FileText },
  ];
  
  // Get unread notifications count for chat badge
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 10000,
  });
  
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 z-40">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          const showNotificationBadge = item.path === "/conversations" && unreadCount > 0;
          
          return (
            <Link key={item.path} href={item.path}>
              <button 
                className={`relative flex flex-col items-center justify-center py-3 px-2 text-xs font-semibold transition-all duration-200 transform active:scale-95 active:bg-slate-800 hover:shadow-md ${
                  isActive 
                    ? 'text-blue-400 bg-slate-800/50' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{item.label}</span>
                {showNotificationBadge && (
                  <>
                    {unreadCount <= 9 ? (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </div>
                    ) : (
                      <div className="absolute -top-1 -right-1 w-6 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        9+
                      </div>
                    )}
                  </>
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
