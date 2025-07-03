
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import CallToActionSection from '@/components/CallToActionSection';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const { user, loading } = useAuth();

  console.log('Index page render - user:', user?.email || 'none', 'loading:', loading);

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

  // Show dashboard for authenticated users
  console.log('Rendering Dashboard for authenticated user:', user.email);
  return <Dashboard />;
};

export default Index;
