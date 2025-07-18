import { useLocation } from "wouter";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  BarChart3, 
  MessageCircle, 
  Settings, 
  Users, 
  FileText,
  Scan,
  Shield
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Notification } from "@shared/schema";

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  
  const handleAdminAccess = () => {
    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || "yobot2025";
    if (password === expectedPassword) {
      setIsDialogOpen(false);
      setPassword("");
      setError("");
      setLocation("/system-controls");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };
  
  // Determine if we're in mobile mode and adjust paths accordingly
  const isMobile = location.startsWith('/mobile');
  const basePath = isMobile ? '/mobile' : '';
  
  const navItems = [
    { path: isMobile ? "/mobile" : "/", label: "Dashboard", icon: BarChart3 },
    { path: `${basePath}/conversations`, label: "Chats", icon: MessageCircle },
    { path: `${basePath}/scanner`, label: "Scan", icon: Scan },
    { path: `${basePath}/crm`, label: "CRM", icon: Users },
    { path: null, label: "Admin", icon: Shield, isAdmin: true },
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
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          const showNotificationBadge = item.path === "/conversations" && unreadCount > 0;
          
          // Admin button with dialog
          if (item.isAdmin) {
            return (
              <Dialog key={`admin-${index}`} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button 
                    className="relative flex flex-col items-center justify-center py-3 px-2 text-xs font-semibold transition-all duration-200 transform active:scale-95 active:bg-slate-800 hover:shadow-md text-slate-300 hover:text-white hover:bg-slate-800/30"
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span>{item.label}</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Admin Access</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="admin-password" className="text-slate-300">
                        Enter Admin Password
                      </Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
                        className="mt-1 bg-slate-800 border-slate-600 text-white"
                        placeholder="Password"
                      />
                      {error && (
                        <p className="text-red-400 text-sm mt-1">{error}</p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setPassword("");
                          setError("");
                        }}
                        className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAdminAccess}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Access Control Panel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          }

          return (
            <Link key={item.path || `nav-${index}`} href={item.path!}>
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
