import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, ArrowLeft } from 'lucide-react';
import CareloomLogo from '@/components/CareloomLogo';

const DemoHeader = () => {
  const { exitDemoMode } = useDemo();
  const { signInWithGoogle } = useAuth();

  const handleExitDemo = () => {
    exitDemoMode();
    window.location.href = '/';
  };

  const handleSignUp = () => {
    exitDemoMode();
    signInWithGoogle();
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Demo Badge */}
          <div className="flex items-center gap-4">
            <CareloomLogo />
            <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-200">
              Demo Mode
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleExitDemo}
              className="text-rose-600 hover:text-rose-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={handleSignUp}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Sign Up to Save Progress
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DemoHeader;