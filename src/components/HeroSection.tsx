
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HeroSection = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <section className="min-h-screen gradient-warm flex items-center justify-center px-4 py-20 pt-32">
      <div className="max-w-4xl mx-auto text-center">
        {/* Floating Heart Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-200/40 rounded-full blur-lg scale-150"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-full shadow-lg animate-float">
              <Heart className="h-12 w-12 text-rose-500 fill-rose-200" />
            </div>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-6 animate-fade-in">
          <span className="text-gradient">Never miss</span>
          <br />
          <span className="text-rose-700">a moment that matters</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-rose-800/80 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in [animation-delay:200ms]">
          Your personal relationship assistant that sends thoughtful reminders, 
          curated date ideas, and helps you celebrate every special moment with the people you love.
        </p>

        {/* Get Started Button */}
        <div className="max-w-md mx-auto animate-scale-in [animation-delay:400ms]">
          <Button 
            onClick={signInWithGoogle}
            size="lg"
            className="h-14 px-8 text-lg rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            Get Started with Google
          </Button>
          <p className="text-sm text-rose-600/70 mt-4">
            Join 1,000+ couples already using Careloom ✨
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60 animate-fade-in [animation-delay:600ms]">
          <div className="text-sm text-rose-700">🔒 Privacy First</div>
          <div className="text-sm text-rose-700">🤖 AI-Powered</div>
          <div className="text-sm text-rose-700">💝 Free to Start</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
