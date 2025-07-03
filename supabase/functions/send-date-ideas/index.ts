
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
    console.log('Send-date-ideas function called');

    // Get current date for frequency calculations
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    // Query relationships that need date ideas
    const { data: relationships, error: relationshipsError } = await supabase
      .from('relationships')
      .select(`
        *,
        profiles!inner(
          id,
          email,
          full_name
        )
      `)
      .in('relationship_type', ['partner', 'spouse'])
      .not('date_ideas_frequency', 'is', 'never')
      .not('date_ideas_frequency', 'is', null);

    if (relationshipsError) {
      console.error('Error fetching relationships:', relationshipsError);
      throw relationshipsError;
    }

    console.log(`Found ${relationships?.length || 0} partner/spouse relationships with date ideas enabled`);

    if (!relationships || relationships.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No relationships found that need date ideas emails',
        processed: 0
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailsSent = [];
    const errors = [];

    for (const relationship of relationships) {
      try {
        // Check if we should send based on frequency
        const shouldSend = shouldSendDateIdeas(relationship);
        
        if (!shouldSend) {
          console.log(`Skipping ${relationship.name} - not time to send yet`);
          continue;
        }

        console.log(`Generating date ideas for ${relationship.name} in ${relationship.city || 'their city'}`);

        // Generate date ideas using OpenAI
        const dateIdeas = await generateDateIdeas(relationship);

        // Send email
        const emailSuccess = await sendDateIdeasEmail(relationship, dateIdeas);

        if (emailSuccess) {
          // Update last_nudge_sent timestamp
          await supabase
            .from('relationships')
            .update({ last_nudge_sent: now.toISOString() })
            .eq('id', relationship.id);

          // Log the reminder
          await supabase
            .from('reminder_logs')
            .insert({
              relationship_id: relationship.id,
              reminder_type: 'date_ideas',
              reminder_date: currentDate,
              event_date: currentDate
            });

          // Record event
          await supabase
            .from('events')
            .insert({
              relationship_id: relationship.id,
              event_type: 'date_ideas_sent',
              metadata: {
                action_description: `Sent personalized date ideas for ${relationship.name}`,
                relationship_name: relationship.name,
                city: relationship.city,
                frequency: relationship.date_ideas_frequency
              }
            });

          emailsSent.push(relationship.name);
        }
      } catch (error) {
        console.error(`Error processing ${relationship.name}:`, error);
        errors.push({ name: relationship.name, error: error.message });
      }
    }

    console.log(`Date ideas processing complete. Sent: ${emailsSent.length}, Errors: ${errors.length}`);

    return new Response(JSON.stringify({
      success: true,
      emailsSent: emailsSent.length,
      recipients: emailsSent,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-date-ideas function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function shouldSendDateIdeas(relationship: any): boolean {
  if (!relationship.date_ideas_frequency || relationship.date_ideas_frequency === 'never') {
    return false;
  }

  // If never sent before, send now
  if (!relationship.last_nudge_sent) {
    return true;
  }

  const lastSent = new Date(relationship.last_nudge_sent);
  const now = new Date();
  const daysSinceLastSent = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24));

  switch (relationship.date_ideas_frequency) {
    case 'weekly':
      return daysSinceLastSent >= 7;
    case 'biweekly':
      return daysSinceLastSent >= 14;
    case 'monthly':
      return daysSinceLastSent >= 30;
    default:
      return false;
  }
}

async function generateDateIdeas(relationship: any) {
  const city = relationship.city || 'your city';
  const partnerName = relationship.name;
  const season = getCurrentSeason();
  
  const prompt = `Generate 3 unique, creative date ideas for a couple in ${city}. Make them:

1. **Perfectly matched to their relationship** - thoughtful and romantic for partners/spouses
2. **Local and specific** - mention actual types of places they'd find in ${city}
3. **Budget variety** - include one budget-friendly, one mid-range, and one special occasion option
4. **Seasonal and timely** - perfect for ${season} season
5. **Actionable** - specific enough that they can actually plan and do these

For each date idea, provide:
- A creative title
- 2-3 sentences describing the experience
- Approximate budget range
- Why it's perfect for this season/time

Make it personal and exciting - these should feel like insider recommendations from someone who knows ${city} well.

Format as JSON:
{
  "dateIdeas": [
    {
      "title": "Date idea title",
      "description": "Detailed description of the experience",
      "budget": "Budget range (e.g., $0-20, $50-100, $150+)",
      "reason": "Why this is perfect right now"
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
            content: 'You are a local dating expert who knows cities intimately and creates personalized, actionable date ideas. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return parsed.dateIdeas || [];
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      // Fallback date ideas
      return getDefaultDateIdeas(city);
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return getDefaultDateIdeas(city);
  }
}

function getDefaultDateIdeas(city: string) {
  return [
    {
      title: "Local Coffee & Conversation Adventure",
      description: `Discover a hidden gem coffee shop in ${city} and spend quality time talking about your dreams and goals. Make it special by trying something new on the menu together.`,
      budget: "$10-25",
      reason: "Perfect for reconnecting and discovering new local spots together"
    },
    {
      title: "Seasonal Outdoor Experience",
      description: `Explore a local park, hiking trail, or outdoor market in ${city}. Pack a small picnic and enjoy nature while making memories together.`,
      budget: "$20-50",
      reason: "Great way to enjoy the current season and get some fresh air together"
    },
    {
      title: "Local Dining Experience",
      description: `Try that restaurant you've both been curious about in ${city}. Make it special by dressing up and treating it like a proper date night.`,
      budget: "$80-150",
      reason: "Perfect excuse to try something new and celebrate your relationship"
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

async function sendDateIdeasEmail(relationship: any, dateIdeas: any[]) {
  const userEmail = relationship.profiles.email;
  const userName = relationship.profiles.full_name || userEmail?.split('@')[0] || 'there';
  const partnerName = relationship.name;
  const city = relationship.city || 'your area';

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #fefcfa 0%, #fdf2f4 100%);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #9d4e65 0%, #c08862 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.2;">
          ✨ Date Ideas for You & ${partnerName}
        </h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 400;">
          3 curated experiences perfect for ${city}
        </p>
      </div>

      <!-- Introduction -->
      <div style="padding: 30px 30px 20px 30px; background: white;">
        <div style="background: #f9f4f1; border-left: 4px solid #db889b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0; color: #4c333e; font-size: 16px; line-height: 1.5;">
            <strong>Hey ${userName}!</strong> Ready to create some amazing memories with ${partnerName}? We've curated these special date ideas just for you two, perfectly matched to ${city} and the current season. Each one is designed to bring you closer together. ✨
          </p>
        </div>
      </div>

      <!-- Date Ideas -->
      <div style="padding: 0 30px; background: white;">
        ${dateIdeas.map((idea, index) => `
          <div style="margin-bottom: 25px; background: #fefefe; border: 1px solid #f0e6e8; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(157, 78, 101, 0.08);">
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
              <div style="font-size: 24px; margin-right: 15px; flex-shrink: 0;">${['💕', '🌟', '✨'][index]}</div>
              <div style="flex-grow: 1;">
                <h3 style="color: #9d4e65; font-size: 20px; font-weight: 600; margin: 0 0 10px 0;">${idea.title}</h3>
              </div>
            </div>
            
            <p style="color: #4c333e; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              ${idea.description}
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f9f4f1; border-radius: 8px; padding: 15px;">
              <div style="color: #9d4e65; font-weight: 600; font-size: 14px;">
                💰 ${idea.budget}
              </div>
              <div style="color: #8b6f47; font-size: 14px; font-style: italic; text-align: right; flex: 1; margin-left: 15px;">
                ${idea.reason}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Call to Action -->
      <div style="padding: 0 30px 30px 30px; background: white;">
        <div style="background: linear-gradient(135deg, #db889b 0%, #c08862 100%); border-radius: 12px; padding: 25px; text-align: center; color: white;">
          <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">
            💫 Your Challenge This Week
          </h3>
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0; opacity: 0.95;">
            Pick one of these date ideas and surprise ${partnerName} with it! The best relationships are built on shared experiences and intentional moments together.
          </p>
          <p style="font-size: 14px; margin: 0; opacity: 0.8;">
            <strong>Pro tip:</strong> Let ${partnerName} choose between two of these options - it makes them feel included in the planning! 💕
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f9f4f1; padding: 25px 30px; text-align: center; border-top: 1px solid #f0e6e8;">
        <p style="color: #9d4e65; font-size: 16px; margin: 0 0 15px 0; line-height: 1.5;">
          💝 Making memories with ${partnerName} in ${city}, one date at a time
        </p>
        <p style="color: #8b7479; font-size: 14px; margin: 0;">
          Sent with love from Careloom 💕
        </p>
        <p style="color: #a39298; font-size: 12px; margin: 10px 0 0 0; line-height: 1.4;">
          <em>"The best relationships are built on shared adventures and intentional moments."</em>
        </p>
      </div>
    </div>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: "Careloom Date Ideas <careloom@resend.dev>",
      to: [userEmail],
      subject: `✨ 3 Perfect Date Ideas for You & ${partnerName} in ${city}`,
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
