
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onCRMConnect: (crmName: string) => void;
}

const LoginModal = ({ open, onClose, onLogin, onCRMConnect }: LoginModalProps) => {
  const [step, setStep] = useState<'login' | 'connect'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email && password) {
      setStep('connect');
    }
  };

  const handleCRMConnect = (crmName: string) => {
    onCRMConnect(crmName);
    onLogin();
  };

  const handleSkip = () => {
    onLogin();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'login' ? (
          <>
            <DialogHeader>
              <DialogTitle>Welcome to GTM Command</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!email || !password}
              >
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Connect Your CRM</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <p className="text-sm text-slate-600">
                Connect your CRM to get started with unified lead management.
              </p>
              
              <div className="space-y-3">
                <Card className="p-4 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handleCRMConnect('HubSpot')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        H
                      </div>
                      <div>
                        <h3 className="font-medium">HubSpot</h3>
                        <p className="text-xs text-slate-500">Connect your HubSpot CRM</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Connect</Button>
                  </div>
                </Card>
                
                <Card className="p-4 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handleCRMConnect('Salesforce')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        S
                      </div>
                      <div>
                        <h3 className="font-medium">Salesforce</h3>
                        <p className="text-xs text-slate-500">Connect your Salesforce CRM</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Connect</Button>
                  </div>
                </Card>
              </div>
              
              <Button 
                onClick={handleSkip}
                variant="ghost"
                className="w-full"
              >
                Skip for now
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
