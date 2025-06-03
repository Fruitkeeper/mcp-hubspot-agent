
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardProps {
  connectedCRMs: string[];
}

const Dashboard = ({ connectedCRMs }: DashboardProps) => {
  const leadData = [
    { day: 'Mon', leads: 12, calls: 8, followUps: 15 },
    { day: 'Tue', leads: 19, calls: 12, followUps: 18 },
    { day: 'Wed', leads: 15, calls: 9, followUps: 12 },
    { day: 'Thu', leads: 22, calls: 15, followUps: 20 },
    { day: 'Fri', leads: 18, calls: 11, followUps: 16 },
    { day: 'Sat', leads: 8, calls: 3, followUps: 5 },
    { day: 'Sun', leads: 5, calls: 2, followUps: 3 }
  ];

  const conversionData = [
    { crm: 'HubSpot', leads: 145, conversions: 23, budget: 2400 },
    { crm: 'Salesforce', leads: 98, conversions: 18, budget: 1800 },
    { crm: 'Pipedrive', leads: 67, conversions: 12, budget: 1200 }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">New Leads Today</p>
              <p className="text-3xl font-bold text-blue-600">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📈</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+12% from yesterday</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Calls Scheduled</p>
              <p className="text-3xl font-bold text-purple-600">8</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">📞</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+3 from yesterday</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Follow-ups Due</p>
              <p className="text-3xl font-bold text-orange-600">12</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⏰</span>
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-2">2 overdue</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-green-600">16.7%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">🎯</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+2.3% this week</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Lead Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="calls" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="followUps" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">CRM Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crm" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="conversions" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Connected CRMs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Connected CRMs</h3>
          <Badge variant="secondary">{connectedCRMs.length} Connected</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {conversionData.map((crm) => (
            <Card key={crm.crm} className="p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{crm.crm}</h4>
                {connectedCRMs.includes(crm.crm) ? (
                  <Badge className="bg-green-100 text-green-700">Connected</Badge>
                ) : (
                  <Badge variant="outline">Not Connected</Badge>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Leads:</span>
                  <span className="font-medium">{crm.leads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Conversions:</span>
                  <span className="font-medium">{crm.conversions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Budget:</span>
                  <span className="font-medium">${crm.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Rate:</span>
                  <span className="font-medium text-green-600">
                    {((crm.conversions / crm.leads) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
