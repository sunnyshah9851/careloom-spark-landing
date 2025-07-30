import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';

const DemoUpgradeCard = () => {
  const { signInWithGoogle } = useAuth();
  const { exitDemoMode } = useDemo();

  const handleUpgrade = () => {
    exitDemoMode();
    signInWithGoogle();
  };

  const features = [
    'Save your relationships',
    'Get weekly email nudges',
    'Birthday & anniversary reminders',
    'Unlimited connection ideas',
    'Track your connection history',
    'Export your data anytime'
  ];

  return (
    <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-cream-50 sticky top-8">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 p-3 bg-rose-100 rounded-full w-fit">
          <Crown className="h-6 w-6 text-rose-600" />
        </div>
        <CardTitle className="text-rose-800 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5" />
          Unlock Full Features
        </CardTitle>
        <p className="text-rose-600 text-sm">
          Ready to start building deeper connections?
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-rose-700">
              <div className="p-1 bg-rose-200 rounded-full">
                <Check className="h-3 w-3 text-rose-600" />
              </div>
              {feature}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-rose-200">
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-rose-800">Free</p>
            <p className="text-rose-600 text-sm">Always free to use</p>
          </div>
          
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Sign Up Now
          </Button>
          
          <p className="text-xs text-rose-500 text-center mt-2">
            Join 2,500+ people building better relationships
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoUpgradeCard;