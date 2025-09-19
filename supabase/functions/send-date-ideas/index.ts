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
  category: string;
  estimatedCost: string;
}

const generateDateIdeas = (city: string, partnerName: string): DateIdea[] => {
  const ideas = [
    {
      title: `Explore ${city}'s Hidden Gems`,
      description: `Take a walking tour through lesser-known neighborhoods in ${city}. Discover local cafes, street art, and unique shops together.`,
      category: "Adventure",
      estimatedCost: "$20-40"
    },
    {
      title: "Cooking Class Date Night",
      description: `Find a local cooking class in ${city} or cook a new cuisine together at home. Perfect for learning something new with ${partnerName}.`,
      category: "Culinary",
      estimatedCost: "$50-100"
    },
    {
      title: "Sunset/Sunrise Experience",
      description: `Find the best spot in ${city} to watch the sunset or sunrise together. Bring a thermos of coffee or wine to share.`,
      category: "Romantic",
      estimatedCost: "$10-25"
    },
    {
      title: "Local Museum or Art Gallery",
      description: `Visit a museum or art gallery in ${city}. Many have special evening hours or wine tastings that make for perfect date nights.`,
      category: "Cultural",
      estimatedCost: "$30-60"
    },
    {
      title: "Farmers Market + Picnic",
      description: `Visit ${city}'s farmers market, pick out fresh ingredients, then create a picnic in a nearby park.`,
      category: "Outdoors",
      estimatedCost: "$25-50"
    },
    {
      title: "Live Music Venue",
      description: `Check out local venues in ${city} for live music. From jazz clubs to indie concerts, discover new artists together.`,
      category: "Entertainment",
      estimatedCost: "$40-80"
    }
  ];

  // Return 3 random ideas
  const shuffled = ideas.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
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
        const dateIdeas = generateDateIdeas(user.city || 'your city', relationship.name);
        
        // Create email HTML
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #e11d48; margin-bottom: 20px;">💕 Date Night Ideas for You & ${relationship.name}</h1>
            
            <p style="color: #6b7280; margin-bottom: 30px;">
              Hey ${user.full_name || 'there'}! Here are some specially curated date night ideas for this week:
            </p>

            <div style="space-y: 20px;">
              ${dateIdeas.map((idea, index) => `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <h3 style="color: #dc2626; margin: 0; font-size: 18px;">${idea.title}</h3>
                    <span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px;">${idea.category}</span>
                  </div>
                  <p style="color: #6b7280; margin: 10px 0; line-height: 1.5;">${idea.description}</p>
                  <p style="color: #059669; font-weight: bold; margin: 0;">Estimated Cost: ${idea.estimatedCost}</p>
                </div>
              `).join('')}
            </div>

            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-top: 30px;">
              <h4 style="color: #374151; margin-top: 0;">💡 Pro Tip</h4>
              <p style="color: #6b7280; margin-bottom: 0;">
                The best dates are about spending quality time together. Pick the idea that excites you both the most, 
                or use these as inspiration to create your own unique experience!
              </p>
            </div>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
              You're receiving this because you opted in for weekly date night ideas. 
              You can manage your preferences in your relationship settings.
            </p>
          </div>
        `;

        // Send email
        const emailResponse = await resend.emails.send({
          from: 'Careloom <hello@careloom.com>',
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