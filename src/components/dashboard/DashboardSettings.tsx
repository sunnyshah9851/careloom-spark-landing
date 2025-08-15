
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Trash2 } from 'lucide-react';
import DataExport from './DataExport';
import ChangePasswordModal from './ChangePasswordModal';
import DeleteAccountModal from './DeleteAccountModal';

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
              <DataExport />
              <ChangePasswordModal />
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
            <DeleteAccountModal />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSettings;
