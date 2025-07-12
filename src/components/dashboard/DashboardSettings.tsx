
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Shield, Trash2 } from 'lucide-react';
import { EmailNotificationTester } from './EmailNotificationTester';

const DashboardSettings = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Settings
        </h1>
        <p className="text-rose-600 text-lg">
          Customize your Careloom experience
        </p>
      </div>

      <div className="space-y-6">
        <EmailNotificationTester />
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-rose-800">Email Reminders</h4>
                  <p className="text-sm text-rose-600">Get reminded about upcoming events via email</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-rose-800">Push Notifications</h4>
                  <p className="text-sm text-rose-600">Receive browser notifications</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <Mail className="h-5 w-5 text-rose-500" />
              Communication
            </CardTitle>
            <CardDescription>
              Manage your communication preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-rose-800">Newsletter</h4>
                  <p className="text-sm text-rose-600">Receive relationship tips and updates</p>
                </div>
                <Button variant="outline" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <Shield className="h-5 w-5 text-rose-500" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Protect your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-rose-800">Data Export</h4>
                  <p className="text-sm text-rose-600">Download a copy of your data</p>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-rose-800">Change Password</h4>
                  <p className="text-sm text-rose-600">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Trash2 className="h-5 w-5 text-red-500" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-800">Delete Account</h4>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSettings;
