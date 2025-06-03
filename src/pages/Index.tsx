
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/Dashboard';
import GTMAgent from '@/components/GTMAgent';
import Marketplace from '@/components/Marketplace';
import News from '@/components/News';
import LoginModal from '@/components/LoginModal';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [connectedCRMs, setConnectedCRMs] = useState<string[]>([]);
  const { toast } = useToast();

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
    toast({
      title: "Welcome back!",
      description: "Successfully logged into your GTM platform.",
    });
  };

  const handleCRMConnect = (crmName: string) => {
    setConnectedCRMs(prev => [...prev, crmName]);
    toast({
      title: `${crmName} Connected`,
      description: `Successfully connected your ${crmName} account.`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GTM Command
            </h1>
            <p className="text-slate-600 mt-2">Your unified CRM control center</p>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm text-slate-500 mb-6">
              Unify HubSpot, Salesforce, and more into one powerful dashboard
            </div>
            
            <Button 
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              Get Started
            </Button>
            
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-400 pt-4">
              <span>✓ Connect CRMs</span>
              <span>✓ Track Performance</span>
              <span>✓ AI Insights</span>
            </div>
          </div>
        </Card>

        <LoginModal 
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onCRMConnect={handleCRMConnect}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GTM Command
            </h1>
            <div className="flex items-center space-x-2">
              {connectedCRMs.map(crm => (
                <span key={crm} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {crm} Connected
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Profile</Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAuthenticated(false)}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="agent" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              GTM Agent
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard connectedCRMs={connectedCRMs} />
          </TabsContent>

          <TabsContent value="agent">
            <GTMAgent />
          </TabsContent>

          <TabsContent value="marketplace">
            <Marketplace onCRMConnect={handleCRMConnect} connectedCRMs={connectedCRMs} />
          </TabsContent>

          <TabsContent value="news">
            <News />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
