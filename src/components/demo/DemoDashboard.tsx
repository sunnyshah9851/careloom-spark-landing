import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, BarChart3, Settings } from 'lucide-react';
import DemoPeople from './DemoPeople';
import DemoOverview from './DemoOverview';
import DemoUpgradeCard from './DemoUpgradeCard';

const DemoDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-rose-50 to-cream-50 rounded-2xl border border-rose-100">
        <h1 className="text-2xl font-playfair font-bold text-rose-800 mb-2">
          Welcome to your Careloom Demo! 🌟
        </h1>
        <p className="text-rose-700">
          Explore how Careloom helps you build deeper connections with the people you care about. 
          This demo includes sample data to show you what your dashboard would look like.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="people" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">People</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <DemoOverview />
            </TabsContent>

            <TabsContent value="people">
              <DemoPeople />
            </TabsContent>

            <TabsContent value="events">
              <div className="bg-white rounded-2xl p-8 border border-rose-100">
                <h2 className="text-xl font-playfair font-semibold text-rose-800 mb-4">
                  Upcoming Events (Demo)
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-rose-800">Sarah's Birthday</h3>
                        <p className="text-rose-600 text-sm">June 15, 2024</p>
                      </div>
                      <span className="text-xs bg-rose-200 text-rose-700 px-2 py-1 rounded">
                        In 2 weeks
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-rose-800">Anniversary with Sarah</h3>
                        <p className="text-rose-600 text-sm">March 20, 2024</p>
                      </div>
                      <span className="text-xs bg-rose-200 text-rose-700 px-2 py-1 rounded">
                        In 3 months
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="bg-white rounded-2xl p-8 border border-rose-100">
                <h2 className="text-xl font-playfair font-semibold text-rose-800 mb-4">
                  Settings (Demo)
                </h2>
                <p className="text-rose-600 mb-6">
                  Settings are available after signing up. You'll be able to customize:
                </p>
                <ul className="space-y-3 text-rose-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                    Notification preferences
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                    Nudge frequency settings
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                    Profile information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                    Data export options
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <DemoUpgradeCard />
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;