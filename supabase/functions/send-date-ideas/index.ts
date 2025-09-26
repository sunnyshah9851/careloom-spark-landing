import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

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

const generateDateIdeas = (city: string): { ideas: DateIdea[], restaurants: Restaurant[] } => {
  const cityIdeas: Record<string, { ideas: DateIdea[], restaurants: Restaurant[] }> = {
    "Manhattan": {
      ideas: [
        { title: "Stroll in Central Park", description: "Spend a leisurely afternoon exploring the iconic Central Park, rent a rowboat for a romantic paddle around the lake, or simply enjoy a picnic." },
        { title: "Visit the High Line", description: "Walk along this elevated park built on a former railway line, it offers stunning views of the city and features rotating art installations." },
        { title: "Comedy Night at Upright Citizens Brigade", description: "Enjoy a night of laughs at this well-known improv comedy club located in Hell's Kitchen." },
        { title: "Brooklyn Bridge Walk", description: "Take a romantic evening stroll across the iconic Brooklyn Bridge and enjoy the stunning city skyline views." },
        { title: "Museum Date at MoMA", description: "Explore modern art together at the Museum of Modern Art and discuss your favorite pieces over coffee." }
      ],
      restaurants: [
        { name: "Malatesta Trattoria", description: "Located in West Village, this cozy Italian restaurant is known for its homemade pasta in a rustic setting.", website: "malatestatrattoria.com" },
        { name: "The Spotted Pig", description: "A gastropub in the heart of Greenwich Village, offering a unique British and Italian influenced menu in a quirky atmosphere.", website: "thespottedpig.com" },
        { name: "Supper", description: "A romantic spot in East Village serving traditional Italian fare in a candle-lit, brick-walled setting.", website: "supperrestaurant.com" }
      ]
    },
    "Brooklyn": {
      ideas: [
        { title: "DUMBO Waterfront Park", description: "Enjoy stunning views of Manhattan skyline while walking along the waterfront or having a picnic." },
        { title: "Brooklyn Museum & Botanic Garden", description: "Explore art and nature together in this beautiful cultural complex." },
        { title: "Coney Island Adventure", description: "Take a nostalgic trip to Coney Island for boardwalk fun and classic amusement rides." }
      ],
      restaurants: [
        { name: "Cecconi's DUMBO", description: "Italian dining with spectacular views of the Manhattan skyline." },
        { name: "Juliana's Pizza", description: "Classic New York pizza in a cozy setting near the Brooklyn Bridge." },
        { name: "The River Café", description: "Upscale dining with breathtaking views and romantic ambiance." }
      ]
    }
  };

  // Default ideas for any city
  const defaultIdeas = {
    ideas: [
      { title: "Local Food Adventure", description: `Explore different neighborhoods in ${city} and try cuisines you've never had before.` },
      { title: "Art & Culture Tour", description: `Visit local galleries, museums, and cultural spots in ${city} and discuss your favorite discoveries.` },
      { title: "Sunset Picnic", description: `Find a beautiful spot in ${city} to watch the sunset together with your favorite snacks.` },
      { title: "Farmers Market Date", description: `Explore the local farmers market in ${city} and cook a meal together with fresh ingredients.` },
      { title: "Coffee Shop Hopping", description: `Discover cozy coffee shops around ${city} and spend the day talking and people-watching.` }
    ],
    restaurants: [
      { name: "Local Italian Spot", description: `Find a cozy Italian restaurant in ${city} known for homemade pasta and intimate atmosphere.` },
      { name: "Farm-to-Table Restaurant", description: `Look for a restaurant in ${city} that focuses on fresh, local ingredients and seasonal menus.` },
      { name: "Rooftop Bar & Grill", description: `Find a rooftop restaurant in ${city} with great views and a romantic setting for dinner.` }
    ]
  };

  const cityKey = Object.keys(cityIdeas).find(key => 
    city.toLowerCase().includes(key.toLowerCase())
  );

  if (cityKey) {
    const cityData = cityIdeas[cityKey];
    // Return 3 random ideas and restaurants
    const shuffledIdeas = cityData.ideas.sort(() => 0.5 - Math.random()).slice(0, 3);
    const shuffledRestaurants = cityData.restaurants.sort(() => 0.5 - Math.random()).slice(0, 3);
    return { ideas: shuffledIdeas, restaurants: shuffledRestaurants };
  }

  // Fallback to default ideas
  const shuffledIdeas = defaultIdeas.ideas.sort(() => 0.5 - Math.random()).slice(0, 3);
  const shuffledRestaurants = defaultIdeas.restaurants.sort(() => 0.5 - Math.random()).slice(0, 3);
  return { ideas: shuffledIdeas, restaurants: shuffledRestaurants };
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

    for (const relationship of relationships) {
      try {
        const user = relationship.profiles;
        if (!user.email) {
          console.log(`Skipping relationship ${relationship.id} - no email address`);
          continue;
        }

        // Check if we've already sent date ideas this week
        const { data: existingLog, error: logError } = await supabase
          .from('date_idea_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('relationship_id', relationship.id)
          .eq('week_of', weekOf)
          .maybeSingle();

        if (logError && logError.code !== 'PGRST116') {
          console.error('Error checking date idea logs:', logError);
          continue;
        }

        if (existingLog) {
          console.log(`Already sent date ideas to ${user.email} for relationship ${relationship.name} this week`);
          continue;
        }

        // Generate date ideas
        const { ideas: dateIdeas, restaurants } = generateDateIdeas(user.city || 'your city');
        
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

            <h2 style="color: #e91e63; margin-bottom: 15px; font-size: 22px;">Creative and Affordable Date Ideas in ${user.city || 'Your City'}</h2>
            
            <div style="margin-bottom: 30px;">
              ${dateIdeas.map((idea, index) => `
                <div style="margin-bottom: 15px;">
                  <h3 style="color: #333; margin: 0 0 5px 0; font-size: 18px; font-weight: bold;">${idea.title}:</h3>
                  <p style="color: #666; margin: 0; line-height: 1.5; font-size: 16px;">${idea.description}</p>
                </div>
              `).join('')}
            </div>

            <h2 style="color: #e91e63; margin-bottom: 15px; font-size: 22px;">Affordable Restaurants in ${user.city || 'Your City'} Perfect for a Date</h2>
            
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

        // Log the sent email
        const { error: insertLogError } = await supabase
          .from('date_idea_logs')
          .insert({
            user_id: user.id,
            relationship_id: relationship.id,
            week_of: weekOf,
          });

        if (insertLogError) {
          console.error('Error inserting date idea log:', insertLogError);
          errors.push(`Failed to log email for ${user.email}: ${insertLogError.message}`);
        } else {
          emailsSent++;
        }

      } catch (error) {
        console.error(`Error processing relationship ${relationship.id}:`, error);
        errors.push(`Failed to process relationship ${relationship.id}: ${error.message}`);
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);