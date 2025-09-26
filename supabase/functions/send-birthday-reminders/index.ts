/// <reference types="https://deno.land/x/types/index.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@3.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Relationship {
  id: string;
  name: string;
  birthday: string | null;
  anniversary: string | null;
  birthday_notification_frequency: string;
  anniversary_notification_frequency: string;
  relationship_type: string;
  city: string | null;
  profile_id: string;
  profiles: {
    email: string;
    full_name: string;
    city: string | null;
  };
}

interface GiftIdea {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  category: string;
  priority: string;
}

interface ReminderResult {
  type: 'birthday' | 'anniversary';
  recipient: string;
  partner: string;
  daysUntil: number;
  success: boolean;
  error?: string;
}

// Helper function to get days offset from frequency
const getFrequencyDays = (frequency: string): number => {
  const frequencyMap: Record<string, number> = {
    '1_day': 1,
    '3_days': 3,
    '1_week': 7,
    '2_weeks': 14,
    '1_month': 30,
    'none': -1
  };
  return frequencyMap[frequency] || 7;
};

// Check if a reminder should be sent today
const shouldSendReminder = (eventDate: string, frequency: string): boolean => {
  const daysOffset = getFrequencyDays(frequency);
  if (daysOffset === -1) return false;

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Parse event date
  const parts = eventDate.split('-');
  const eventMonth = parts.length === 3 ? parseInt(parts[1]) : parseInt(parts[0]);
  const eventDay = parts.length === 3 ? parseInt(parts[2]) : parseInt(parts[1]);
  
  // Calculate event date for this year
  let eventThisYear = new Date(today.getFullYear(), eventMonth - 1, eventDay);
  if (eventThisYear < today) {
    eventThisYear = new Date(today.getFullYear() + 1, eventMonth - 1, eventDay);
  }
  
  // Calculate reminder date
  const reminderDate = new Date(eventThisYear);
  reminderDate.setDate(eventThisYear.getDate() - daysOffset);
  const reminderDateString = reminderDate.toISOString().split('T')[0];
  
  // Send if today is reminder date OR event date
  return todayString === reminderDateString || todayString === eventThisYear.toISOString().split('T')[0];
};

// Calculate age from birthday
const calculateAge = (birthday: string): number => {
  const today = new Date();
  const parts = birthday.split('-');
  let birthYear: number;
  
  if (parts.length === 3) {
    // Format: YYYY-MM-DD
    birthYear = parseInt(parts[0]);
  } else {
    // Format: MM-DD (assume recent birth year for age calculation)
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const eventMonth = parseInt(parts[0]);
    const eventDay = parseInt(parts[1]);
    
    // Estimate birth year (assume most people are between 20-80)
    birthYear = currentYear - 30; // Default to 30 if no year provided
  }
  
  return Math.max(0, today.getFullYear() - birthYear);
};

// Generate AI-powered gift suggestions
const generateGiftSuggestions = async (
  relationshipType: string,
  eventType: 'birthday' | 'anniversary',
  age: number,
  partnerName: string
): Promise<GiftIdea[]> => {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return [];
    }

    const ageContext = age > 0 ? ` who is ${age} years old` : '';
    const prompt = `Generate 3 thoughtful ${eventType === 'birthday' ? 'birthday' : 'anniversary'} gift ideas for ${partnerName}${ageContext}, who is my ${relationshipType}. 

Consider:
- The relationship type: ${relationshipType}
- The occasion: ${eventType}
${age > 0 ? `- Their age: ${age}` : ''}

Format as JSON array with objects containing:
- title: Brief gift name (max 30 chars)
- description: Why it's perfect (max 60 chars)
- price: Estimated price range (e.g., "$25-50", "$100+")
- category: Gift category (e.g., "Experience", "Tech", "Personal")

Make suggestions thoughtful, appropriate for the relationship, and varied in price range.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a thoughtful gift recommendation assistant. Always respond with valid JSON array format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const suggestions = JSON.parse(content);
      return suggestions.map((suggestion: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        title: suggestion.title || 'Thoughtful Gift',
        description: suggestion.description || '',
        price: suggestion.price || '',
        category: suggestion.category || 'Gift',
        priority: 'high'
      }));
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating AI gift suggestions:', error);
    return [];
  }
};

// Get relevant gift ideas for the occasion
const getGiftRecommendations = async (
  relationshipType: string,
  city: string | null,
  eventType: 'birthday' | 'anniversary',
  profileId: string,
  birthday?: string,
  partnerName?: string
): Promise<GiftIdea[]> => {
  try {
    // First, try to get user's saved gift ideas
    const { data: savedGiftIdeas, error } = await supabase
      .from('gift_ideas')
      .select('id, title, description, price, category, priority')
      .eq('user_id', profileId)
      .order('priority', { ascending: false })
      .limit(2);

    if (error) {
      console.error('Error fetching saved gift ideas:', error);
    }

    const savedIdeas = savedGiftIdeas || [];
    
    // Generate AI suggestions to complement saved ideas
    if (partnerName) {
      const age = birthday ? calculateAge(birthday) : 0;
      const aiSuggestions = await generateGiftSuggestions(
        relationshipType,
        eventType,
        age,
        partnerName
      );
      
      // Combine saved ideas with AI suggestions, prioritizing saved ideas
      const combinedIdeas = [...savedIdeas, ...aiSuggestions];
      return combinedIdeas.slice(0, 3); // Return max 3 suggestions
    }
    
    // Fallback to saved ideas only if no partner name
    return savedIdeas.slice(0, 3);
  } catch (error) {
    console.error('Error in getGiftRecommendations:', error);
    return [];
  }
};

// Generate gift recommendation HTML
const generateGiftRecommendationsHTML = (giftIdeas: GiftIdea[], eventType: 'birthday' | 'anniversary'): string => {
  if (giftIdeas.length === 0) {
    return `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #9d4e65; margin: 0 0 10px 0; font-size: 18px;">💡 Gift Ideas</h3>
        <p style="color: #666; margin: 0; font-size: 14px;">
          Consider adding some gift ideas to your Careloom dashboard for personalized recommendations!
        </p>
      </div>
    `;
  }

  const giftHTML = giftIdeas.map(gift => `
    <div style="background: white; border: 1px solid #e1e5e9; border-radius: 6px; padding: 15px; margin: 10px 0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${gift.title}</h4>
          ${gift.description ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">${gift.description}</p>` : ''}
          <span style="background: #9d4e65; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase;">
            ${gift.category}
          </span>
        </div>
        ${gift.price ? `<div style="color: #9d4e65; font-weight: bold; font-size: 16px;">${gift.price}</div>` : ''}
      </div>
    </div>
  `).join('');

  return `
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #9d4e65; margin: 0 0 15px 0; font-size: 18px;">
        🎁 Perfect ${eventType === 'birthday' ? 'Birthday' : 'Anniversary'} Gifts
      </h3>
      ${giftHTML}
      <p style="color: #666; margin: 15px 0 0 0; font-size: 12px; text-align: center;">
        Manage your gift ideas in your <a href="${supabaseUrl?.replace('/auth', '')}" style="color: #9d4e65;">Careloom dashboard</a>
      </p>
    </div>
  `;
};

// Send reminder email
const sendReminderEmail = async (
  recipientEmail: string,
  recipientName: string,
  partnerName: string,
  eventType: 'birthday' | 'anniversary',
  daysUntil: number,
  relationship: Relationship
): Promise<boolean> => {
  try {
    // Get personalized gift recommendations
    const giftIdeas = await getGiftRecommendations(
      relationship.relationship_type,
      relationship.city || relationship.profiles.city,
      eventType,
      relationship.profile_id,
      eventType === 'birthday' ? relationship.birthday : undefined,
      relationship.name
    );

    const subject = daysUntil === 0 
      ? `🎉 It's ${partnerName}'s ${eventType === 'birthday' ? 'Birthday' : 'Anniversary'} today!`
      : `📅 ${partnerName}'s ${eventType === 'birthday' ? 'Birthday' : 'Anniversary'} in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;

    const giftRecommendationsHTML = generateGiftRecommendationsHTML(giftIdeas, eventType);

    const relationshipContext = relationship.relationship_type === 'spouse' || relationship.relationship_type === 'partner' 
      ? 'your special someone' 
      : relationship.relationship_type === 'family' 
        ? 'your family member'
        : `your ${relationship.relationship_type}`;

    const cityContext = relationship.city || relationship.profiles.city 
      ? ` in ${relationship.city || relationship.profiles.city}`
      : '';

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fefcfa;">
        <div style="background: linear-gradient(135deg, #9d4e65 0%, #c08862 100%); padding: 30px; text-align: center; border-radius: 12px; color: white;">
          <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; margin-top: 20px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hi ${recipientName},<br><br>
            ${daysUntil === 0 
              ? `Today is ${partnerName}'s ${eventType === 'birthday' ? 'birthday' : 'anniversary'}! 🎉`
              : `${partnerName}'s ${eventType === 'birthday' ? 'birthday' : 'anniversary'} is coming up in ${daysUntil} day${daysUntil === 1 ? '' : 's'}. 📅`
            }
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Take a moment to celebrate ${relationshipContext}${cityContext}. 
            Whether it's a simple message, a call, or planning something special, 
            your attention and care will mean the world to them.
          </p>
          ${giftRecommendationsHTML}
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
          Sent with care from Careloom 💕
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Careloom <careloom@resend.dev>",
      to: [recipientEmail],
      subject,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json().catch(() => ({}));
    const { debug, forceSend, scheduled, testDateLogic } = requestBody;

    console.log(`=== Birthday Reminder Function Started ===`);
    console.log(`Mode: debug=${debug}, forceSend=${forceSend}, scheduled=${scheduled}`);

    // Test date logic if requested
    if (testDateLogic) {
      const testDates = [
        { date: '1990-05-15', frequency: '1_week' },
        { date: '1990-05-15', frequency: '3_days' },
        { date: '1990-05-15', frequency: '1_day' }
      ];
      
      const testResults = testDates.map(test => ({
        ...test,
        shouldSend: shouldSendReminder(test.date, test.frequency),
        today: new Date().toISOString().split('T')[0]
      }));
      
      return new Response(JSON.stringify({ success: true, testResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fetch relationships
    const { data: relationships, error: fetchError } = await supabase
      .from('relationships')
      .select(`
        id, name, birthday, anniversary, relationship_type, city,
        birthday_notification_frequency, anniversary_notification_frequency,
        profile_id, profiles!inner(email, full_name, city)
      `)
      .not('profiles.email', 'is', null);

    if (fetchError) throw fetchError;

    const results: ReminderResult[] = [];
    const debugInfo: any[] = [];

    // Process each relationship
    for (const rel of relationships || []) {
      const recipientEmail = rel.profiles.email;
      
      // Check birthday reminders
      if (rel.birthday && rel.birthday_notification_frequency !== 'none') {
        const shouldSend = forceSend || shouldSendReminder(rel.birthday, rel.birthday_notification_frequency);
        
        if (debug) {
          debugInfo.push({
            name: rel.name,
            type: 'birthday',
            date: rel.birthday,
            frequency: rel.birthday_notification_frequency,
            shouldSend,
            email: recipientEmail
          });
        }

        if (shouldSend && !debug) {
          const daysUntil = getFrequencyDays(rel.birthday_notification_frequency);
          const success = await sendReminderEmail(
            recipientEmail,
            rel.profiles.full_name,
            rel.name,
            'birthday',
            daysUntil,
            rel
          );

          if (success) {
            // Log the sent reminder
            await supabase.from('reminder_logs').insert({
              relationship_id: rel.id,
              reminder_type: 'birthday',
              reminder_date: new Date().toISOString().split('T')[0],
              event_date: rel.birthday
            });

            results.push({
              type: 'birthday',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              success: true
            });
          } else {
            results.push({
              type: 'birthday',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              success: false,
              error: 'Failed to send email'
            });
          }
        }
      }

      // Check anniversary reminders
      if (rel.anniversary && rel.anniversary_notification_frequency !== 'none') {
        const shouldSend = forceSend || shouldSendReminder(rel.anniversary, rel.anniversary_notification_frequency);
        
        if (debug) {
          debugInfo.push({
            name: rel.name,
            type: 'anniversary',
            date: rel.anniversary,
            frequency: rel.anniversary_notification_frequency,
            shouldSend,
            email: recipientEmail
          });
        }

        if (shouldSend && !debug) {
          const daysUntil = getFrequencyDays(rel.anniversary_notification_frequency);
          const success = await sendReminderEmail(
            recipientEmail,
            rel.profiles.full_name,
            rel.name,
            'anniversary',
            daysUntil,
            rel
          );

          if (success) {
            await supabase.from('reminder_logs').insert({
              relationship_id: rel.id,
              reminder_type: 'anniversary',
              reminder_date: new Date().toISOString().split('T')[0],
              event_date: rel.anniversary
            });

            results.push({
              type: 'anniversary',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              success: true
            });
          } else {
            results.push({
              type: 'anniversary',
              recipient: recipientEmail,
              partner: rel.name,
              daysUntil,
              success: false,
              error: 'Failed to send email'
            });
          }
        }
      }
    }

    const response = debug ? { debugInfo } : { results };
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
