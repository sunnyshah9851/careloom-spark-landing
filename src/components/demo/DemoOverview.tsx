import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Calendar, Sparkles, Gift, Coffee } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';

const DemoOverview = () => {
  const { demoRelationships } = useDemo();

  const sampleIdeas = [
    {
      icon: <Coffee className="h-5 w-5 text-rose-500" />,
      title: "Coffee & Catch Up",
      description: "Visit that cozy café downtown Sarah mentioned. Perfect for deep conversations.",
      relationship: "Sarah"
    },
    {
      icon: <Gift className="h-5 w-5 text-rose-500" />,
      title: "Surprise Mom",
      description: "Send her favorite mystery novel series - she's been wanting to read it.",
      relationship: "Mom"
    },
    {
      icon: <Heart className="h-5 w-5 text-rose-500" />,
      title: "Game Night",
      description: "Host a board game evening with Alex. Try that new strategy game you discussed.",
      relationship: "Alex"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-rose-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-full">
                <Users className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-800">{demoRelationships.length}</p>
                <p className="text-rose-600 text-sm">Relationships</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-full">
                <Calendar className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-800">3</p>
                <p className="text-rose-600 text-sm">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-full">
                <Heart className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-800">92%</p>
                <p className="text-rose-600 text-sm">Connection Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Ideas */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-800">
            <Sparkles className="h-5 w-5" />
            Personalized Connection Ideas
          </CardTitle>
          <p className="text-rose-600">Based on your relationships and preferences</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {sampleIdeas.map((idea, index) => (
            <div key={index} className="p-4 bg-rose-50 rounded-lg border border-rose-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-full">
                  {idea.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-rose-800">{idea.title}</h3>
                    <span className="text-xs bg-rose-200 text-rose-700 px-2 py-1 rounded">
                      For {idea.relationship}
                    </span>
                  </div>
                  <p className="text-rose-700 text-sm">{idea.description}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-rose-200">
            <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Get More Personalized Ideas
            </Button>
            <p className="text-center text-sm text-rose-600 mt-2">
              Sign up to receive weekly personalized connection ideas via email
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-800">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-rose-800">Added Sarah to your relationships</p>
                <p className="text-rose-500 text-xs">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-rose-800">Received connection ideas for Mom</p>
                <p className="text-rose-500 text-xs">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-rose-800">Set up birthday reminder for Alex</p>
                <p className="text-rose-500 text-xs">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoOverview;