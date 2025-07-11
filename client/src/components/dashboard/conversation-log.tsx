import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Clock, ChevronRight, Eye, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import type { Conversation } from "@shared/schema";

export default function ConversationLog() {
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    refetchInterval: 5000,
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
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-5 bg-muted rounded w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 border border-muted rounded-lg">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const recentConversations = conversations.slice(0, 3);

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <MessageCircle className="h-5 w-5" />
            <span>💬 Recent Conversations</span>
            {conversations && conversations.some(c => c.status === "escalated") && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2"></div>
            )}
          </CardTitle>
          <Link href="/conversations">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentConversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300">No Conversations Yet</h3>
            <p className="text-sm text-slate-400">
              Conversations will appear here once your bot starts engaging with clients.
            </p>
          </div>
        ) : (
          recentConversations.map((conversation) => {
            const statusBadge = getStatusBadge(conversation.status);
            
            return (
              <div
                key={conversation.id}
                className="conversation-item p-3 rounded-lg border border-slate-600 cursor-pointer touch-feedback hover:bg-slate-700 hover:shadow-md transition-all duration-200 active:scale-98 active:bg-slate-600"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {conversation.clientAvatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-white truncate">
                        {conversation.clientName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(conversation.createdAt!).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {conversation.clientCompany && (
                      <div className="text-sm text-slate-300 mt-1">
                        {conversation.clientCompany}
                      </div>
                    )}
                    <div className="text-sm text-slate-300 mt-1 truncate">
                      {conversation.lastMessage}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={statusBadge.variant} 
                          className={`text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                            conversation.status === "escalated" ? "animate-pulse bg-red-600 hover:bg-red-700" : ""
                          }`}
                        >
                          <span className="mr-1">{statusBadge.icon}</span>
                          {statusBadge.label}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{conversation.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-blue-600 hover:text-white text-slate-300"
                          title="Tap to Call"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-green-600 hover:text-white text-slate-300"
                          title="Open Chat"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-purple-600 hover:text-white text-slate-300"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
