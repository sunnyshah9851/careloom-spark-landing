import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to delete your account",
          variant: "destructive",
        });
        return;
      }

      // Call our edge function to delete the user account
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Delete account error:', error);
        toast({
          title: "Error", 
          description: "Account deletion failed. Please contact support for assistance.",
          variant: "destructive",
        });
        return;
      }

      // Sign out the user
      await supabase.auth.signOut();

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowFinalConfirmation(false);
      setIsOpen(false);
    }
  };

  const handleOpenFinalConfirmation = () => {
    setIsOpen(false);
    setShowFinalConfirmation(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center justify-between w-full">
            <div>
              <h4 className="font-medium text-red-800">Delete Account</h4>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="font-medium text-red-800 mb-2">What will be deleted:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Your profile information</li>
                <li>• All your relationships and contact data</li>
                <li>• All events and memories</li>
                <li>• Your notification preferences</li>
                <li>• All other personal data</li>
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleOpenFinalConfirmation}>
                I understand, proceed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showFinalConfirmation} onOpenChange={setShowFinalConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure? This action is irreversible and will permanently delete your account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmationText" className="text-sm font-medium">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </Label>
              <Input
                id="confirmationText"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE here"
                className="mt-1"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setConfirmationText('');
              setShowFinalConfirmation(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={confirmationText !== 'DELETE' || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Account Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteAccountModal;