
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
    console.log('Send-date-ideas function called');
    const { userId, userEmail, userName, city, partnerName } = await req.json();

    console.log('Generating personalized date ideas and restaurants for:', { city, partnerName });

    // Generate date ideas and restaurants using OpenAI
    const { dateIdeas, restaurants } = await generatePersonalizedContent(city, partnerName);

    // Send email with personalized content
    const emailSuccess = await sendPersonalizedEmail(userEmail, userName, partnerName, city, dateIdeas, restaurants);

    if (emailSuccess) {
      console.log('Personalized email sent successfully');
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
      title: "Local Coffee & Conversation Adventure",
      description: `Discover a hidden gem coffee shop in ${city} and spend quality time talking about your dreams and goals.`,
      budget: "$10-25",
      reason: "Perfect for reconnecting and discovering new local spots together"
    },
    {
      title: "Seasonal Outdoor Experience",
      description: `Explore a local park, hiking trail, or outdoor market in ${city}.`,
      budget: "$20-50",
      reason: "Great way to enjoy the current season and get some fresh air together"
    },
    {
      title: "Local Dining Experience",
      description: `Try a new restaurant you've both been curious about in ${city}.`,
      budget: "$80-150",
      reason: "Perfect excuse to try something new and celebrate your relationship"
    }
  ];
}

function getDefaultRestaurants(city: string) {
  return [
    {
      name: "Cozy Local Bistro",
      description: "A charming neighborhood restaurant with intimate seating",
      cuisine: "American/Continental",
      budget: "$50-80",
      reason: "Perfect ambiance for meaningful conversation"
    },
    {
      name: "Trendy Food Hall",
      description: "Modern food hall with diverse options to share",
      cuisine: "Various",
      budget: "$25-45",
      reason: "Great for trying multiple things together"
    },
    {
      name: "Fine Dining Restaurant",
      description: "Upscale restaurant for special celebrations",
      cuisine: "Contemporary",
      budget: "$100-200",
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background: linear-gradient(135deg, #fefcfa 0%, #fdf2f4 100%);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #9d4e65 0%, #c08862 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.2;">
          ✨ Personalized Ideas for You & ${partnerName}
        </h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 400;">
          Custom date ideas and restaurants in ${city}
        </p>
      </div>

      <!-- Introduction -->
      <div style="padding: 30px 30px 20px 30px; background: white;">
        <div style="background: #f9f4f1; border-left: 4px solid #db889b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0; color: #4c333e; font-size: 16px; line-height: 1.5;">
            <strong>Hey ${userName}!</strong> Ready to create amazing memories with ${partnerName}? We've crafted these personalized date ideas and restaurant recommendations specifically for you two in ${city}. Each suggestion is tailored to your location and designed to bring you closer together. ✨
          </p>
        </div>
      </div>

      <!-- Date Ideas Section -->
      <div style="padding: 0 30px; background: white;">
        <h2 style="color: #9d4e65; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">
          💕 Date Ideas in ${city}
        </h2>
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

      <!-- Restaurants Section -->
      <div style="padding: 0 30px; background: white;">
        <h2 style="color: #9d4e65; font-size: 24px; font-weight: 600; margin: 30px 0 20px 0; text-align: center;">
          🍽️ Restaurant Recommendations in ${city}
        </h2>
        ${restaurants.map((restaurant, index) => `
          <div style="margin-bottom: 25px; background: #fefefe; border: 1px solid #f0e6e8; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(157, 78, 101, 0.08);">
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
              <div style="font-size: 24px; margin-right: 15px; flex-shrink: 0;">${['🍷', '🥂', '🍾'][index]}</div>
              <div style="flex-grow: 1;">
                <h3 style="color: #9d4e65; font-size: 20px; font-weight: 600; margin: 0 0 10px 0;">${restaurant.name}</h3>
              </div>
            </div>
            
            <p style="color: #4c333e; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              ${restaurant.description}
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f9f4f1; border-radius: 8px; padding: 15px;">
              <div style="color: #9d4e65; font-weight: 600; font-size: 14px;">
                🍴 ${restaurant.cuisine} • 💰 ${restaurant.budget}
              </div>
            </div>
            <div style="color: #8b6f47; font-size: 14px; font-style: italic; margin-top: 10px;">
              ${restaurant.reason}
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
            Pick one date idea and one restaurant from above and surprise ${partnerName}! The best relationships are built on shared experiences and intentional moments together.
          </p>
          <p style="font-size: 14px; margin: 0; opacity: 0.8;">
            <strong>Pro tip:</strong> Let ${partnerName} choose between two options - it makes them feel included in the planning! 💕
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
      from: "Careloom Ideas <careloom@resend.dev>",
      to: [userEmail],
      subject: `✨ Personalized Ideas for You & ${partnerName} in ${city}`,
      html: emailHtml,
    });

    console.log("Personalized email sent successfully to:", userEmail);
    return true;
  } catch (error) {
    console.error("Error sending personalized email:", error);
    return false;
  }
}

serve(handler);
