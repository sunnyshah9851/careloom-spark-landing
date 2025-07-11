import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import CareloomLogo from './CareloomLogo';
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  Settings, 
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardLayout = ({ children, activeTab, onTabChange }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'people', label: 'People in Your Circle', icon: Users },
    { id: 'memories', label: 'Memories', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white/95 backdrop-blur-md border-r border-rose-100/50 transition-all duration-300 flex flex-col z-50",
        "fixed md:relative inset-y-0 left-0",
        sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0 md:w-16"
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
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                    activeTab === item.id
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    "font-medium transition-opacity duration-300",
                    sidebarOpen ? "opacity-100" : "opacity-0 md:hidden"
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-rose-100/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-3 hover:bg-rose-50 rounded-lg p-2 transition-colors",
                !sidebarOpen && "justify-center"
              )}>
                <div className="w-8 h-8 bg-rose-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-rose-700" />
                </div>
                <div className={cn(
                  "flex-1 min-w-0 transition-opacity duration-300 text-left",
                  sidebarOpen ? "opacity-100" : "opacity-0 md:hidden"
                )}>
                  <p className="text-sm font-medium text-rose-800 truncate">
                    {user?.user_metadata?.full_name || user?.email}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleSignOut} className="text-rose-600 focus:text-rose-700">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="md:hidden p-4 border-b border-rose-100/50 bg-white/95 backdrop-blur-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-rose-700 hover:text-rose-900 hover:bg-rose-50"
          >
            <Menu className="h-4 w-4 mr-2" />
            Menu
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
