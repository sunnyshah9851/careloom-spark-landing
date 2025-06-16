
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import CallToActionSection from '@/components/CallToActionSection';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const { user, loading } = useAuth();

  console.log('Index page render - user:', user?.email, 'loading:', loading);

  if (loading) {
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
    console.log('Rendering Dashboard for user:', user.email);
    return <Dashboard />;
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
