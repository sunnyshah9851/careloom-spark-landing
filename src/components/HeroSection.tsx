
import { Button } from '@/components/ui/button';
import { Heart, Sparkles } from 'lucide-react';
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

        {/* Problem Hook */}
        <div className="mb-6 animate-fade-in">
          <p className="text-lg md:text-xl text-rose-700/90 mb-2">
            Tired of running out of ideas for quality time together?
          </p>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-6 animate-fade-in [animation-delay:100ms]">
          <span className="text-gradient">Get personalized</span>
          <br />
          <span className="text-rose-700">activity ideas for</span>
          <br />
          <span className="text-rose-600">your special people</span>
        </h1>

        {/* Value Proposition */}
        <p className="text-xl md:text-2xl text-rose-800/80 mb-4 max-w-3xl mx-auto leading-relaxed animate-fade-in [animation-delay:200ms]">
          Never run out of meaningful ways to connect. From romantic date nights to 
          family adventures to friend hangouts, get 3 personalized activity suggestions every week.
        </p>

        {/* Timeline Promise */}
        <p className="text-lg text-rose-700/70 mb-8 animate-fade-in [animation-delay:300ms]">
          ✨ Get your first personalized activity idea in under 2 minutes
        </p>

        {/* Primary CTA */}
        <div className="max-w-md mx-auto mb-6 animate-scale-in [animation-delay:400ms]">
          <Button 
            onClick={signInWithGoogle}
            size="lg"
            className="h-16 px-10 text-xl rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-lg transform transition-all duration-200 hover:scale-105 w-full"
          >
            <Sparkles className="h-6 w-6 mr-3" />
            Get My First Activity Idea
          </Button>
        </div>

        {/* Secondary CTA */}
        <div className="mb-8 animate-fade-in [animation-delay:500ms]">
          <button 
            className="text-rose-700 hover:text-rose-900 underline text-lg font-medium"
            onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See Sample Activity Ideas →
          </button>
        </div>

        {/* Social Proof */}
        <div className="animate-fade-in [animation-delay:600ms]">
          <p className="text-rose-600/70 mb-4 text-lg">
            Join 2,500+ people who've discovered amazing ways to connect with those they care about ✨
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60 animate-fade-in [animation-delay:700ms]">
          <div className="text-sm text-rose-700">🎯 Personalized to Your City</div>
          <div className="text-sm text-rose-700">💝 Free Forever Plan</div>
          <div className="text-sm text-rose-700">🚀 Start Immediately</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
