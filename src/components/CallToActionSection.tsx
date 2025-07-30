
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { Sparkles, Clock, MapPin, Play } from 'lucide-react';

const CallToActionSection = () => {
  const { signInWithGoogle } = useAuth();
  const { enterDemoMode } = useDemo();

  const handleTryDemo = () => {
    enterDemoMode();
    window.location.href = '/demo';
  };

  return (
    <section className="py-24 gradient-warm">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Main CTA Content */}
        <div className="mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-rose-800 mb-6">
            Ready to choose connection
            <span className="text-gradient block">over digital distraction?</span>
          </h2>
          <p className="text-xl text-rose-700/80 max-w-2xl mx-auto leading-relaxed mb-6">
            Join thousands who've rediscovered the joy of being truly present with the people they love. 
            Start creating the meaningful moments that matter most.
          </p>
          <div className="flex justify-center items-center gap-6 text-rose-700/70 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>2 min setup</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Your community</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>Real connection</span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="max-w-lg mx-auto mb-8 animate-scale-in space-y-3">
          <Button 
            onClick={signInWithGoogle}
            size="lg"
            className="h-16 px-10 text-xl rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-lg transform transition-all duration-200 hover:scale-105 w-full"
          >
            <Sparkles className="h-6 w-6 mr-3" />
            Start My Connection Journey
          </Button>
          
          <Button 
            onClick={handleTryDemo}
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg rounded-2xl shadow-md transform transition-all duration-200 hover:scale-105 w-full border-rose-300 text-rose-700 hover:bg-rose-50"
          >
            <Play className="h-5 w-5 mr-3" />
            Try Demo First
          </Button>
        </div>


        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 text-center animate-fade-in [animation-delay:300ms]">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="font-semibold text-rose-800 mb-2">Deeper Relationships</h3>
            <p className="text-sm text-rose-700/70">Strengthen bonds through shared experiences</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="text-2xl mb-2">💝</div>
            <h3 className="font-semibold text-rose-800 mb-2">Free Forever Plan</h3>
            <p className="text-sm text-rose-700/70">Connection should never be behind a paywall</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="text-2xl mb-2">🌟</div>
            <h3 className="font-semibold text-rose-800 mb-2">Lasting Memories</h3>
            <p className="text-sm text-rose-700/70">Create moments you'll treasure forever</p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-rose-600/60 mt-8 animate-fade-in [animation-delay:400ms]">
          No spam, ever. Unsubscribe anytime. 
          <span className="block mt-1">Made with 💕 to help people choose presence over digital distraction</span>
        </p>
      </div>
    </section>
  );
};

export default CallToActionSection;
