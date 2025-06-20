
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import CareloomLogo from './CareloomLogo';
import { 
  LayoutDashboard, 
  Calendar, 
  Heart, 
  Settings, 
  User,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardLayout = ({ children, activeTab, onTabChange }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Upcoming Events', icon: Calendar },
    { id: 'memories', label: 'Memories', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen gradient-warm flex">
      {/* Sidebar */}
      <div className={cn(
        "bg-white/90 backdrop-blur-md border-r border-rose-100/50 transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-rose-100/50">
          <div className="flex items-center justify-between">
            {sidebarOpen && <CareloomLogo />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-rose-700 hover:text-rose-900 hover:bg-rose-50"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                    activeTab === item.id
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-rose-100/50">
          <div className={cn(
            "flex items-center gap-3",
            !sidebarOpen && "justify-center"
          )}>
            <div className="w-8 h-8 bg-rose-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-rose-700" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-rose-800 truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-xs text-rose-600 hover:text-rose-700 p-0 h-auto"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
