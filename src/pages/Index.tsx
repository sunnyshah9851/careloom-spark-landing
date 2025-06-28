
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
  const [checkingProfile, setCheckingProfile] = useState(false);

  console.log('Index page render - user:', user?.email, 'loading:', loading);

  useEffect(() => {
    const checkUserProfile = async () => {
      // Only check profile if user is authenticated and auth is not loading
      if (!user || loading) {
        console.log('No user or still loading, resetting states');
        setCheckingProfile(false);
        setShowOnboarding(false);
        return;
      }

      console.log('Checking profile for authenticated user:', user.email);
      setCheckingProfile(true);

      try {
        // First, ensure the user has a profile (create if missing)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking profile:', profileError);
        }

        // If no profile exists, create one
        if (!profileData) {
          console.log('No profile found, creating one...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Profile created successfully');
          }
        }

        // Check if user has completed onboarding by looking for relationships
        const { data: relationshipData, error: relationshipError } = await supabase
          .from('relationships')
          .select('id')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (relationshipError) {
          console.error('Error checking relationships:', relationshipError);
          // If there's an error, assume they need onboarding
          setShowOnboarding(true);
        } else if (!relationshipData) {
          // No relationship found - show onboarding
          console.log('No relationships found - showing onboarding');
          setShowOnboarding(true);
        } else {
          // Existing user with profile - show dashboard
          console.log('Existing user with relationships - showing dashboard');
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error('Error in checkUserProfile:', error);
        setShowOnboarding(true);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkUserProfile();
  }, [user, loading]);

  // Show loading spinner while authentication is being determined
  if (loading) {
    console.log('Auth loading - showing spinner');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is authenticated, ALWAYS show the landing page
  if (!user) {
    console.log('Rendering landing page - no authenticated user');
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <CallToActionSection />
        </main>
      </div>
    );
  }

  // Show loading while checking user profile (only for authenticated users)
  if (checkingProfile) {
    console.log('Checking user profile - showing setup spinner');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // User is authenticated - show onboarding or dashboard
  if (showOnboarding) {
    console.log('Rendering Onboarding for new user:', user.email);
    return (
      <div className="min-h-screen bg-background">
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </div>
    );
  } 
  
  console.log('Rendering Dashboard for existing user:', user.email);
  return <Dashboard />;
};

export default Index;
