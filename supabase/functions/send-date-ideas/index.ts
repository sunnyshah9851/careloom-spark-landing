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
    const prompt = `Generate creative and affordable date ideas and restaurant recommendations for a couple in ${city}.

    Please provide:
    1. 3 creative and affordable date ideas with detailed descriptions
    2. 3 romantic restaurants with descriptions and what they're known for

    Format as JSON:
    {
      "dateIdeas": [
        {
          "title": "Date Idea Title",
          "description": "Detailed description of what to do"
        }
      ],
      "restaurants": [
        {
          "name": "Restaurant Name",
          "description": "What they're known for and atmosphere",
          "location": "Neighborhood/area in ${city}"
        }
      ]
    }

    Make the date ideas specific to ${city} and include actual local landmarks, parks, or activities when possible.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
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
          dateIdeas: [
            {
              title: "Romantic Dinner",
              description: `Enjoy a cozy dinner at a local restaurant in ${city}`
            },
            {
              title: "Scenic Walk",
              description: `Take a leisurely stroll through a beautiful area in ${city}`
            },
            {
              title: "Cultural Experience",
              description: `Visit a local museum or cultural attraction in ${city}`
            }
          ],
          restaurants: [
            {
              name: "Local Favorite",
              description: "A charming restaurant perfect for date night",
              location: `${city}`
            }
          ]
        };
      }
    }
    
    throw new Error('Failed to generate content');
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return fallback content
    return {
      dateIdeas: [
        {
          title: "Romantic Evening",
          description: `Plan a romantic dinner at a local restaurant in ${city}`
        },
        {
          title: "Outdoor Adventure",
          description: `Explore beautiful outdoor activities near ${city}`
        },
        {
          title: "Cultural Discovery",
          description: `Discover local cultural attractions in ${city}`
        }
      ],
      restaurants: [
        {
          name: "Local Restaurant",
          description: "A wonderful spot for a romantic meal",
          location: `${city}`
        }
      ]
    };
  }
};

// Send date ideas email
const sendDateIdeasEmail = async (
  recipientEmail: string,
  recipientName: string,
  partnerName: string,
  city: string,
  dateIdeas: any[],
  restaurants: any[]
): Promise<boolean> => {
  try {
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; color: #333; margin: 0;">💖 Time for a Date!</h1>
        </div>
        
        <div style="background: white; padding: 0; margin-bottom: 30px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
            Hey lovebirds,
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
            Remember, the best dates are the ones where you laugh together and make new memories.
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px;">
            It's been a little while since your last special outing together. How about planning a cozy, fun date this week?
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
            Here are some cute ideas and delicious restaurant picks to help you out:
          </p>
          
          <h2 style="color: #333; font-size: 20px; margin: 30px 0 15px 0;">Creative and Affordable Date Ideas in ${city}</h2>
          <div style="margin-bottom: 30px;">
            ${dateIdeas.map(idea => `
              <div style="margin-bottom: 15px;">
                <strong style="color: #333;">${idea.title}:</strong> ${idea.description}
              </div>
            `).join('')}
          </div>
          
          <h2 style="color: #333; font-size: 20px; margin: 30px 0 15px 0;">Affordable Restaurants in ${city} Perfect for a Date</h2>
          <div style="margin-bottom: 30px;">
            ${restaurants.map(restaurant => `
              <div style="margin-bottom: 15px;">
                <strong style="color: #333;">${restaurant.name}:</strong> ${restaurant.location ? `Located in ${restaurant.location}, this ` : ''}${restaurant.description}
              </div>
            `).join('')}
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 30px;">
            Now pick one, put it on the calendar, and go make some memories ✨
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          Sent with love from Careloom 💕
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Careloom <careloom@resend.dev>",
      to: [recipientEmail],
      subject: "💖 Time for a Date!",
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
            const { dateIdeas, restaurants } = await generateDateIdeas(userCity, rel.name);
            const success = await sendDateIdeasEmail(
              rel.profiles.email,
              rel.profiles.full_name,
              rel.name,
              userCity,
              dateIdeas,
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

      const { dateIdeas, restaurants } = await generateDateIdeas(city, partnerName);
      const success = await sendDateIdeasEmail(userEmail, userName, partnerName, city, dateIdeas, restaurants);

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
