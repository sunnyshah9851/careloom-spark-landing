import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Bell, Clock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NotificationSettings = () => {
  const { preferences, loading, saving, updatePreferences } = useNotificationPreferences();
  const { permission, requestPermission, sendTestNotification, canSendNotifications } = usePushNotifications();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [pushDialogOpen, setPushDialogOpen] = useState(false);

  const form = useForm({
    values: preferences,
  });

  const handleEmailSettingsSubmit = async (data: any) => {
    await updatePreferences({
      email_reminders_enabled: data.email_reminders_enabled,
      birthday_reminders_enabled: data.birthday_reminders_enabled,
      anniversary_reminders_enabled: data.anniversary_reminders_enabled,
      nudge_reminders_enabled: data.nudge_reminders_enabled,
      date_ideas_enabled: data.date_ideas_enabled,
      reminder_time: data.reminder_time,
    });
    setEmailDialogOpen(false);
  };

  const handlePushNotificationToggle = async () => {
    if (!preferences.push_notifications_enabled) {
      // Enable push notifications
      const granted = await requestPermission();
      if (granted) {
        await updatePreferences({ push_notifications_enabled: true });
        sendTestNotification();
      }
    } else {
      // Disable push notifications
      await updatePreferences({ push_notifications_enabled: false });
    }
    setPushDialogOpen(false);
  };

  if (loading) {
    return <div>Loading notification settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-800">
          <Bell className="h-5 w-5 text-rose-500" />
          Notifications
        </CardTitle>
        <CardDescription>
          Control when and how you receive reminders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Email Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={preferences.email_reminders_enabled}
                  onCheckedChange={(checked) => updatePreferences({ email_reminders_enabled: checked })}
                  disabled={saving}
                />
                <Mail className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <h4 className="font-medium text-rose-800">Email Reminders</h4>
                <p className="text-sm text-rose-600">Get reminded about upcoming events via email</p>
              </div>
            </div>
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={!preferences.email_reminders_enabled}>
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Email Reminder Settings</DialogTitle>
                  <DialogDescription>
                    Choose which reminders to receive and when
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleEmailSettingsSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="reminder_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Reminder Time
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormDescription>
                            What time should we send daily reminders?
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Reminder Types</Label>
                      
                      <FormField
                        control={form.control}
                        name="birthday_reminders_enabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel className="text-sm">Birthday Reminders</FormLabel>
                              <FormDescription className="text-xs">
                                Get notified about upcoming birthdays
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="anniversary_reminders_enabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel className="text-sm">Anniversary Reminders</FormLabel>
                              <FormDescription className="text-xs">
                                Get notified about upcoming anniversaries
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nudge_reminders_enabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel className="text-sm">Relationship Nudges</FormLabel>
                              <FormDescription className="text-xs">
                                Get suggestions to connect with people
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="date_ideas_enabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel className="text-sm">Date Ideas</FormLabel>
                              <FormDescription className="text-xs">
                                Get weekly date and activity suggestions
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={saving} className="flex-1">
                        {saving ? 'Saving...' : 'Save Settings'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={preferences.push_notifications_enabled && canSendNotifications}
                  onCheckedChange={() => setPushDialogOpen(true)}
                  disabled={saving}
                />
                <Bell className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <h4 className="font-medium text-rose-800">Push Notifications</h4>
                <p className="text-sm text-rose-600">
                  Receive browser notifications
                  {permission === 'denied' && (
                    <span className="text-red-500 ml-1">(Blocked - check browser settings)</span>
                  )}
                </p>
              </div>
            </div>
            <Dialog open={pushDialogOpen} onOpenChange={setPushDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {preferences.push_notifications_enabled ? 'Disable' : 'Enable'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Push Notifications</DialogTitle>
                  <DialogDescription>
                    {preferences.push_notifications_enabled 
                      ? 'Disable browser notifications for Careloom reminders?'
                      : 'Enable browser notifications to get real-time reminders even when the app is closed.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handlePushNotificationToggle} disabled={saving} className="flex-1">
                    {saving ? 'Updating...' : preferences.push_notifications_enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button variant="outline" onClick={() => setPushDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;