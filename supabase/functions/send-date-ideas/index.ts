import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!resendApiKey || !openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables');
}

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Relationship {
  id: string;
  name: string;
  city: string | null;
  date_ideas_frequency: string;
  profiles: {
    email: string;
    full_name: string;
    city: string | null;
  };
}

interface DateIdeaResult {
  recipient: string;
  partner: string;
  city: string;
  success: boolean;
  error?: string;
}

// Check if date ideas should be sent today
const shouldSendDateIdeas = (frequency: string, today: Date): boolean => {
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  switch (frequency) {
    case 'daily': return true;
    case 'weekly': return dayOfWeek === 1; // Monday
    case 'biweekly': return dayOfWeek === 1 && Math.floor(today.getDate() / 7) % 2 === 0;
    case 'monthly': return today.getDate() === 1; // First day of month
    default: return false;
  }
};

// Generate date ideas using OpenAI
const generateDateIdeas = async (city: string, partnerName: string) => {
  try {
    const prompt = `Generate 3 creative date ideas for a couple in ${city}. 
    Make them specific to the location and include:
    1. A romantic dinner option
    2. An outdoor/activity option  
    3. A cultural/entertainment option
    
    Format as JSON: {"ideas": ["idea1", "idea2", "idea3"], "restaurants": ["restaurant1", "restaurant2"]}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        // Fallback if JSON parsing fails
        return {
          ideas: [
            `Enjoy a romantic dinner at a local restaurant in ${city}`,
            `Take a scenic walk or hike near ${city}`,
            `Visit a local museum or cultural site in ${city}`
          ],
          restaurants: [`Local restaurant in ${city}`]
        };
      }
    }
    
    throw new Error('Failed to generate content');
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return fallback content
    return {
      ideas: [
        `Plan a romantic dinner at a local restaurant in ${city}`,
        `Explore outdoor activities near ${city}`,
        `Discover local cultural attractions in ${city}`
      ],
      restaurants: [`Local restaurant in ${city}`]
    };
  }
};

// Send date ideas email
const sendDateIdeasEmail = async (
  recipientEmail: string,
  recipientName: string,
  partnerName: string,
  city: string,
  dateIdeas: string[],
  restaurants: string[]
): Promise<boolean> => {
  try {
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fefcfa;">
        <div style="background: linear-gradient(135deg, #9d4e65 0%, #c08862 100%); padding: 30px; text-align: center; border-radius: 12px; color: white;">
          <h1 style="margin: 0; font-size: 24px;">💕 Date Ideas for You & ${partnerName}</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; margin-top: 20px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hi ${recipientName},<br><br>
            Here are some fresh date ideas to inspire your time with ${partnerName} in ${city}:
          </p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #9d4e65; margin-top: 0;">🎯 Date Ideas</h3>
            <ul style="color: #333; line-height: 1.6;">
              ${dateIdeas.map(idea => `<li>${idea}</li>`).join('')}
            </ul>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #9d4e65; margin-top: 0;">🍽️ Restaurant Suggestions</h3>
            <ul style="color: #333; line-height: 1.6;">
              ${restaurants.map(restaurant => `<li>${restaurant}</li>`).join('')}
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Choose one idea and make it your own! The best dates are the ones that feel authentic to your relationship.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
          Sent with love from Careloom 💕
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Careloom <careloom@resend.dev>",
      to: [recipientEmail],
      subject: `💕 Fresh Date Ideas for You & ${partnerName}`,
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
    const { scheduled, userId, userEmail, userName, city, partnerName } = requestBody;

    console.log('=== Date Ideas Function Started ===');
    console.log(`Mode: scheduled=${scheduled}, userId=${userId}`);

    if (scheduled) {
      // Cron job execution - check all relationships that should get date ideas today
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      // Fetch relationships with date ideas enabled
      const { data: relationships, error: fetchError } = await supabase
        .from('relationships')
        .select(`
          id, name, city, date_ideas_frequency,
          profile_id, profiles!inner(email, full_name, city)
        `)
        .not('profiles.email', 'is', null)
        .not('date_ideas_frequency', 'is', null)
        .neq('date_ideas_frequency', 'never');

      if (fetchError) throw fetchError;

      const results: DateIdeaResult[] = [];

      // Process each relationship
      for (const rel of relationships || []) {
        if (shouldSendDateIdeas(rel.date_ideas_frequency, today)) {
          const userCity = rel.city || rel.profiles.city || 'your city';
          
          try {
            const { ideas, restaurants } = await generateDateIdeas(userCity, rel.name);
            const success = await sendDateIdeasEmail(
              rel.profiles.email,
              rel.profiles.full_name,
              rel.name,
              userCity,
              ideas,
              restaurants
            );

            results.push({
              recipient: rel.profiles.email,
              partner: rel.name,
              city: userCity,
              success
            });
          } catch (error) {
            results.push({
              recipient: rel.profiles.email,
              partner: rel.name,
              city: userCity,
              success: false,
              error: error.message
            });
          }
        }
      }

      return new Response(JSON.stringify({
        success: true,
        scheduled: true,
        results,
        totalProcessed: relationships?.length || 0,
        totalSent: results.filter(r => r.success).length
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
      
    } else {
      // Manual execution for specific user
      if (!userEmail || !userName || !city || !partnerName) {
        throw new Error('Missing required parameters for manual execution');
      }

      const { ideas, restaurants } = await generateDateIdeas(city, partnerName);
      const success = await sendDateIdeasEmail(userEmail, userName, partnerName, city, ideas, restaurants);

      return new Response(JSON.stringify({
        success,
        scheduled: false,
        message: success ? 'Date ideas email sent successfully' : 'Failed to send email'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: success ? 200 : 500,
      });
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
