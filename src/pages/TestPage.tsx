
import React from 'react';
import { TestBirthdayReminders } from '@/components/dashboard/TestBirthdayReminders';
import { ManualEmailTest } from '@/components/dashboard/ManualEmailTest';
import { CronJobTester } from '@/components/dashboard/CronJobTester';
import { CronJobDiagnostics } from '@/components/dashboard/CronJobDiagnostics';

const TestPage = () => {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Email System Testing & Debugging</h1>
      
      <div className="space-y-6">
        <CronJobDiagnostics />
        <CronJobTester />
        <TestBirthdayReminders />
        <ManualEmailTest />
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h2>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li><strong>First:</strong> Run "Cron Diagnostics" to see if your automated jobs are properly scheduled</li>
          <li>Use "Setup Cron Jobs" to ensure automated scheduling is working</li>
          <li>Use "Debug Birthday Reminders" to see the 3-day forecast of emails</li>
          <li>Test individual functions using the "Test" buttons</li>
          <li>Check your email inbox and spam folder for reminders</li>
          <li>If emails fail, verify your Resend API key and domain settings</li>
        </ol>
      </div>
    </div>
  );
};

export default TestPage;
