
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/Dashboard';
import GTMAgent from '@/components/GTMAgent';
import Marketplace from '@/components/Marketplace';
import News from '@/components/News';
import LoginModal from '@/components/LoginModal';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Bot, Store, Newspaper, Users, TrendingUp, Zap } from 'lucide-react';

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

  const services = [
    {
      icon: BarChart3,
      title: "Unified Dashboard",
      description: "See all your CRM data in one place. Track leads, conversions, and performance across multiple platforms.",
      features: ["Real-time analytics", "Cross-platform insights", "Custom reports"]
    },
    {
      icon: Bot,
      title: "GTM Agent",
      description: "AI-powered assistant that analyzes your sales performance and provides actionable recommendations.",
      features: ["Performance analysis", "Smart recommendations", "24/7 availability"]
    },
    {
      icon: Store,
      title: "CRM Marketplace",
      description: "Compare, connect, and switch between different CRM platforms seamlessly.",
      features: ["Easy integrations", "Price comparison", "Feature analysis"]
    },
    {
      icon: Newspaper,
      title: "Industry News",
      description: "Stay updated with the latest GTM trends, tools, and strategies.",
      features: ["Curated content", "Industry insights", "Tool updates"]
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  GTM Command
                </h1>
              </div>
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Your Unified 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> CRM Control Center</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Connect HubSpot, Salesforce, and more. Get AI-powered insights, unified analytics, 
              and seamless CRM management in one powerful dashboard.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-500 mb-8">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>40% Productivity Boost</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>2-Min Setup</span>
              </div>
            </div>
            <Button 
              onClick={() => setShowLoginModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
              size="lg"
            >
              Start Free Trial
            </Button>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                      <service.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-slate-500">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">See GTM Command in Action</h3>
              <p className="text-slate-600">Get a preview of what you'll experience once you're logged in</p>
            </div>
            
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
                <Dashboard connectedCRMs={['HubSpot']} />
              </TabsContent>

              <TabsContent value="agent">
                <GTMAgent />
              </TabsContent>

              <TabsContent value="marketplace">
                <Marketplace onCRMConnect={handleCRMConnect} connectedCRMs={['HubSpot']} />
              </TabsContent>

              <TabsContent value="news">
                <News />
              </TabsContent>
            </Tabs>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your GTM Strategy?</h3>
            <p className="text-xl opacity-90 mb-8">Join thousands of teams already using GTM Command</p>
            <Button 
              onClick={() => setShowLoginModal(true)}
              className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-3"
              size="lg"
            >
              Get Started Free
            </Button>
          </div>
        </main>

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
