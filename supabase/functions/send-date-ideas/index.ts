import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!resendApiKey) {
  console.error('RESEND_API_KEY not found in environment variables');
}

if (!openaiApiKey) {
  console.error('OPENAI_API_KEY not found in environment variables');
}

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Send-date-ideas function called ===');
    console.log(`Execution time: ${new Date().toISOString()}`);
    
    let requestBody: any = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
      }
    } catch (e) {
      console.log('No request body or invalid JSON');
    }

    const isScheduled = requestBody.scheduled === true;
    const userId = requestBody.userId;
    const userEmail = requestBody.userEmail;
    const userName = requestBody.userName;
    const city = requestBody.city;
    const partnerName = requestBody.partnerName;

    console.log('Request mode:', { isScheduled, hasUserId: !!userId });

    if (isScheduled) {
      // Cron job execution - check all relationships that should get date ideas today
      console.log('Running scheduled date ideas check...');
      
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      // Fetch relationships that have date ideas enabled
      const { data: relationships, error: fetchError } = await supabase
        .from('relationships')
        .select(`
          id,
          name,
          city,
          date_ideas_frequency,
          profile_id,
          profiles!inner(email, full_name, city)
        `)
        .not('profiles.email', 'is', null)
        .not('date_ideas_frequency', 'is', null)
        .neq('date_ideas_frequency', 'never');

      if (fetchError) {
        console.error('Error fetching relationships:', fetchError);
        throw fetchError;
      }

      console.log(`Found ${relationships?.length || 0} relationships with date ideas enabled`);

      const emailsSent = [];
      const emailErrors = [];

      for (const rel of relationships || []) {
        const shouldSend = checkIfShouldSendDateIdeasOnDate(rel.date_ideas_frequency, today);
        
        console.log(`Checking ${rel.name}: frequency=${rel.date_ideas_frequency}, shouldSend=${shouldSend}`);
        
        if (shouldSend) {
          const userCity = rel.city || rel.profiles.city || 'your city';
          
          console.log(`Generating date ideas for ${rel.name} in ${userCity}`);
          
          const { dateIdeas, restaurants } = await generatePersonalizedContent(userCity, rel.name);
          
          const emailSuccess = await sendPersonalizedEmail(
            rel.profiles.email,
            rel.profiles.full_name,
            rel.name,
            userCity,
            dateIdeas,
            restaurants
          );

          if (emailSuccess) {
            console.log(`Date ideas email sent successfully to ${rel.profiles.email}`);
            emailsSent.push({
              recipient: rel.profiles.email,
              partner: rel.name,
              city: userCity
            });
          } else {
            console.error(`Failed to send date ideas email to ${rel.profiles.email}`);
            emailErrors.push({
              recipient: rel.profiles.email,
              partner: rel.name,
              error: 'Failed to send email'
            });
          }
        }
      }

      console.log(`=== Scheduled execution summary ===`);
      console.log(`Successfully sent ${emailsSent.length} date ideas emails`);
      console.log(`Failed to send ${emailErrors.length} emails`);

      return new Response(JSON.stringify({
        success: true,
        scheduled: true,
        emailsSent: emailsSent.length,
        emailErrors: emailErrors.length,
        details: emailsSent,
        errors: emailErrors.length > 0 ? emailErrors : undefined
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
      
    } else {
      // Manual execution for specific user
      console.log('Manual date ideas request for:', { userEmail, userName, partnerName, city });

      if (!userEmail || !userName || !partnerName || !city) {
        throw new Error('Missing required parameters for manual execution');
      }

      const { dateIdeas, restaurants } = await generatePersonalizedContent(city, partnerName);
      const emailSuccess = await sendPersonalizedEmail(userEmail, userName, partnerName, city, dateIdeas, restaurants);

      if (emailSuccess) {
        console.log('Manual date ideas email sent successfully');
        return new Response(JSON.stringify({
          success: true,
          message: 'Personalized ideas sent successfully'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } else {
        throw new Error('Failed to send email');
      }
    }

  } catch (error: any) {
    console.error("Error in send-date-ideas function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function checkIfShouldSendDateIdeasOnDate(frequency: string, checkDate: Date): boolean {
  const normalizedCheckDate = new Date(checkDate);
  normalizedCheckDate.setUTCHours(0, 0, 0, 0);
  
  const dayOfWeek = normalizedCheckDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  
  console.log(`Checking date ideas frequency: ${frequency}, day of week: ${dayOfWeek}, date: ${normalizedCheckDate.toISOString().split('T')[0]}`);
  
  switch (frequency) {
    case 'weekly':
      return dayOfWeek === 1; // Monday
    case 'biweekly':
      // Every other Monday - use week number
      const weekNumber = Math.floor((normalizedCheckDate.getTime() - new Date(normalizedCheckDate.getUTCFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      return dayOfWeek === 1 && weekNumber % 2 === 0;
    case 'monthly':
      // First Monday of each month
      const firstOfMonth = new Date(normalizedCheckDate.getUTCFullYear(), normalizedCheckDate.getUTCMonth(), 1);
      const firstMonday = new Date(firstOfMonth);
      firstMonday.setUTCDate(1 + (8 - firstOfMonth.getUTCDay()) % 7);
      return normalizedCheckDate.getTime() === firstMonday.getTime();
    case 'never':
    default:
      return false;
  }
}

async function generatePersonalizedContent(city: string, partnerName: string) {
  const season = getCurrentSeason();
  
  const prompt = `Generate personalized date ideas and restaurant recommendations for a couple in ${city}. The partner's name is ${partnerName}.

Please provide:
1. **3 unique date ideas** - creative, local, and perfect for ${season} season in ${city}
2. **3 restaurant recommendations** - specific restaurants or types of restaurants they can find in ${city}

Make them:
- Specific to ${city} and what's available there
- Perfect for the current ${season} season
- Include a mix of budget ranges (budget-friendly, mid-range, special occasion)
- Actionable and specific enough to actually plan

Format as JSON:
{
  "dateIdeas": [
    {
      "title": "Date idea title",
      "description": "Detailed description of the experience",
      "budget": "Budget range (e.g., $0-20, $50-100, $150+)",
      "reason": "Why this is perfect for ${season} in ${city}"
    }
  ],
  "restaurants": [
    {
      "name": "Restaurant name or type",
      "description": "What makes this place special",
      "cuisine": "Type of cuisine",
      "budget": "Budget range",
      "reason": "Why it's perfect for a date"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a local dating expert who knows cities intimately and creates personalized, actionable date ideas and restaurant recommendations. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return {
        dateIdeas: parsed.dateIdeas || getDefaultDateIdeas(city),
        restaurants: parsed.restaurants || getDefaultRestaurants(city)
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      return {
        dateIdeas: getDefaultDateIdeas(city),
        restaurants: getDefaultRestaurants(city)
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      dateIdeas: getDefaultDateIdeas(city),
      restaurants: getDefaultRestaurants(city)
    };
  }
}

function getDefaultDateIdeas(city: string) {
  return [
    {
      title: "Coffee & Conversation",
      description: `Find a cozy coffee shop in ${city} and enjoy quality time together.`,
      budget: "$10-25",
      reason: "Perfect for reconnecting and discovering new local spots"
    },
    {
      title: "Local Walk",
      description: `Take a stroll through a nice area of ${city}.`,
      budget: "$0-20",
      reason: "Great way to enjoy time together and explore your city"
    },
    {
      title: "Dinner Date",
      description: `Try a new restaurant in ${city} you've both wanted to visit.`,
      budget: "$60-120",
      reason: "Perfect opportunity to try something new together"
    }
  ];
}

function getDefaultRestaurants(city: string) {
  return [
    {
      name: "Local Italian",
      description: "A cozy Italian restaurant with great ambiance",
      cuisine: "Italian",
      budget: "$40-70",
      reason: "Perfect for romantic dinner conversations"
    },
    {
      name: "Casual Cafe",
      description: "A nice casual spot for lunch or brunch",
      cuisine: "American",
      budget: "$20-40",
      reason: "Great for relaxed, comfortable dates"
    },
    {
      name: "Fine Dining",
      description: "Upscale restaurant for special occasions",
      cuisine: "Contemporary",
      budget: "$80-150",
      reason: "Perfect for celebrating your relationship"
    }
  ];
}

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

async function sendPersonalizedEmail(userEmail: string, userName: string, partnerName: string, city: string, dateIdeas: any[], restaurants: any[]) {
  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <h2 style="color: #2563eb;">Hi ${userName}!</h2>
      
      <p style="font-size: 16px; line-height: 1.5; color: #374151;">
        Here are some personalized date ideas for you and ${partnerName} in ${city}:
      </p>

      <h3 style="color: #1f2937;">Date Ideas</h3>
      ${dateIdeas.map((idea, index) => `
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #3b82f6;">
          <h4 style="color: #1f2937; margin: 0 0 10px 0;">${idea.title}</h4>
          <p style="color: #4b5563; margin: 0 0 10px 0;">${idea.description}</p>
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span style="color: #059669; font-weight: 600;">${idea.budget}</span>
            <span style="color: #6b7280; font-style: italic;">${idea.reason}</span>
          </div>
        </div>
      `).join('')}

      <h3 style="color: #1f2937;">Restaurant Recommendations</h3>
      ${restaurants.map((restaurant, index) => `
        <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #0ea5e9;">
          <h4 style="color: #1f2937; margin: 0 0 10px 0;">${restaurant.name}</h4>
          <p style="color: #4b5563; margin: 0 0 10px 0;">${restaurant.description}</p>
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span style="color: #7c3aed;">${restaurant.cuisine} • ${restaurant.budget}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px; font-style: italic; margin: 5px 0 0 0;">${restaurant.reason}</p>
        </div>
      `).join('')}

      <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
        <p style="color: #92400e; margin: 0; font-weight: 500;">
          Pick one idea and surprise ${partnerName} this week!
        </p>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Sent with care from Careloom
      </p>
    </div>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: "Careloom Ideas <careloom@resend.dev>",
      to: [userEmail],
      subject: `Date ideas for you and ${partnerName} in ${city}`,
      html: emailHtml,
    });

    console.log("Date ideas email sent successfully to:", userEmail);
    return true;
  } catch (error) {
    console.error("Error sending date ideas email:", error);
    return false;
  }
}

serve(handler);
