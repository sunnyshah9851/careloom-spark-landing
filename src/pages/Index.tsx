
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

  console.log('Index page render - user:', user?.email || 'none', 'loading:', loading);

  useEffect(() => {
    const checkUserProfile = async () => {
      // Only check if user exists and we're not loading
      if (!user || loading) {
        console.log('Skipping profile check - no user or loading');
        setShowOnboarding(false);
        setCheckingProfile(false);
        return;
      }

      console.log('Checking profile for user:', user.email);
      setCheckingProfile(true);

      try {
        const { data: relationshipData, error } = await supabase
          .from('relationships')
          .select('id')
          .eq('profile_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error checking relationships:', error);
          setShowOnboarding(true);
        } else if (!relationshipData || relationshipData.length === 0) {
          console.log('No relationships found - showing onboarding');
          setShowOnboarding(true);
        } else {
          console.log('User has relationships - showing dashboard');
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
  }, [user, loading]); // Only depend on user and loading

  // Show loading while auth is being determined
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

  // If no user, show landing page
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

  // Show loading while checking profile
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

  // Show onboarding for new users
  if (showOnboarding) {
    console.log('Rendering Onboarding for new user:', user.email);
    return (
      <div className="min-h-screen bg-background">
        <Onboarding onComplete={() => {
          console.log('Onboarding completed');
          setShowOnboarding(false);
        }} />
      </div>
    );
  } 
  
  // Show dashboard for existing users
  console.log('Rendering Dashboard for existing user:', user.email);
  return <Dashboard />;
};

export default Index;
