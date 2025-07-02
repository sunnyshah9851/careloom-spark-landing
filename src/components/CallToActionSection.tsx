
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Clock, MapPin } from 'lucide-react';

const CallToActionSection = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <section className="py-24 gradient-warm">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Main CTA Content */}
        <div className="mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-rose-800 mb-6">
            Ready to never run out of
            <span className="text-gradient block">meaningful activity ideas again?</span>
          </h2>
          <p className="text-xl text-rose-700/80 max-w-2xl mx-auto leading-relaxed mb-6">
            Join thousands of people who get personalized activity ideas delivered weekly. 
            Start creating unforgettable memories with everyone who matters to you.
          </p>
          <div className="flex justify-center items-center gap-6 text-rose-700/70 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>2 min setup</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Your city</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>Personalized</span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="max-w-lg mx-auto mb-8 animate-scale-in">
          <Button 
            onClick={signInWithGoogle}
            size="lg"
            className="h-16 px-10 text-xl rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-lg transform transition-all duration-200 hover:scale-105 w-full"
          >
            <Sparkles className="h-6 w-6 mr-3" />
            Get My First Activity Idea Now
          </Button>
        </div>

        {/* Secondary CTA */}
        <div className="mb-12 animate-fade-in [animation-delay:200ms]">
          <button 
            className="text-rose-700 hover:text-rose-900 underline text-lg font-medium"
            onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See More Sample Activity Ideas
          </button>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 text-center animate-fade-in [animation-delay:300ms]">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold text-rose-800 mb-2">Start Immediately</h3>
            <p className="text-sm text-rose-700/70">Get your first activity idea in 2 minutes</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="text-2xl mb-2">💝</div>
            <h3 className="font-semibold text-rose-800 mb-2">Free Forever Plan</h3>
            <p className="text-sm text-rose-700/70">Core activity ideas always free</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-rose-800 mb-2">Perfectly Personalized</h3>
            <p className="text-sm text-rose-700/70">Tailored to your city, budget & relationships</p>
          </div>
        </div>

        {/* Final Hook */}
        <div className="mt-12 bg-rose-100/50 rounded-2xl p-6 animate-fade-in [animation-delay:400ms]">
          <p className="text-lg text-rose-800 font-medium mb-2">
            🎉 Special Launch Offer
          </p>
          <p className="text-rose-700/80">
            First 100 users get a bonus "Activity Mystery Box" with local gift cards and experience vouchers
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-rose-600/60 mt-8 animate-fade-in [animation-delay:500ms]">
          No spam, ever. Unsubscribe anytime. 
          <span className="block mt-1">Made with 💕 to help people create lasting memories together</span>
        </p>
      </div>
    </section>
  );
};

export default CallToActionSection;
