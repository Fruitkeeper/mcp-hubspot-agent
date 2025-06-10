import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Activity, Phone, DollarSign, Users, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Message {
  id: number;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
}

interface MCPStatus {
  status: 'healthy' | 'unhealthy';
  message: string;
  last_sync?: string;
  authenticated: boolean;
}

interface MCPData {
  leads: any[];
  calls: any[];
  budget: any;
}

const MCPHubSpotAgent = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'system',
      content: "🚀 MCP HubSpot Agent Initialized",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mcpStatus, setMcpStatus] = useState<MCPStatus | null>(null);
  const [mcpData, setMcpData] = useState<MCPData | null>(null);

  // Query MCP health status
  const { data: healthData, isError: healthError } = useQuery({
    queryKey: ['mcp-health'],
    queryFn: async () => {
      const response = await fetch('/api/mcp/health');
      if (!response.ok) throw new Error('Failed to fetch MCP health');
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  useEffect(() => {
    if (healthData) {
      setMcpStatus(healthData.hubspot || { status: 'unhealthy', message: 'No data', authenticated: false });
      
      if (healthData.hubspot?.status === 'healthy') {
        // Send welcome message once MCP is healthy
        const welcomeMessage: Message = {
          id: messages.length + 1,
          type: 'bot',
          content: "🎯 HubSpot MCP Agent is ready! I can help you analyze your HubSpot data using natural language. Just ask me anything about your leads, calls, deals, or sales performance!\n\nTry asking: \"Hello\" or \"Show me my recent leads\"",
          timestamp: new Date()
        };
        setMessages(prev => {
          if (prev.some(msg => msg.content.includes('HubSpot MCP Agent is ready'))) {
            return prev; // Don't add duplicate welcome message
          }
          return [...prev, welcomeMessage];
        });
      }
    }
  }, [healthData]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to the AI chat endpoint
      const response = await fetch('/api/mcp/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversation_history: messages.map(msg => ({
            type: msg.type,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const chatData = await response.json();
      
      const botResponse: Message = {
        id: Date.now() + 1,
        type: 'bot',
        content: chatData.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        content: "🚨 I encountered an error while processing your request. Please check the MCP connection status and try again. Make sure your backend server is running!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    "Hello",
    "Show me recent leads",
    "How are my calls performing?", 
    "What's my sales pipeline looking like?",
    "Help me understand my revenue"
  ];

  const getStatusBadge = () => {
    if (!mcpStatus) return <Badge variant="secondary">Connecting...</Badge>;
    
    return (
      <Badge variant={mcpStatus.status === 'healthy' ? 'default' : 'destructive'}>
        <Activity className="w-3 h-3 mr-1" />
        {mcpStatus.status === 'healthy' ? 'Connected' : 'Disconnected'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <span>MCP HubSpot Agent</span>
            {getStatusBadge()}
          </h2>
          <p className="text-slate-600">AI-powered HubSpot CRM assistant via MCP</p>
        </div>
      </div>

      {mcpStatus?.status === 'unhealthy' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                MCP Connection Issue: {mcpStatus.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-orange-600" />
            <span>HubSpot MCP Chat</span>
            <div className="ml-auto flex space-x-2">
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Leads
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Phone className="w-3 h-3 mr-1" />
                Calls  
              </Badge>
              <Badge variant="outline" className="text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                Deals
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-100 text-blue-600' 
                    : message.type === 'system'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : message.type === 'system' ? (
                    <Activity className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : message.type === 'system'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-900'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 
                    message.type === 'system' ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-slate-100 px-4 py-2 rounded-lg">
                  <p className="text-sm text-slate-600">Analyzing your HubSpot data...</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border-t p-4">
            <p className="text-sm text-slate-600 mb-2">Quick conversation starters:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(action)}
                  className="text-xs"
                  disabled={mcpStatus?.status !== 'healthy'}
                >
                  {action}
                </Button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your HubSpot data..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading || mcpStatus?.status !== 'healthy'}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading || mcpStatus?.status !== 'healthy'}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPHubSpotAgent; 