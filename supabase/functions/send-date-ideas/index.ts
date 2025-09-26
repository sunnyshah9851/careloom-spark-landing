import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DateIdea {
  title: string;
  description: string;
}

interface Restaurant {
  name: string;
  description: string;
  website?: string;
}

interface DateIdeasResponse {
  ideas: DateIdea[];
  restaurants: Restaurant[];
}

const generateDateIdeasWithAI = async (city: string, partnerName: string): Promise<DateIdeasResponse> => {
  console.log(`Generating AI date ideas for ${partnerName} in ${city}`);
  
  const prompt = `Generate 3 creative, affordable date ideas and 3 restaurant recommendations for a couple in ${city}. 
  Make the suggestions personalized and thoughtful. Include both indoor and outdoor options where possible.
  
  Return the response in this exact JSON format:
  {
    "ideas": [
      {"title": "Date Idea Title", "description": "Detailed description of the date idea"},
      {"title": "Date Idea Title", "description": "Detailed description of the date idea"},
      {"title": "Date Idea Title", "description": "Detailed description of the date idea"}
    ],
    "restaurants": [
      {"name": "Restaurant Name", "description": "Description with cuisine type and ambiance", "website": "website.com (optional)"},
      {"name": "Restaurant Name", "description": "Description with cuisine type and ambiance", "website": "website.com (optional)"},
      {"name": "Restaurant Name", "description": "Description with cuisine type and ambiance", "website": "website.com (optional)"}
    ]
  }
  
  Make sure the suggestions are specific to ${city} and include local landmarks, neighborhoods, or attractions when possible.`;

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
            content: 'You are a helpful assistant that generates creative, affordable date ideas and restaurant recommendations for couples. Always respond with valid JSON in the exact format requested.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('OpenAI raw response:', aiResponse);
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(aiResponse);
    
    if (!parsedResponse.ideas || !parsedResponse.restaurants) {
      throw new Error('Invalid response format from OpenAI');
    }
    
    console.log('Generated date ideas successfully:', parsedResponse);
    return parsedResponse;
    
  } catch (error) {
    console.error('Error generating date ideas with AI:', error);
    
    // Fallback to simple generic ideas if AI fails
    return {
      ideas: [
        { title: "Local Food Adventure", description: `Explore different neighborhoods in ${city} and try cuisines you've never had before.` },
        { title: "Art & Culture Tour", description: `Visit local galleries, museums, and cultural spots in ${city} and discuss your favorite discoveries.` },
        { title: "Sunset Picnic", description: `Find a beautiful spot in ${city} to watch the sunset together with your favorite snacks.` }
      ],
      restaurants: [
        { name: "Local Italian Spot", description: `Find a cozy Italian restaurant in ${city} known for homemade pasta and intimate atmosphere.` },
        { name: "Farm-to-Table Restaurant", description: `Look for a restaurant in ${city} that focuses on fresh, local ingredients and seasonal menus.` },
        { name: "Rooftop Bar & Grill", description: `Find a rooftop restaurant in ${city} with great views and a romantic setting for dinner.` }
      ]
    };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Date ideas function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get current Monday's date
    const now = new Date();
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - now.getDay() + 1); // Get Monday of current week
    currentMonday.setHours(0, 0, 0, 0);
    const weekOf = currentMonday.toISOString().split('T')[0];

    console.log('Processing date ideas for week of:', weekOf);

    // Get all users with relationships that want weekly date ideas
    const { data: relationships, error: relationshipsError } = await supabase
      .from('relationships')
      .select(`
        id,
        name,
        profile_id,
        profiles!inner(
          id,
          email,
          full_name,
          city
        )
      `)
      .eq('date_ideas_frequency', 'weekly')
      .in('relationship_type', ['partner', 'spouse']);

    if (relationshipsError) {
      console.error('Error fetching relationships:', relationshipsError);
      throw relationshipsError;
    }

    console.log(`Found ${relationships?.length || 0} relationships wanting date ideas`);

    if (!relationships || relationships.length === 0) {
      console.log('No relationships found that want weekly date ideas');
      return new Response(
        JSON.stringify({ message: 'No relationships found that want weekly date ideas' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let emailsSent = 0;
    const errors = [];

    // Helper function to add delay between emails
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < relationships.length; i++) {
      const relationship = relationships[i];
      
      try {
        const user = relationship.profiles as any;
        if (!user.email) {
          console.log(`Skipping relationship ${relationship.id} - no email address`);
          continue;
        }

        // Use user's city for generating ideas
        const userCity = user.city || 'your city';
        console.log(`Generating date ideas for ${relationship.name} in ${userCity}`);

        // Generate date ideas using AI
        const { ideas: dateIdeas, restaurants } = await generateDateIdeasWithAI(userCity, relationship.name);
        
        // Create email HTML
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
            <h1 style="color: #e91e63; margin-bottom: 20px; font-size: 28px;">💖 Time for a Date!</h1>
            
            <p style="color: #333; margin-bottom: 15px; font-size: 16px;">
              Hey lovebirds,
            </p>

            <p style="color: #333; margin-bottom: 15px; font-size: 16px;">
              Remember, the best dates are the ones where you laugh together and make new memories.
            </p>

            <p style="color: #333; margin-bottom: 30px; font-size: 16px;">
              It's been a little while since your last special outing together. How about planning a cozy, fun date this week?
            </p>

            <p style="color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold;">
              Here are some cute ideas and delicious restaurant picks to help you out:
            </p>

            <h2 style="color: #e91e63; margin-bottom: 15px; font-size: 22px;">Creative and Affordable Date Ideas in ${userCity}</h2>
            
            <div style="margin-bottom: 30px;">
              ${dateIdeas.map((idea, index) => `
                <div style="margin-bottom: 15px;">
                  <h3 style="color: #333; margin: 0 0 5px 0; font-size: 18px; font-weight: bold;">${idea.title}:</h3>
                  <p style="color: #666; margin: 0; line-height: 1.5; font-size: 16px;">${idea.description}</p>
                </div>
              `).join('')}
            </div>

            <h2 style="color: #e91e63; margin-bottom: 15px; font-size: 22px;">Affordable Restaurants in ${userCity} Perfect for a Date</h2>
            
            <div style="margin-bottom: 30px;">
              ${restaurants.map((restaurant, index) => `
                <div style="margin-bottom: 15px;">
                  <h3 style="color: #333; margin: 0 0 5px 0; font-size: 18px; font-weight: bold;">${restaurant.name}:</h3>
                  <p style="color: #666; margin: 0; line-height: 1.5; font-size: 16px;">${restaurant.description}${restaurant.website ? ` <a href="https://${restaurant.website}" style="color: #e91e63;">Website</a>` : ''}</p>
                </div>
              `).join('')}
            </div>

            <p style="color: #333; margin-bottom: 10px; font-size: 16px;">
              Now pick one, put it on the calendar, and go make some memories ✨
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
              You're receiving this because you opted in for weekly date night ideas. 
              You can manage your preferences in your relationship settings.
            </p>
          </div>
        `;

        // Send email
        const emailResponse = await resend.emails.send({
          from: 'datenotifier@resend.dev',
          to: [user.email],
          subject: `💕 Date Night Ideas for You & ${relationship.name}`,
          html: emailHtml,
        });

        console.log('Email sent successfully to:', user.email, emailResponse);
        emailsSent++;

        // Add 5-second delay between emails to avoid rate limits (except for the last email)
        if (i < relationships.length - 1) {
          console.log('Waiting 5 seconds before sending next email...');
          await delay(5000);
        }

      } catch (error) {
        console.error(`Error processing relationship ${relationship.id}:`, error);
        errors.push(`Failed to process relationship ${relationship.id}: ${(error as any).message}`);
        
        // Still add delay even on error to maintain rate limiting
        if (i < relationships.length - 1) {
          console.log('Waiting 5 seconds before processing next relationship...');
          await delay(5000);
        }
      }
    }

    console.log(`Date ideas process completed. Emails sent: ${emailsSent}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        message: `Date ideas process completed. Emails sent: ${emailsSent}`,
        emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-date-ideas function:', error);
    return new Response(
      JSON.stringify({ error: (error as any).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);