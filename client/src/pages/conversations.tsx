import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, MessageCircle, Clock } from "lucide-react";
import type { Conversation } from "@shared/schema";

export default function Conversations() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    refetchInterval: 5000,
  });

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      lead_captured: { label: "Lead Captured", variant: "default" as const, icon: "🎯" },
      escalated: { label: "Escalated", variant: "destructive" as const, icon: "⚠️" },
      meeting_booked: { label: "Meeting Booked", variant: "secondary" as const, icon: "📅" },
      completed: { label: "Completed", variant: "outline" as const, icon: "✅" },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
  };

  if (isLoading) {
    return (
      <div className="px-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 search-input"
        />
      </div>

      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No conversations found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search query" : "Conversations will appear here once your bot starts engaging with clients"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => {
            const statusBadge = getStatusBadge(conversation.status);
            return (
              <Card key={conversation.id} className="conversation-item cursor-pointer touch-feedback">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {conversation.clientAvatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground truncate">
                          {conversation.clientName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.createdAt!).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {conversation.clientCompany && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {conversation.clientCompany}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant={statusBadge.variant} className="text-xs">
                            <span className="mr-1">{statusBadge.icon}</span>
                            {statusBadge.label}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{conversation.duration}</span>
                          </div>
                        </div>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
