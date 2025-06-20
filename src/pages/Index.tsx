
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import CallToActionSection from '@/components/CallToActionSection';
import Dashboard from '@/components/Dashboard';
import Onboarding from '@/components/Onboarding';

const Index = () => {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  console.log('Index page render - user:', user?.email, 'loading:', loading);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      try {
        // Check if user has completed onboarding by looking for relationships
        const { data, error } = await supabase
          .from('relationships')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking relationships:', error);
          setShowOnboarding(true);
        } else if (!data) {
          // No relationship found - show onboarding
          setShowOnboarding(true);
        } else {
          // Existing user with profile - show dashboard
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error('Error in checkUserProfile:', error);
        setShowOnboarding(true);
      } finally {
        setCheckingProfile(false);
      }
    };

    if (user && !loading) {
      checkUserProfile();
    } else if (!loading) {
      setCheckingProfile(false);
    }
  }, [user, loading]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (showOnboarding) {
      console.log('Rendering Onboarding for new user:', user.email);
      return <Onboarding onComplete={() => setShowOnboarding(false)} />;
    } else {
      console.log('Rendering Dashboard for existing user:', user.email);
      return <Dashboard />;
    }
  }

  console.log('Rendering landing page - no user');
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CallToActionSection />
    </div>
  );
};

export default Index;
