import { useDemo } from '@/contexts/DemoContext';
import DemoHeader from '@/components/demo/DemoHeader';
import DemoDashboard from '@/components/demo/DemoDashboard';

const DemoPage = () => {
  const { isDemoMode } = useDemo();

  if (!isDemoMode) {
    // Redirect to home if not in demo mode
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DemoHeader />
      <DemoDashboard />
    </div>
  );
};

export default DemoPage;