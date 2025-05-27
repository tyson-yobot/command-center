import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  BarChart3, 
  MessageCircle, 
  Settings, 
  Users, 
  FileText 
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/conversations", label: "Chats", icon: MessageCircle, hasNotification: true },
  { path: "/controls", label: "Controls", icon: Settings },
  { path: "/crm", label: "CRM", icon: Users },
  { path: "/reports", label: "Reports", icon: FileText },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <button 
                className={`relative flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors touch-feedback ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{item.label}</span>
                {item.hasNotification && (
                  <div className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
