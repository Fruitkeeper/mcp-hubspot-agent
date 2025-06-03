
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const GTMAgent = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot' as const,
      content: "Hi! I'm your GTM Agent. I can help you analyze your CRM performance, suggest optimizations, and answer questions about your sales pipeline. What would you like to know?",
      timestamp: new Date(Date.now() - 300000)
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    "What's my conversion rate this week?",
    "Which CRM is performing best?",
    "How can I improve my follow-up process?",
    "Show me my top performing lead sources"
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot' as const,
        content: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string) => {
    const responses: { [key: string]: string } = {
      'conversion': "Your conversion rate this week is 16.7%, which is up 2.3% from last week! Your HubSpot leads are converting at 15.9% while Salesforce is at 18.4%. Consider focusing more budget on Salesforce for better ROI.",
      'crm': "Based on your data, Salesforce is your top performer with an 18.4% conversion rate and $1,800 budget efficiency. HubSpot has higher volume but lower conversion at 15.9%. I recommend optimizing your HubSpot funnel.",
      'follow': "Your follow-up process has room for improvement. You have 2 overdue follow-ups and 12 due today. I suggest setting up automated sequences in your CRMs and using calendar blocking for follow-up time.",
      'lead': "Your top lead sources this month are: 1) LinkedIn outreach (32% of leads), 2) Content marketing (28%), 3) Referrals (23%). Focus more on LinkedIn and content since they have the highest conversion rates.",
      'default': "I can help you with CRM analytics, performance optimization, lead management, and sales process improvements. Try asking about your conversion rates, CRM comparison, or follow-up strategies!"
    };

    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('conversion') || lowerInput.includes('rate')) {
      return responses.conversion;
    } else if (lowerInput.includes('crm') || lowerInput.includes('perform')) {
      return responses.crm;
    } else if (lowerInput.includes('follow') || lowerInput.includes('process')) {
      return responses.follow;
    } else if (lowerInput.includes('lead') || lowerInput.includes('source')) {
      return responses.lead;
    } else {
      return responses.default;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">GTM Agent</h2>
              <p className="text-sm text-slate-600">Your AI-powered GTM assistant</p>
            </div>
            <Badge className="ml-auto bg-green-100 text-green-700">Online</Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600 mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(question)}
                  className="text-left h-auto py-2 px-3 whitespace-normal"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your GTM performance..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GTMAgent;
