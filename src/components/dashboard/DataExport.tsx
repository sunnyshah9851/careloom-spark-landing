import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to export data",
          variant: "destructive",
        });
        return;
      }

      // Fetch all user data
      const [profileResponse, relationshipsResponse, eventsResponse, notificationPrefsResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('relationships').select('*').eq('profile_id', user.id),
        supabase.from('events').select('*, relationships!inner(profile_id)').eq('relationships.profile_id', user.id),
        supabase.from('notification_preferences').select('*').eq('user_id', user.id).single()
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_info: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile: profileResponse.data,
        relationships: relationshipsResponse.data || [],
        events: eventsResponse.data || [],
        notification_preferences: notificationPrefsResponse.data
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `careloom-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium text-rose-800">Data Export</h4>
        <p className="text-sm text-rose-600">Download a copy of your data</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportData}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export
          </>
        )}
      </Button>
    </div>
  );
};

export default DataExport;