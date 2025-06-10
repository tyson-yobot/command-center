import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Phone, MessageCircle, Clock, Filter, ArrowUpDown, Eye, PhoneCall, MessageSquare, Send, Mic, Paperclip, MoreVertical } from "lucide-react";
import type { Conversation } from "@shared/schema";

export default function Conversations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    refetchInterval: 5000,
  });

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((conv) => {
      const matchesSearch = conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      } else if (sortBy === "status") {
        const statusOrder = { escalated: 0, meeting_booked: 1, lead_captured: 2, completed: 3 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 3) - 
               (statusOrder[b.status as keyof typeof statusOrder] || 3);
      }
      return 0;
    });

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
      {/* Header with stats */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          💬 Conversations
        </h1>
        <div className="flex justify-center space-x-4 text-sm">
          <span className="text-red-600 font-semibold">
            {conversations.filter(c => c.status === "escalated").length} Escalated
          </span>
          <span className="text-green-600 font-semibold">
            {conversations.filter(c => c.status === "meeting_booked").length} Meetings
          </span>
          <span className="text-blue-600 font-semibold">
            {conversations.filter(c => c.status === "lead_captured").length} New Leads
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
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
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="text-xs"
          >
            All ({conversations.length})
          </Button>
          <Button
            variant={statusFilter === "escalated" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("escalated")}
            className="text-xs"
          >
            ⚠️ Escalated ({conversations.filter(c => c.status === "escalated").length})
          </Button>
          <Button
            variant={statusFilter === "meeting_booked" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("meeting_booked")}
            className="text-xs"
          >
            📅 Meetings ({conversations.filter(c => c.status === "meeting_booked").length})
          </Button>
          <Button
            variant={statusFilter === "lead_captured" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("lead_captured")}
            className="text-xs"
          >
            🎯 Leads ({conversations.filter(c => c.status === "lead_captured").length})
          </Button>
        </div>
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
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transform transition hover:scale-105"
                          >
                            <PhoneCall className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />
                            Call
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transform transition hover:scale-105"
                          >
                            <MessageSquare className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                            Chat
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transform transition hover:scale-105"
                          >
                            <Eye className="h-3 w-3 mr-1 text-gray-600 dark:text-gray-400" />
                            View
                          </Button>
                        </div>
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
