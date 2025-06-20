
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Camera, Gift } from 'lucide-react';

const DashboardMemories = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Memories
        </h1>
        <p className="text-rose-600 text-lg">
          Capture and cherish your special moments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-dashed border-2 border-rose-200 hover:border-rose-300 transition-colors cursor-pointer">
          <CardContent className="p-8 text-center">
            <Camera className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h3 className="font-medium text-rose-800 mb-2">
              Add Photos
            </h3>
            <p className="text-sm text-rose-600">
              Upload pictures from your special moments together
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-rose-200 hover:border-rose-300 transition-colors cursor-pointer">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h3 className="font-medium text-rose-800 mb-2">
              Love Notes
            </h3>
            <p className="text-sm text-rose-600">
              Write down your favorite memories and thoughts
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-rose-200 hover:border-rose-300 transition-colors cursor-pointer">
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h3 className="font-medium text-rose-800 mb-2">
              Gift Ideas
            </h3>
            <p className="text-sm text-rose-600">
              Keep track of things they've mentioned wanting
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-rose-800">Recent Memories</CardTitle>
            <CardDescription>
              Your latest captured moments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-rose-600 text-center py-8">
              Start adding memories to see them here!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMemories;
