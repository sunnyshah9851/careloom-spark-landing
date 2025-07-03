
import React from 'react';
import { TestBirthdayReminders } from '@/components/dashboard/TestBirthdayReminders';
import { ManualEmailTest } from '@/components/dashboard/ManualEmailTest';

const TestPage = () => {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Birthday Reminder Testing</h1>
      
      <div className="space-y-6">
        <TestBirthdayReminders />
        <ManualEmailTest />
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h2>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>First, use the "Debug Birthday Reminders" to see what would be sent</li>
          <li>If everything looks correct, use "Manual Email Test" to send actual emails</li>
          <li>Check your email inbox and spam folder for the reminder</li>
          <li>If emails fail, check that your Resend API key is valid and domain is verified</li>
        </ol>
      </div>
    </div>
  );
};

export default TestPage;
