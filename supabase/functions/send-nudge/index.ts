
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NudgeRequest {
  userId: string;
  userEmail: string;
  userName: string;
  partnerName?: string;
  city?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to verify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client with the user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('Authenticated user email:', user.email);

    const { userId, userName, partnerName, city }: NudgeRequest = await req.json();

    // Use the authenticated user's email instead of the one from the request
    const userEmail = user.email!;

    // Generate personalized date ideas
    const dateIdeas = [
      city ? `Explore the local farmers market in ${city} together and cook a meal with fresh ingredients` : "Explore a local farmers market together and cook a meal with fresh ingredients",
      city ? `Take a sunset walk through ${city}'s most beautiful park or waterfront` : "Take a sunset walk through your city's most beautiful area",
      city ? `Visit a cozy bookstore café in ${city} and read to each other` : "Visit a cozy bookstore café and read to each other"
    ];

    // Generate restaurant suggestions
    const restaurants = [
      city ? `Search for the highest-rated Italian restaurant in ${city} for a romantic dinner` : "Find a highly-rated Italian restaurant for a romantic dinner",
      city ? `Discover a charming brunch spot in ${city} for a lazy weekend morning` : "Discover a charming brunch spot for a lazy weekend morning",
      city ? `Try the most popular dessert place in ${city} for a sweet date` : "Try a popular dessert place for a sweet date"
    ];

    const partnerText = partnerName ? ` and ${partnerName}` : "";

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fefcfa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #9d4e65; font-size: 28px; margin-bottom: 10px;">🎁 Your Personalized Nudge</h1>
          <p style="color: #c08862; font-size: 16px;">Thoughtful date ideas just for you${partnerText}</p>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(157, 78, 101, 0.1);">
          <h2 style="color: #9d4e65; font-size: 20px; margin-bottom: 15px;">💕 Date Ideas</h2>
          ${dateIdeas.map((idea, index) => `
            <div style="margin-bottom: 12px; padding: 12px; background: #fdf2f4; border-radius: 8px; border-left: 3px solid #db889b;">
              <strong style="color: #9d4e65;">${index + 1}.</strong> <span style="color: #4c333e;">${idea}</span>
            </div>
          `).join('')}
        </div>

        <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(157, 78, 101, 0.1);">
          <h2 style="color: #9d4e65; font-size: 20px; margin-bottom: 15px;">🍽️ Restaurant Ideas</h2>
          ${restaurants.map((restaurant, index) => `
            <div style="margin-bottom: 12px; padding: 12px; background: #fdf2f4; border-radius: 8px; border-left: 3px solid #db889b;">
              <strong style="color: #9d4e65;">${index + 1}.</strong> <span style="color: #4c333e;">${restaurant}</span>
            </div>
          `).join('')}
        </div>

        <div style="text-align: center; padding: 20px; background: #f9e4e8; border-radius: 12px;">
          <p style="color: #9d4e65; font-size: 14px; margin: 0;">
            💌 This is just a taste of Careloom's magic. We'll help you never miss a moment to show love!
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #8b7479; font-size: 12px;">
            Sent with love from Careloom 💕
          </p>
        </div>
      </div>
    `;

    console.log('Sending email to:', userEmail);

    const emailResponse = await resend.emails.send({
      from: "Careloom <careloom@resend.dev>",
      to: [userEmail],
      subject: "🎁 Your Personalized Date Ideas from Careloom",
      html: emailHtml,
    });

    console.log("Nudge email sent successfully:", emailResponse);

    // Record this as a thoughtful action
    await supabase
      .from('thoughtful_actions')
      .insert({
        user_id: userId,
        action_type: 'nudge_requested',
        action_description: 'Requested personalized date ideas via email nudge'
      });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-nudge function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
