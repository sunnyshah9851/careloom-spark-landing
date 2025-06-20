
import { Button } from '@/components/ui/button';
import CareloomLogo from './CareloomLogo';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100/50 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-[64px]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <CareloomLogo />
          </div>
          
          {/* Navigation - Hidden on mobile, shown on tablet+ */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-rose-700 hover:text-rose-900 transition-colors mobile-text-fix">
              Features
            </a>
            <a href="#how-it-works" className="text-rose-700 hover:text-rose-900 transition-colors mobile-text-fix">
              How it Works
            </a>
            <a href="#pricing" className="text-rose-700 hover:text-rose-900 transition-colors mobile-text-fix">
              Pricing
            </a>
          </nav>
          
          {/* Auth Buttons - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button 
              variant="ghost" 
              onClick={signInWithGoogle}
              className="text-rose-700 hover:text-rose-900 hover:bg-rose-50 mobile-text-fix text-sm sm:text-base px-2 sm:px-4"
              size="sm"
            >
              Log In
            </Button>
            <Button 
              onClick={signInWithGoogle}
              className="bg-rose-500 hover:bg-rose-600 text-white border-0 text-sm sm:text-base px-3 sm:px-6"
              size="sm"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
