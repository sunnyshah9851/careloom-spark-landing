import { TestDateIdeas } from "@/components/dashboard/TestDateIdeas";
import { QuickEmailTest } from "@/components/dashboard/QuickEmailTest";
import { TestBirthdayReminders } from "@/components/dashboard/TestBirthdayReminders";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TestEmailsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Email Testing Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TestDateIdeas />
          <QuickEmailTest />
          <TestBirthdayReminders />
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Testing Instructions</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Test Date Ideas:</strong> Send AI-generated date ideas to any email address with custom city and partner name.</p>
            <p><strong>Quick Email Test:</strong> Send a test birthday reminder to your registered email.</p>
            <p><strong>Birthday Reminders:</strong> Debug and force-send birthday reminder emails.</p>
            <p className="text-xs mt-4 pt-4 border-t">
              💡 Tip: Check both inbox and spam folder when testing emails
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEmailsPage;
