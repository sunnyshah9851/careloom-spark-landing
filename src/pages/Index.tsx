
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
  const [profileChecked, setProfileChecked] = useState(false);

  console.log('Index page render - user:', user?.email || 'none', 'loading:', loading);

  useEffect(() => {
    const checkUserProfile = async () => {
      // Only check profile if user is authenticated and we haven't checked yet
      if (!user || loading || profileChecked) {
        console.log('Skipping profile check - user:', !!user, 'loading:', loading, 'profileChecked:', profileChecked);
        return;
      }

      console.log('Checking profile for authenticated user:', user.email);
      setCheckingProfile(true);
      setProfileChecked(true);

      try {
        // Check if user has completed onboarding by looking for relationships
        const { data: relationshipData, error: relationshipError } = await supabase
          .from('relationships')
          .select('id')
          .eq('profile_id', user.id)
          .limit(1);

        if (relationshipError) {
          console.error('Error checking relationships:', relationshipError);
          setShowOnboarding(true);
        } else if (!relationshipData || relationshipData.length === 0) {
          console.log('No relationships found - showing onboarding');
          setShowOnboarding(true);
        } else {
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
  }, [user, loading, profileChecked]);

  // Reset profile check when user changes (login/logout)
  useEffect(() => {
    if (!user) {
      setProfileChecked(false);
      setShowOnboarding(false);
      setCheckingProfile(false);
    }
  }, [user]);

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

  // If no user is authenticated, show the landing page
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

  // Show loading while checking user profile
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
          console.log('Onboarding completed - will check profile again');
          setShowOnboarding(false);
          setProfileChecked(false); // Reset to allow re-checking
        }} />
      </div>
    );
  } 
  
  // Show dashboard for existing users
  console.log('Rendering Dashboard for existing user:', user.email);
  return <Dashboard />;
};

export default Index;
