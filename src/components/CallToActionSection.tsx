
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const CallToActionSection = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <section className="py-24 gradient-warm">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Main CTA Content */}
        <div className="mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-rose-800 mb-6">
            Ready to strengthen your
            <span className="text-gradient block">relationships?</span>
          </h2>
          <p className="text-xl text-rose-700/80 max-w-2xl mx-auto leading-relaxed">
            Join thousands of couples and friends who trust Careloom to help them 
            stay connected. Start your journey to more meaningful relationships today.
          </p>
        </div>

        {/* Get Started Button */}
        <div className="max-w-lg mx-auto mb-12 animate-scale-in">
          <Button 
            onClick={signInWithGoogle}
            size="lg"
            className="h-14 px-8 text-lg rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            Get Started with Google
          </Button>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 text-center animate-fade-in [animation-delay:200ms]">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold text-rose-800 mb-2">Start Immediately</h3>
            <p className="text-sm text-rose-700/70">Begin strengthening relationships today</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="text-2xl mb-2">💝</div>
            <h3 className="font-semibold text-rose-800 mb-2">Free Forever Plan</h3>
            <p className="text-sm text-rose-700/70">Core features always free</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="text-2xl mb-2">✨</div>
            <h3 className="font-semibold text-rose-800 mb-2">Personalized Experience</h3>
            <p className="text-sm text-rose-700/70">AI that learns your relationships</p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-rose-600/60 mt-8 animate-fade-in [animation-delay:400ms]">
          No spam, ever. Unsubscribe anytime. 
          <span className="block mt-1">Made with 💕 for better relationships</span>
        </p>
      </div>
    </section>
  );
};

export default CallToActionSection;
