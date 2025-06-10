
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface MarketplaceProps {
  onCRMConnect: (crmName: string) => void;
  connectedCRMs: string[];
}

const Marketplace = ({ onCRMConnect, connectedCRMs }: MarketplaceProps) => {
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);

  const crmTools = [
    {
      name: 'HubSpot',
      category: 'All-in-One',
      price: '$45/month',
      rating: 4.5,
      features: ['Email Marketing', 'Lead Scoring', 'Analytics', 'Pipeline Management'],
      description: 'Complete CRM and marketing platform for growing businesses',
      logo: '🟠',
      color: 'orange'
    },
    {
      name: 'Salesforce',
      category: 'Enterprise',
      price: '$75/month',
      rating: 4.7,
      features: ['Advanced Analytics', 'Custom Objects', 'AI Insights', 'Enterprise Security'],
      description: 'World\'s leading enterprise CRM solution',
      logo: '🔵',
      color: 'blue'
    },
    {
      name: 'Pipedrive',
      category: 'Sales-Focused',
      price: '$29/month',
      rating: 4.3,
      features: ['Pipeline Visualization', 'Activity Reminders', 'Email Integration', 'Mobile App'],
      description: 'Simple and effective sales-focused CRM',
      logo: '🟢',
      color: 'green'
    },
    {
      name: 'Zoho CRM',
      category: 'Budget-Friendly',
      price: '$20/month',
      rating: 4.1,
      features: ['Workflow Automation', 'Social CRM', 'Territory Management', 'Gamification'],
      description: 'Affordable CRM with comprehensive features',
      logo: '🔴',
      color: 'red'
    },
    {
      name: 'Monday CRM',
      category: 'Project-Based',
      price: '$35/month',
      rating: 4.4,
      features: ['Visual Pipelines', 'Team Collaboration', 'Time Tracking', 'Custom Workflows'],
      description: 'Visual CRM perfect for project-based businesses',
      logo: '🟣',
      color: 'purple'
    },
    {
      name: 'Freshsales',
      category: 'Customer Support',
      price: '$25/month',
      rating: 4.2,
      features: ['Built-in Phone', 'Email Sequences', 'Lead Scoring', 'Territory Management'],
      description: 'CRM with built-in customer support features',
      logo: '🟡',
      color: 'yellow'
    }
  ];

  const filteredCRMs = showConnectedOnly 
    ? crmTools.filter(crm => connectedCRMs.includes(crm.name))
    : crmTools;

  const isConnected = (crmName: string) => connectedCRMs.includes(crmName);

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      orange: 'border-orange-200 hover:border-orange-300',
      blue: 'border-blue-200 hover:border-blue-300',
      green: 'border-green-200 hover:border-green-300',
      red: 'border-red-200 hover:border-red-300',
      purple: 'border-purple-200 hover:border-purple-300',
      yellow: 'border-yellow-200 hover:border-yellow-300'
    };
    return colorMap[color] || 'border-slate-200 hover:border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">CRM Marketplace</h2>
          <p className="text-slate-600">Discover and connect CRM tools for your business</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-600">Show connected only</span>
          <Switch 
            checked={showConnectedOnly}
            onCheckedChange={setShowConnectedOnly}
          />
        </div>
      </div>

      {/* Filter Stats */}
      <div className="flex items-center space-x-4 text-sm text-slate-600">
        <span>Total CRMs: {crmTools.length}</span>
        <span>•</span>
        <span>Connected: {connectedCRMs.length}</span>
        <span>•</span>
        <span>Available: {crmTools.length - connectedCRMs.length}</span>
      </div>

      {/* CRM Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCRMs.map((crm) => (
          <Card 
            key={crm.name} 
            className={`p-6 border-2 transition-all duration-200 hover:shadow-lg ${getColorClasses(crm.color)}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{crm.logo}</span>
                <div>
                  <h3 className="font-semibold text-slate-800">{crm.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {crm.category}
                  </Badge>
                </div>
              </div>
              
              {isConnected(crm.name) && (
                <Badge className="bg-green-100 text-green-700">Connected</Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 mb-4">{crm.description}</p>

            {/* Rating and Price */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm font-medium">{crm.rating}</span>
              </div>
              <span className="font-semibold text-slate-800">{crm.price}</span>
            </div>

            {/* Features */}
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-2">KEY FEATURES</p>
              <div className="flex flex-wrap gap-1">
                {crm.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {crm.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{crm.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-2">
              {isConnected(crm.name) ? (
                <Button variant="outline" className="w-full" disabled>
                  ✓ Connected
                </Button>
              ) : (
                <Button 
                  onClick={() => onCRMConnect(crm.name)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Connect {crm.name}
                </Button>
              )}
              
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View Details & Pricing
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredCRMs.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-slate-500">No CRMs to show with current filters.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowConnectedOnly(false)}
          >
            Show All CRMs
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Marketplace;
